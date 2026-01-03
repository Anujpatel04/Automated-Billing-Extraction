/**
 * HR Expense Review Page
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { expensesApi } from '@/api/expenses.api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Eye, CheckCircle, XCircle, MessageSquare, Clock } from 'lucide-react';
import { useState } from 'react';
import { useToastContext } from '@/components/ui/ToastProvider';

export const HRExpenses = () => {
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    user_id: '',
  });
  const { showSuccess, showError } = useToastContext();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['hr-all-expenses', filters],
    queryFn: () => expensesApi.getAllExpenses(filters.status || undefined),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ expenseId, status, notes }: { expenseId: string; status: 'approved' | 'rejected' | 'pending'; notes?: string }) =>
      expensesApi.updateStatus(expenseId, status, notes),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hr-all-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['user-expenses'] });
      setSelectedExpense(null);
      setNotes('');
      const statusMessages: Record<string, string> = {
        'approved': 'approved',
        'rejected': 'rejected',
        'pending': 'set to pending'
      };
      showSuccess(`Expense ${statusMessages[variables.status]} successfully!`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to update expense status';
      showError(errorMessage);
    },
  });

  const expenses = data?.data.expenses || [];

  const handleStatusChange = (expenseId: string, status: 'approved' | 'rejected' | 'pending') => {
    updateStatusMutation.mutate({ expenseId, status, notes: notes.trim() || undefined });
  };

  const getImageUrl = (imagePath: string) => {
    const path = imagePath.replace('uploads/expenses/', '');
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/files/${path}`;
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Expenses</h1>
            <p className="text-gray-600 mt-1">Approve or reject expense submissions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
            <div className="text-center py-12 text-gray-500">No expenses found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.user_email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(extracted.Date || '')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {extracted.Details || '-'}
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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedExpense(expense);
                                setNotes('');
                              }}
                              className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            {expense.hr_notes && (
                              <span className="text-xs text-gray-500 flex items-center gap-1" title="Has notes">
                                <MessageSquare className="w-3 h-3" />
                              </span>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedExpense(expense);
                                setNotes(expense.hr_notes || '');
                              }}
                              disabled={updateStatusMutation.isPending}
                              className="flex items-center gap-1"
                            >
                              Change Status
                            </Button>
                          </div>
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
        onClose={() => {
          setSelectedExpense(null);
          setNotes('');
        }}
        title="Expense Review"
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
                  <h3 className="text-sm font-medium text-gray-500">User</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedExpense.user_email || '-'}
                  </p>
                </div>
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
            
            {selectedExpense.hr_notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">HR Notes</h3>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{selectedExpense.hr_notes}</p>
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

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for the employee (e.g., reason for status change, additional information...)"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  These notes will be visible to the employee
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Change Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={selectedExpense.status === 'approved' ? 'success' : 'outline'}
                    onClick={() => handleStatusChange(selectedExpense.expense_id, 'approved')}
                    disabled={updateStatusMutation.isPending || selectedExpense.status === 'approved'}
                    className="flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    variant={selectedExpense.status === 'rejected' ? 'danger' : 'outline'}
                    onClick={() => handleStatusChange(selectedExpense.expense_id, 'rejected')}
                    disabled={updateStatusMutation.isPending || selectedExpense.status === 'rejected'}
                    className="flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(selectedExpense.expense_id, 'pending')}
                    disabled={updateStatusMutation.isPending || selectedExpense.status === 'pending'}
                    className={`flex items-center justify-center gap-2 ${
                      selectedExpense.status === 'pending' 
                        ? 'border-yellow-500 text-yellow-700 bg-yellow-50' 
                        : ''
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Set Pending
                  </Button>
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Current status: <span className="font-medium capitalize">{selectedExpense.status}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
};

