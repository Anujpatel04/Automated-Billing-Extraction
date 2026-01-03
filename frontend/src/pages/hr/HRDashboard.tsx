/**
 * HR Dashboard - Professional & Modern Design
 */
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { expensesApi } from '@/api/expenses.api';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
import {
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Activity,
  Percent,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HRDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['hr-all-expenses'],
    queryFn: () => expensesApi.getAllExpenses(),
  });

  const expenses = data?.data.expenses || [];

  // Calculate comprehensive statistics
  const approvedExpenses = expenses.filter((e) => e.status === 'approved');
  const pendingExpenses = expenses.filter((e) => e.status === 'pending');
  const rejectedExpenses = expenses.filter((e) => e.status === 'rejected');

  const totalAmount = approvedExpenses.reduce((sum, exp) => {
    const amount = exp.extracted_data['Bill Amount (INR)'] || exp.extracted_data['Bill Amount'] || '0';
    const numAmount = parseFloat(amount.toString().replace(/[₹$€£¥,]/g, '')) || 0;
    return sum + numAmount;
  }, 0);

  const rejectedAmount = rejectedExpenses.reduce((sum, exp) => {
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
    rejectedAmount,
    pendingAmount,
    approvalRate: expenses.length > 0 ? ((approvedExpenses.length / expenses.length) * 100).toFixed(1) : '0',
    rejectionRate: expenses.length > 0 ? ((rejectedExpenses.length / expenses.length) * 100).toFixed(1) : '0',
    averageExpense: approvedExpenses.length > 0 ? totalAmount / approvedExpenses.length : 0,
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

  // Top users by expense count
  const userExpenseCount = expenses.reduce((acc: any, exp) => {
    const email = exp.user_email || 'Unknown';
    if (acc[email]) {
      acc[email].count++;
      const amount = parseFloat(
        (exp.extracted_data['Bill Amount (INR)'] || exp.extracted_data['Bill Amount'] || '0')
          .toString()
          .replace(/[₹$€£¥,]/g, '')
      ) || 0;
      acc[email].totalAmount += amount;
    } else {
      const amount = parseFloat(
        (exp.extracted_data['Bill Amount (INR)'] || exp.extracted_data['Bill Amount'] || '0')
          .toString()
          .replace(/[₹$€£¥,]/g, '')
      ) || 0;
      acc[email] = { count: 1, totalAmount: amount };
    }
    return acc;
  }, {});

  const topUsers = Object.entries(userExpenseCount)
    .map(([email, data]: [string, any]) => ({
      email,
      count: data.count,
      totalAmount: data.totalAmount,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent expenses (last 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

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
            <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive overview of expense management</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/hr/expenses')}
            className="flex items-center gap-2"
          >
            Review Expenses
            <ArrowRight className="w-4 h-4" />
          </Button>
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
                <p className="text-xs text-gray-500">{stats.rejectionRate}% rejection rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Percent className="w-5 h-5 text-blue-600" />
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
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
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
                  <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
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
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No expense data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution & Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
                <p className="text-sm text-gray-500 mt-1">Expenses by category</p>
              </div>
              <Receipt className="w-5 h-5 text-gray-400" />
            </div>
            {pieData.length > 0 ? (
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No category data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Top Users */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
                <p className="text-sm text-gray-500 mt-1">Users with most expenses</p>
              </div>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            {topUsers.length > 0 ? (
              <div className="space-y-4">
                {topUsers.map((user, index) => (
                  <div
                    key={user.email}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-700">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.count} expenses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(user.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No user data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

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
              onClick={() => navigate('/hr/expenses')}
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
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentExpenses.map((expense) => {
                    const extracted = expense.extracted_data || {};
                    return (
                      <tr key={expense.expense_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {expense.user_email || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(extracted.Date || expense.created_at)}
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {extracted['Bill Type'] || 'Other'}
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
              <p>No recent expenses</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
