/**
 * Employee Dashboard - Professional & Modern Design
 */
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { expensesApi } from '@/api/expenses.api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Upload,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  DollarSign,
  FileText,
  ArrowRight,
  Activity,
  Calendar,
  MessageSquare,
  Eye,
} from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToastContext } from '@/components/ui/ToastProvider';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const UserDashboard = () => {
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const { showSuccess, showError } = useToastContext();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user-expenses'],
    queryFn: () => expensesApi.getMyExpenses(),
  });

  const expenses = data?.data.expenses || [];
  const approvedExpenses = expenses.filter((e) => e.status === 'approved');
  const pendingExpenses = expenses.filter((e) => e.status === 'pending');
  const rejectedExpenses = expenses.filter((e) => e.status === 'rejected');

  const totalAmount = approvedExpenses.reduce((sum, exp) => {
    const amount = exp.extracted_data['Bill Amount (INR)'] || exp.extracted_data['Bill Amount'] || '0';
    const numAmount = parseFloat(amount.toString().replace(/[₹$€£¥,]/g, '')) || 0;
    return sum + numAmount;
  }, 0);

  const pendingAmount = pendingExpenses.reduce((sum, exp) => {
    const amount = exp.extracted_data['Bill Amount (INR)'] || exp.extracted_data['Bill Amount'] || '0';
    const numAmount = parseFloat(amount.toString().replace(/[₹$€£¥,]/g, '')) || 0;
    return sum + numAmount;
  }, 0);

  const stats = {
    total: expenses.length,
    pending: pendingExpenses.length,
    approved: approvedExpenses.length,
    rejected: rejectedExpenses.length,
    totalAmount,
    pendingAmount,
    averageExpense: approvedExpenses.length > 0 ? totalAmount / approvedExpenses.length : 0,
    approvalRate: expenses.length > 0 ? ((approvedExpenses.length / expenses.length) * 100).toFixed(1) : '0',
  };

  // Monthly data for chart (only approved expenses)
  const monthlyData = approvedExpenses.reduce((acc: any, exp) => {
    const date = new Date(exp.created_at);
    const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const amount = parseFloat(
      (exp.extracted_data['Bill Amount (INR)'] || exp.extracted_data['Bill Amount'] || '0')
        .toString()
        .replace(/[₹$€£¥,]/g, '')
    ) || 0;
    
    if (acc[month]) {
      acc[month] += amount;
    } else {
      acc[month] = amount;
    }
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData)
    .map(([month, amount]) => ({ month, amount: Number(amount) }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Status distribution for pie chart
  const statusData = [
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Category data (only approved expenses)
  const categoryData = approvedExpenses.reduce((acc: any, exp) => {
    const type = exp.extracted_data['Bill Type'] || 'Other';
    if (acc[type]) {
      acc[type]++;
    } else {
      acc[type] = 1;
    }
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

  // Recent expenses (last 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

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
      
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            if (progressInterval) clearInterval(progressInterval);
            return 85;
          }
          return prev + 10;
        });
      }, 300);

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
      
      let errorMessage = 'Failed to upload bill';
      
      if (error.response?.data) {
        const apiError = error.response.data;
        if (apiError.message) {
          errorMessage = apiError.message;
          if (errorMessage.includes('\n')) {
            errorMessage = errorMessage.split('\n')[0];
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

  const getImageUrl = (imagePath: string) => {
    const path = imagePath.replace('uploads/expenses/', '');
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/files/${path}`;
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-1">Track and manage your expense submissions</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/expenses')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View All
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Expense
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Expenses Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Expenses</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
                <p className="text-xs text-blue-600 mt-1">All submissions</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Receipt className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Pending Review Card */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Pending Review</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">{stats.pending}</p>
                <p className="text-xs text-amber-600 mt-1">{formatCurrency(stats.pendingAmount)} pending</p>
              </div>
              <div className="bg-amber-500 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Approved Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Approved</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{stats.approved}</p>
                <p className="text-xs text-green-600 mt-1">{stats.approvalRate}% approval rate</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Amount Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Approved</p>
                <p className="text-2xl font-bold text-purple-900 mt-2">
                  {formatCurrency(stats.totalAmount)}
                </p>
                <p className="text-xs text-purple-600 mt-1">Avg: {formatCurrency(stats.averageExpense)}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-xs text-gray-500">Requires attention</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-xl font-bold text-gray-900">{stats.approvalRate}%</p>
                <p className="text-xs text-gray-500">Based on all expenses</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Expense</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(stats.averageExpense)}
                </p>
                <p className="text-xs text-gray-500">Per approved expense</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Expenses Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Expenses Trend</h3>
                <p className="text-sm text-gray-500 mt-1">Approved expenses over time</p>
              </div>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    dot={{ fill: '#0ea5e9', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Amount (INR)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No expense data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
                <p className="text-sm text-gray-500 mt-1">Breakdown by status</p>
              </div>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No expense data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        {pieData.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
                <p className="text-sm text-gray-500 mt-1">Expenses by category</p>
              </div>
              <Receipt className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#0ea5e9" 
                  radius={[8, 8, 0, 0]}
                  name="Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Expenses */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
              <p className="text-sm text-gray-500 mt-1">Latest expense submissions</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/expenses')}
              className="flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentExpenses.map((expense) => {
                    const extracted = expense.extracted_data || {};
                    return (
                      <tr key={expense.expense_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(extracted.Date || expense.created_at)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {extracted.Details || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(
                            extracted['Bill Amount (INR)'] ||
                              extracted['Bill Amount'] ||
                              '0'
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedExpense(expense)}
                              className="text-primary-600 hover:text-primary-800 flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            {expense.hr_notes && (
                              <span 
                                className="text-xs text-blue-600 flex items-center gap-1" 
                                title="HR has left notes"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
              <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No expenses yet. Upload your first bill to get started.</p>
              <Button
                variant="primary"
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-4 flex items-center gap-2 mx-auto"
              >
                <Upload className="w-4 h-4" />
                Upload Expense
              </Button>
            </div>
          )}
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

      {/* Expense Detail Modal */}
      <Modal
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        title="Expense Details"
        size="xl"
      >
        {selectedExpense && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Bill Image</h3>
                <img
                  src={getImageUrl(selectedExpense.image_path)}
                  alt="Bill"
                  className="w-full h-64 object-contain border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge
                    variant={
                      selectedExpense.status === 'approved'
                        ? 'success'
                        : selectedExpense.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                    className="mt-1"
                  >
                    {selectedExpense.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedExpense.extracted_data?.Date || '')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                  <p className="mt-1 text-sm text-gray-900 font-semibold">
                    {formatCurrency(
                      selectedExpense.extracted_data?.['Bill Amount (INR)'] ||
                        selectedExpense.extracted_data?.['Bill Amount'] ||
                        '0'
                    )}
                  </p>
                </div>
                {selectedExpense.extracted_data?.['Bill Type'] && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedExpense.extracted_data['Bill Type']}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {selectedExpense.hr_notes && (
              <div className={`border rounded-lg p-4 ${
                selectedExpense.status === 'approved' 
                  ? 'bg-green-50 border-green-200' 
                  : selectedExpense.status === 'rejected'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-2">
                  <MessageSquare className={`w-5 h-5 mt-0.5 ${
                    selectedExpense.status === 'approved'
                      ? 'text-green-600'
                      : selectedExpense.status === 'rejected'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold mb-2 ${
                      selectedExpense.status === 'approved'
                        ? 'text-green-900'
                        : selectedExpense.status === 'rejected'
                        ? 'text-red-900'
                        : 'text-blue-900'
                    }`}>
                      HR Notes
                    </h3>
                    <p className={`text-sm whitespace-pre-wrap ${
                      selectedExpense.status === 'approved'
                        ? 'text-green-800'
                        : selectedExpense.status === 'rejected'
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }`}>
                      {selectedExpense.hr_notes}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Extracted Data</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(selectedExpense.extracted_data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
};
