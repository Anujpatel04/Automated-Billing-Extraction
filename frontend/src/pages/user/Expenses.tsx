/**
 * User Expenses Page
 */
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { expensesApi } from '@/api/expenses.api';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate, getStatusColor, getBillTypeColor } from '@/utils/formatters';
import { Eye, Receipt } from 'lucide-react';
import { useState } from 'react';

export const Expenses = () => {
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user-expenses', statusFilter],
    queryFn: () => expensesApi.getMyExpenses(statusFilter || undefined),
  });

  const expenses = data?.data.expenses || [];

  const handleViewDetails = (expense: any) => {
    setSelectedExpense(expense);
  };

  const getImageUrl = (imagePath: string) => {
    // Extract relative path
    const path = imagePath.replace('uploads/expenses/', '');
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/files/${path}`;
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
            <p className="text-gray-600 mt-1">View and track all your expense bills</p>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No expenses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => {
                    const extracted = expense.extracted_data || {};
                    return (
                      <tr key={expense.expense_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-gray-400" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(extracted.Date || '')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {extracted.Details || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {extracted['Bill Type'] && (
                            <Badge variant="info">
                              {extracted['Bill Type']}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(
                            extracted['Bill Amount (INR)'] ||
                              extracted['Bill Amount'] ||
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewDetails(expense)}
                            className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
              </div>
            </div>
            
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

