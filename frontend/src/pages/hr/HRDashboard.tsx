/**
 * HR Dashboard
 */
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { expensesApi } from '@/api/expenses.api';
import { formatCurrency } from '@/utils/formatters';
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
} from 'recharts';
import { Receipt, CheckCircle, XCircle, Clock } from 'lucide-react';

export const HRDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['hr-all-expenses'],
    queryFn: () => expensesApi.getAllExpenses(),
  });

  const expenses = data?.data.expenses || [];

  // Calculate statistics
  const stats = {
    total: expenses.length,
    pending: expenses.filter((e) => e.status === 'pending').length,
    approved: expenses.filter((e) => e.status === 'approved').length,
    rejected: expenses.filter((e) => e.status === 'rejected').length,
    totalAmount: expenses.reduce((sum, exp) => {
      const amount = exp.extracted_data['Bill Amount (INR)'] || exp.extracted_data['Bill Amount'] || '0';
      const numAmount = parseFloat(amount.toString().replace(/[₹$€£¥,]/g, '')) || 0;
      return sum + numAmount;
    }, 0),
  };

  // Monthly data for chart
  const monthlyData = expenses.reduce((acc: any, exp) => {
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

  // Category data
  const categoryData = expenses.reduce((acc: any, exp) => {
    const type = exp.extracted_data['Bill Type'] || 'other';
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

  const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'];

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of all expense submissions</p>
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
                <p className="text-sm text-gray-600">Pending Review</p>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Spend Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Expenses
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="amount" fill="#0ea5e9" name="Amount (INR)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Category Distribution
            </h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

