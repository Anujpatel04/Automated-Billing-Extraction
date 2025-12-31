let currentSessionId = null;
let currentFileName = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupFileUpload();
});

// Setup file upload
function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const uploadButton = document.getElementById('uploadButton');
    
    // Button click - stop propagation to prevent double trigger
    uploadButton.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    
    // Click on upload area (but not on button)
    uploadArea.addEventListener('click', (e) => {
        // Only trigger if click is not on the button
        if (e.target !== uploadButton && !uploadButton.contains(e.target)) {
            fileInput.click();
        }
    });
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect({ target: fileInput });
        }
    });
}

// Handle file selection
async function handleFileSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Handle multiple files or single file
    const file = files[0];
    
    // Validate file type
    const validExtensions = ['.zip', '.pdf', '.png', '.jpg', '.jpeg'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
        showToast('Please upload a ZIP file, PDF, or image (PNG, JPG, JPEG)', 'error');
        return;
    }
    
    // Update icon based on file type
    const uploadIcon = document.getElementById('uploadIcon');
    if (fileExtension === '.zip' || fileExtension === '.pdf') {
        uploadIcon.className = 'fas fa-file-archive';
    } else {
        uploadIcon.className = 'fas fa-image';
    }
    
    currentFileName = file.name;
    showFileInfo(file.name);
    showLoading(true);
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentSessionId = data.session_id;
            showToast(`File uploaded successfully! Found ${data.count} image(s)`, 'success');
            showUploadedFiles(data.files);
        } else {
            showToast(data.error || 'Upload failed', 'error');
            removeFile();
        }
    } catch (error) {
        showToast('Error uploading file: ' + error.message, 'error');
        removeFile();
    } finally {
        showLoading(false);
    }
}

// Show file info
function showFileInfo(fileName) {
    const fileInfo = document.getElementById('fileInfo');
    const fileNameSpan = document.getElementById('fileName');
    
    fileNameSpan.textContent = fileName;
    fileInfo.classList.remove('hidden');
}

// Remove file
function removeFile() {
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('submitSection').classList.add('hidden');
    document.getElementById('processingSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    // Reset icon to default
    const uploadIcon = document.getElementById('uploadIcon');
    uploadIcon.className = 'fas fa-file-archive';
    currentSessionId = null;
    currentFileName = null;
}

// Show uploaded files with submit button
function showUploadedFiles(files) {
    const submitSection = document.getElementById('submitSection');
    const uploadedFilesList = document.getElementById('uploadedFilesList');
    
    uploadedFilesList.innerHTML = '';
    
    if (files.length > 0) {
        const filesHeader = document.createElement('div');
        filesHeader.className = 'files-header';
        filesHeader.innerHTML = `<strong>Uploaded Files (${files.length}):</strong>`;
        uploadedFilesList.appendChild(filesHeader);
        
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-file-image"></i>
                <span>${file}</span>
            `;
            uploadedFilesList.appendChild(fileItem);
        });
    }
    
    submitSection.classList.remove('hidden');
    submitSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Submit for processing
function submitForProcessing() {
    if (!currentSessionId) {
        showToast('No files uploaded', 'error');
        return;
    }
    
    // Hide submit section and show processing section
    document.getElementById('submitSection').classList.add('hidden');
    showProcessingSection([]);
    processFiles();
}

// Show processing section
function showProcessingSection(files) {
    const processingSection = document.getElementById('processingSection');
    const fileList = document.getElementById('fileList');
    
    fileList.innerHTML = '';
    if (files && files.length > 0) {
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-file-image"></i>
                <span>${file}</span>
            `;
            fileList.appendChild(fileItem);
        });
    }
    
    processingSection.classList.remove('hidden');
    updateProgress(0, 'Starting processing...');
}

// Process files
async function processFiles() {
    if (!currentSessionId) return;
    
    showLoading(true);
    updateProgress(20, 'Extracting text from images...');
    
    try {
        const response = await fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: currentSessionId
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            updateProgress(100, 'Processing complete!');
            setTimeout(() => {
                showResults(data.data);
                showLoading(false);
            }, 500);
        } else {
            showToast(data.error || 'Processing failed', 'error');
            showLoading(false);
        }
    } catch (error) {
        showToast('Error processing files: ' + error.message, 'error');
        showLoading(false);
    }
}

// Show results
function showResults(data) {
    const resultsSection = document.getElementById('resultsSection');
    const tableBody = document.getElementById('tableBody');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultsSummary = document.getElementById('resultsSummary');
    
    // Calculate statistics
    const totalBills = data.length;
    let totalAmount = 0;
    const billTypes = { food: 0, flight: 0, cab: 0 };
    
    data.forEach(row => {
        const amountStr = row['Bill Amount (INR)'] || row['Bill Amount'] || '0';
        const amount = parseFloat(amountStr.replace(/[₹$€£¥,]/g, '')) || 0;
        totalAmount += amount;
        
        const billType = (row['Bill Type'] || '').toLowerCase();
        if (billTypes.hasOwnProperty(billType)) {
            billTypes[billType]++;
        }
    });
    
    // Update header stats
    updateHeaderStats(totalBills, totalAmount);
    
    // Show results summary
    resultsSummary.innerHTML = `
        <div class="summary-card">
            <span class="value">${totalBills}</span>
            <span class="label">Total Bills</span>
        </div>
        <div class="summary-card">
            <span class="value">₹${totalAmount.toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
            <span class="label">Total Amount</span>
        </div>
        <div class="summary-card">
            <span class="value">${billTypes.food}</span>
            <span class="label">Food Bills</span>
        </div>
        <div class="summary-card">
            <span class="value">${billTypes.flight + billTypes.cab}</span>
            <span class="label">Travel Bills</span>
        </div>
    `;
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Populate table
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.Date || '-'}</td>
            <td>${row.Time || '-'}</td>
            <td>${row['Time (AM/PM)'] || '-'}</td>
            <td><span class="badge badge-${row['Bill Type']}">${row['Bill Type'] || '-'}</span></td>
            <td>${row['Currency Name'] || '-'}</td>
            <td>${row['Bill Amount'] || '-'}</td>
            <td>${row['Bill Amount (INR)'] || '-'}</td>
            <td>${row.Details || '-'}</td>
        `;
        tableBody.appendChild(tr);
    });
    
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    showToast(`Successfully extracted ${data.length} bill(s)!`, 'success');
}

// Update header statistics
function updateHeaderStats(bills, amount) {
    const totalBillsEl = document.getElementById('totalBills');
    const totalAmountEl = document.getElementById('totalAmount');
    
    if (totalBillsEl) {
        animateValue(totalBillsEl, 0, bills, 1000);
    }
    
    if (totalAmountEl) {
        animateValue(totalAmountEl, 0, amount, 1000, true);
    }
}

// Animate number value
function animateValue(element, start, end, duration, isCurrency = false) {
    const startTime = performance.now();
    const prefix = isCurrency ? '₹' : '';
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        
        if (isCurrency) {
            element.textContent = prefix + current.toLocaleString('en-IN', {maximumFractionDigits: 2});
        } else {
            element.textContent = current;
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (isCurrency) {
                element.textContent = prefix + end.toLocaleString('en-IN', {maximumFractionDigits: 2});
            } else {
                element.textContent = end;
            }
        }
    }
    
    requestAnimationFrame(update);
}

// Update progress
function updateProgress(percent, text) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = percent + '%';
    progressText.textContent = text;
}

// Download Excel
async function downloadExcel() {
    if (!currentSessionId) {
        showToast('No session available', 'error');
        return;
    }
    
    try {
        // Show loading state
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        const url = `/download/${currentSessionId}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = `expense_report_${currentSessionId}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Reset button after a short delay
        setTimeout(() => {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = originalText;
        }, 1000);
        
        showToast('Download started!', 'success');
    } catch (error) {
        showToast('Error downloading file: ' + error.message, 'error');
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Excel';
    }
}

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

// Toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 5000);
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: capitalize;
    }
    
    .badge-food {
        background: #dbeafe;
        color: #1e40af;
    }
    
    .badge-flight {
        background: #fef3c7;
        color: #92400e;
    }
    
    .badge-cab {
        background: #d1fae5;
        color: #065f46;
    }
`;
document.head.appendChild(style);

