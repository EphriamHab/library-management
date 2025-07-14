/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
    BookOpen,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Loader
} from 'lucide-react';
import { useGetMyLoansQuery, useRenewLoanMutation } from '../../store/api';
import { toast } from 'react-toastify';

const MyLoansPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [filterType, setFilterType] = useState('');

    const { data: loansData, isLoading, refetch } = useGetMyLoansQuery({
        page: currentPage,
        limit: 10,
        status: statusFilter,
        filter: filterType
    });

    const [renewLoan, { isLoading: isRenewing }] = useRenewLoanMutation();

    const handleRenewLoan = async (loanId: string) => {
        try {
            await renewLoan({ loan_id: loanId }).unwrap();
            toast.success("Loan renew successfully")
            refetch();

        } catch (error: any) {
            toast.error(error?.data?.message ?? "Error in renew the loan");
        }
    };

    const getStatusColor = (loan: any) => {
        if (loan.status === 'Returned') return 'bg-gray-100 text-gray-800';
        if (loan.is_overdue) return 'bg-red-100 text-red-800';
        if (loan.days_until_due <= 3) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const getStatusText = (loan: any) => {
        if (loan.status === 'Returned') return 'Returned';
        if (loan.is_overdue) return `Overdue (${loan.overdue_days} days)`;
        if (loan.days_until_due <= 3) return `Due in ${loan.days_until_due} days`;
        return 'Active';
    };

    const loans = loansData?.message?.data || [];
    const pagination = loansData?.message?.pagination;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
                    <p className="text-gray-600">Track your borrowed books and due dates</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Returned">Returned</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Loans</option>
                            <option value="overdue">Overdue Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loans List */}
            <div className="bg-white rounded-lg shadow-sm border">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Your Loans ({pagination?.total || 0})
                            </h2>

                            <div className="space-y-4">
                                {loans.map((loan: any) => (
                                    <div
                                        key={loan.name}
                                        className={`border rounded-lg p-4 ${loan.is_overdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-start space-x-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900 mb-1">
                                                            {loan.book_title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            by {loan.book_author}
                                                        </p>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>Borrowed: {new Date(loan.loan_date).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Clock className="w-4 h-4" />
                                                                <span>Due: {new Date(loan.return_date).toLocaleDateString()}</span>
                                                            </div>
                                                            {loan.actual_return_date && (
                                                                <div className="flex items-center space-x-1">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    <span>Returned: {new Date(loan.actual_return_date).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end space-y-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan)}`}>
                                                            {getStatusText(loan)}
                                                        </span>

                                                        {loan.status === 'Active' && !loan.is_overdue && (
                                                            <button
                                                                onClick={() => handleRenewLoan(loan.name)}
                                                                disabled={isRenewing}
                                                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50 cursor-pointer"
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                                <span>{isRenewing ? <Loader /> : 'Renew'}</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {loan.is_overdue && (
                                                    <div className="mt-3 flex items-center space-x-2 text-red-600">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span className="text-sm font-medium">
                                                            This book is {loan.overdue_days} days overdue. Please return it as soon as possible.
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {loans.length === 0 && !isLoading && (
                                <div className="text-center py-12">
                                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No loans found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {statusFilter || filterType ? 'Try adjusting your filters' : 'Start by browsing and borrowing books'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="border-t px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-3 py-1 bg-blue-600 text-white rounded">
                                            {currentPage}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === pagination.pages}
                                            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyLoansPage;
