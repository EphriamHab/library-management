/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo } from 'react';
import { useGetLoansQuery, useGetBooksQuery, useGetMembersQuery, useReturnBookMutation, useCreateLoanMutation } from '../../store/api';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';

import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  RotateCcw,
  Mail,
  Phone,
  BookOpen,
  User,
  X
} from 'lucide-react';
import type { Loan, Book, Member, EnhancedLoan } from '../../types';
import {toast} from 'react-toastify';

interface NewLoanFormData {
  book: string;
  member: string;
  loan_date: string;
  return_date: string;
}

const LoansPage: React.FC = () => {
  const { data: loansData, isLoading: loansLoading } = useGetLoansQuery();
  const { data: booksData } = useGetBooksQuery();
  const { data: membersData } = useGetMembersQuery();
  const [returnBook] = useReturnBookMutation();
  const [createLoan, { isLoading: isCreatingLoan }] = useCreateLoanMutation();
  const loans = loansData?.message?.data || [];
  const books = booksData?.message?.data || [];
  const members = membersData?.message?.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedLoan, setSelectedLoan] = useState<EnhancedLoan | null>(null);
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewLoanFormData>();

  // Enhanced loans with book and member details
  const enhancedLoans = useMemo(() => {
    return loans.map(loan => {
      const book = books.find(b => b.name === loan.book);
      const member = members.find(m => m.name === loan.member);
      const isOverdue = new Date(loan.return_date) < new Date() && loan.status === 'Active';
      const daysOverdue = isOverdue
        ? Math.floor((new Date().getTime() - new Date(loan.return_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        ...loan,
        book,
        member,
        isOverdue,
        daysOverdue,
        bookTitle: loan.book_title,
        memberName: loan.member_name,
        loanDate: loan.loan_date,
        returnDate: loan.return_date,
        actualReturnDate: loan.actual_return_date
      };
    });
  }, [loans, books, members]);

  // Filter loans
  const filteredLoans = useMemo(() => {
    return enhancedLoans.filter(loan => {
      const matchesSearch =
        loan.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.book?.isbn?.includes(searchTerm) ||
        loan.member?.membership_id?.includes(searchTerm);

      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'overdue' && loan.isOverdue) ||
        (filterStatus === 'active' && loan.status === 'Active') ||
        (filterStatus === 'returned' && loan.status === 'Returned');

      const matchesDate = dateFilter === 'all' || (() => {
        const loanDate = new Date(loan.loanDate);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'today':
            return daysDiff === 0;
          case 'week':
            return daysDiff <= 7;
          case 'month':
            return daysDiff <= 30;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [enhancedLoans, searchTerm, filterStatus, dateFilter]);

  // Statistics
  const stats = useMemo(() => {
    const activeLoans = enhancedLoans.filter(l => l.status === 'Active');
    const overdueLoans = enhancedLoans.filter(l => l.isOverdue);
    const returnedLoans = enhancedLoans.filter(l => l.status === 'Returned');

    return {
      total: enhancedLoans.length,
      active: activeLoans.length,
      overdue: overdueLoans.length,
      returned: returnedLoans.length,
      returnRate: enhancedLoans.length > 0 ? Math.round((returnedLoans.length / enhancedLoans.length) * 100) : 0,
    };
  }, [enhancedLoans]);

  const getStatusBadge = (loan: any) => {
    if (loan.isOverdue) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue ({loan.daysOverdue}d)
        </span>
      );
    }

    const styles = {
      Active: 'bg-blue-100 text-blue-800',
      Returned: 'bg-green-100 text-green-800',
    };

    const icons = {
      Active: <Clock className="w-3 h-3 mr-1" />,
      Returned: <CheckCircle className="w-3 h-3 mr-1" />,
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[loan.status as keyof typeof styles]} flex items-center`}>
        {icons[loan.status as keyof typeof icons]}
        {loan.status}
      </span>
    );
  };

  const handleReturnBook = async(loan: any) => {
   
    try {
      await returnBook({ loanId: loan.name })
        .unwrap()
      toast.success(`Book "${loan.bookTitle}" returned successfully!`);
        
    } catch (error) {
      toast.error( 'Failed to return book. Please try again.');
        
       }
     
      
  };


  const handleCreateLoan = async (formData: NewLoanFormData) => {
    try {
      const selectedBook = books.find(b => b.name === formData.book);
      const selectedMember = members.find(m => m.name === formData.member);
      
      const response = await createLoan({
        book: formData.book,
        member: formData.member,
        loan_date: formData.loan_date,
        return_date: formData.return_date
      }).unwrap();

      toast.success(`New loan created for "${selectedBook?.title}" by ${selectedMember?.name1}!`);

      setIsNewLoanModalOpen(false);
      reset();

    } catch (error: any) {
      toast.error(
        error?.data?.message || 'Failed to create new loan. Please try again.')
    }
  };

  const handleOpenNewLoanModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const returnDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    reset({
      loan_date: today,
      return_date: returnDate,
      book: '',
      member: ''
    });
    setIsNewLoanModalOpen(true);
  };

  if (loansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loans Management</h1>
          <p className="text-gray-600 mt-1">Track and manage book loans</p>
        </div>
        <button
          onClick={handleOpenNewLoanModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>New Loan</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Loans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Returned</p>
              <p className="text-2xl font-bold text-green-600">{stats.returned}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Return Rate</p>
              <p className="text-2xl font-bold text-purple-600">{stats.returnRate}%</p>
            </div>
            <RotateCcw className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by book title, member name, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book & Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                <tr key={loan.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=60&h=80&fit=crop'}
                          alt={loan.bookTitle}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{loan.bookTitle}</p>
                          <p className="text-xs text-gray-500">by {loan.book?.author}</p>
                          <p className="text-xs text-gray-500">ISBN: {loan.book?.isbn}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{loan.memberName}</span>
                        <span className="text-gray-400">•</span>
                        <span>{loan.member?.membership_id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Loaned: {new Date(loan.loanDate).toLocaleDateString()}
                      </div>
                      {loan.actualReturnDate && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Returned: {new Date(loan.actualReturnDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {getStatusBadge(loan)}
                  </td>

                  <td className="px-6 py-4">
                    <div className={`text-sm ${loan.isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {new Date(loan.returnDate).toLocaleDateString()}
                      {loan.isOverdue && (
                        <div className="text-xs text-red-500 mt-1">
                          {loan.daysOverdue} days overdue
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedLoan({
                          ...loan,
                          bookDetails: loan.book,
                          memberDetails: loan.member,
                          isOverdue: loan.isOverdue,
                          daysOverdue: loan.daysOverdue,
                          bookTitle: loan.book_title || loan.bookTitle,
                          memberName: loan.member_name || loan.memberName,
                          loanDate: loan.loan_date || loan.loanDate,
                          returnDate: loan.return_date || loan.returnDate,
                          actualReturnDate: loan.actual_return_date || loan.actualReturnDate
                        })}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {loan.status === 'Active' && (
                        <>
                          <button
                            onClick={() => handleReturnBook(loan)}
                            className="text-green-600 hover:text-green-900 transition-colors p-1 cursor-pointer"
                            title="Return Book"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLoans.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <BookOpen className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Loan Details Modal */}
      {selectedLoan && (
        <LoanDetailsModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
        />
      )}

      {/* New Loan Modal */}
      {isNewLoanModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg">
            <form onSubmit={handleSubmit(handleCreateLoan)}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>New Loan</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setIsNewLoanModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Book select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Book
                  </label>
                  <select
                    {...register('book', { required: 'Book is required' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" hidden>Select book…</option>
                    {books
                      .filter((b) => b.status === 'Available')
                      .map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.title}
                        </option>
                      ))}
                  </select>
                  {errors.book && (
                    <p className="text-xs text-red-600 mt-1">{errors.book.message}</p>
                  )}
                </div>

                {/* Member select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member
                  </label>
                  <select
                    {...register('member', { required: 'Member is required' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" hidden>Select member…</option>
                    {members.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name1}
                      </option>
                    ))}
                  </select>
                  {errors.member && (
                    <p className="text-xs text-red-600 mt-1">{errors.member.message}</p>
                  )}
                </div>

                {/* Loan / Return dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Date
                    </label>
                    <input
                      type="date"
                      {...register('loan_date', { required: 'Loan date is required' })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.loan_date && (
                      <p className="text-xs text-red-600 mt-1">{errors.loan_date.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      {...register('return_date', { required: 'Return date is required' })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.return_date && (
                      <p className="text-xs text-red-600 mt-1">{errors.return_date.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex justify-end space-x-2">
              
                <button
                  type="submit"
                  disabled={isCreatingLoan}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cusrsor-pointer"
                >
                  {isCreatingLoan ? 'Creating...' : 'Create Loan'}
                </button>
                  <button
                  type="button"
                  onClick={() => setIsNewLoanModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Loan Details Modal Component
const LoanDetailsModal: React.FC<{ loan: any; onClose: () => void }> = ({ loan, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Loan Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Book Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Book Information</h3>
            <div className="flex space-x-4">
              <img
                src={loan.book?.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120&h=160&fit=crop'}
                alt={loan.bookTitle}
                className="w-20 h-28 object-cover rounded"
              />
              <div className="space-y-2">
                <p><span className="font-medium">Title:</span> {loan.bookTitle}</p>
                <p><span className="font-medium">Author:</span> {loan.book?.author}</p>
                <p><span className="font-medium">ISBN:</span> {loan.book?.isbn}</p>
                <p><span className="font-medium">Status:</span> {loan.book?.status}</p>
              </div>
            </div>
          </div>

          {/* Member Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Member Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Name:</span> {loan.memberName}</p>
                <p><span className="font-medium">ID:</span> {loan.member?.membership_id}</p>
              </div>
              <div>
                <p><span className="font-medium">Email:</span> {loan.member?.email}</p>
                <p><span className="font-medium">Phone:</span> {loan.member?.phone}</p>
              </div>
            </div>
          </div>

          {/* Loan Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Loan Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Loan Date:</span> {new Date(loan.loanDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Due Date:</span> {new Date(loan.returnDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p><span className="font-medium">Status:</span> {loan.status}</p>
                {loan.actualReturnDate && (
                  <p><span className="font-medium">Returned:</span> {new Date(loan.actualReturnDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            {loan.isOverdue && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">
                  This loan is {loan.daysOverdue} days overdue
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoansPage;