/**
 * User Dashboard
 */
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { expensesApi } from '@/api/expenses.api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Upload, Receipt, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, getStatusColor } from '@/utils/formatters';
import { useToastContext } from '@/components/ui/ToastProvider';

export const UserDashboard = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { showSuccess, showError } = useToastContext();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user-expenses'],
    queryFn: () => expensesApi.getMyExpenses(),
  });

  const expenses = data?.data.expenses || [];

  const stats = {
    total: expenses.length,
    pending: expenses.filter((e) => e.status === 'pending').length,
    approved: expenses.filter((e) => e.status === 'approved').length,
    totalAmount: expenses.reduce((sum, exp) => {
      const amount = exp.extracted_data['Bill Amount (INR)'] || exp.extracted_data['Bill Amount'] || '0';
      const numAmount = parseFloat(amount.toString().replace(/[₹$€£¥,]/g, '')) || 0;
      return sum + numAmount;
    }, 0),
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        showError('File size exceeds 10MB limit. Please upload a smaller file.');
        setIsUploading(false);
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        showError('Invalid file type. Please upload PNG, JPG, or PDF files only.');
        setIsUploading(false);
        return;
      }

      showSuccess('Uploading bill image...');
      
      // Simulate progress
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            if (progressInterval) clearInterval(progressInterval);
            return 85;
          }
          return prev + 10;
        });
      }, 300);

      // Upload and extract
      setUploadProgress(90);
      showSuccess('Processing image and extracting bill data...');
      
      const response = await expensesApi.upload(selectedFile);
      
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.success) {
        showSuccess('Bill uploaded and processed successfully!');
        
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          setUploadProgress(0);
          refetch();
        }, 1000);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(0);
      
      // Extract detailed error message
      let errorMessage = 'Failed to upload bill';
      
      if (error.response?.data) {
        const apiError = error.response.data;
        if (apiError.message) {
          errorMessage = apiError.message;
          // Format multi-line messages
          if (errorMessage.includes('\n')) {
            errorMessage = errorMessage.split('\n')[0]; // Show first line
          }
        } else if (apiError.error) {
          errorMessage = apiError.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 413) {
        errorMessage = 'File is too large. Maximum size is 10MB.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid file or bill data could not be extracted. Please ensure the image is clear and contains readable text.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      showError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your expense bills</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Expense
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Receipt className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No expenses yet. Upload your first bill to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.slice(0, 5).map((expense) => (
                      <tr key={expense.expense_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.extracted_data.Date || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.extracted_data.Details || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(
                            expense.extracted_data['Bill Amount (INR)'] ||
                              expense.extracted_data['Bill Amount'] ||
                              '0'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              expense.status === 'approved'
                                ? 'success'
                                : expense.status === 'rejected'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {expense.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => !isUploading && setIsUploadModalOpen(false)}
        title="Upload Expense Bill"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Bill Image
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Uploading and processing... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
              className="flex-1"
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

