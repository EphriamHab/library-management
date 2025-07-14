/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Search,
  RefreshCw,
  BookmarkPlus,
  X,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  useGetAvailableBooksQuery,
  useGetMyLoansQuery,
  useGetMyReservationsQuery,
  useRequestLoanMutation,
  useRenewLoanMutation,
  useReserveBookMutation,
  useCancelReservationMutation
} from '../../store/api'; 
import { toast } from 'react-toastify';

const MemberDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loanFilter, setLoanFilter] = useState('');

  // API hooks
  const { data: availableBooks, isLoading: booksLoading } = useGetAvailableBooksQuery({
    page: currentPage,
    limit: 8,
    search: searchTerm
  });

  const { data: myLoans, isLoading: loansLoading, refetch: refetchLoans } = useGetMyLoansQuery({
    page: 1,
    limit: 10,
    filter: loanFilter
  });

  const { data: myReservations, isLoading: reservationsLoading, refetch: refetchReservations } = useGetMyReservationsQuery({
    page: 1,
    limit: 10
  });

  const [requestLoan] = useRequestLoanMutation();
  const [renewLoan] = useRenewLoanMutation();
  const [reserveBook] = useReserveBookMutation();
  const [cancelReservation] = useCancelReservationMutation();

  const loans = myLoans?.message?.data || [];
  const reservations = myReservations?.message?.data || [];
  const books = availableBooks?.data || [];

  const activeLoans = loans.filter((loan: { status: string; }) => loan.status === 'Active').length;
  const overdueLoans = loans.filter((loan: { is_overdue: any; }) => loan.is_overdue).length;
  const activeReservations = reservations.filter((res: { status: string; }) => res.status === 'Active').length;
  const dueThisWeek = loans.filter((loan: { status: string; days_until_due: number; }) => 
    loan.status === 'Active' && loan.days_until_due <= 7 && loan.days_until_due > 0
  ).length;

  const handleRequestLoan = async (bookId:any) => {
    try {
        await requestLoan({ book_id: bookId }).unwrap();
        toast.success('Loan requested successfully!');
    } catch (error) {
        toast.error('Error requesting loan');
    }
  };

  const handleRenewLoan = async (loanId:any) => {
    try {
      await renewLoan({ loan_id: loanId }).unwrap();
        refetchLoans();
        toast.success('Loan renewed successfully!');
    } catch (error) {
        toast.error('Error renewing loan');
    }
  };

    const handleReserveBook = async(bookId:any) => {
    try {
      await reserveBook({ book_id: bookId }).unwrap();
        refetchReservations();
        toast.success('Book reserved successfully!');
    } catch (error: any) {
        toast.error(error?.data?.message ?? 'Error reserving book');
    }
  };

  const handleCancelReservation = async (reservationId:any) => {
    try {
      await cancelReservation({ reservation_id: reservationId }).unwrap();
      refetchReservations();
      alert('Reservation cancelled successfully!');
    } catch (error: any) {
        toast.error(error?.data?.message ?? 'Error cancelling reservation');
    }
  };

  const getStatusBadge = (status: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, isOverdue = false, daysUntilDue = 0) => {
    if (isOverdue) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>;
    }
    if (status === 'Active' && daysUntilDue <= 3) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Due Soon</span>;
    }
    if (status === 'Active') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Library Dashboard</h1>
          <p className="text-gray-600">Welcome back! Manage your books, loans, and reservations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeLoans}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{dueThisWeek}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{overdueLoans}</p>
              </div>
              <div className="p-3 rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reservations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeReservations}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <BookmarkPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Browse Books */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Browse Available Books
              </h2>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Books Grid */}
              {booksLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : books.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No books found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {books.map((book:any) => (
                    <div key={book.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">{book.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                      <p className="text-xs text-gray-500 mb-3">ISBN: {book.isbn}</p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestLoan(book.name)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Borrow
                        </button>
                        <button
                          onClick={() => handleReserveBook(book.name)}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Reserve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - My Loans & Reservations */}
          <div className="space-y-6">
            {/* My Loans */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  My Loans
                </h3>
                <select
                  value={loanFilter}
                  onChange={(e) => setLoanFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">All</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {loansLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : loans.length === 0 ? (
                  <div className="text-center py-6">
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No loans found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {loans.slice(0, 5).map((loan:any) => (
                      <div key={loan.name} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{loan.book_title}</h4>
                            <p className="text-xs text-gray-500">by {loan.book_author}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                Due: {new Date(loan.return_date).toLocaleDateString()}
                              </span>
                              {getStatusBadge(loan.status, loan.is_overdue, loan.days_until_due)}
                            </div>
                          </div>
                          {loan.status === 'Active' && (
                            <button
                              onClick={() => handleRenewLoan(loan.name)}
                              className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Renew
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* My Reservations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <BookmarkPlus className="h-5 w-5 text-green-600" />
                  My Reservations
                </h3>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {reservationsLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : reservations.filter((res: { status: string; }) => res.status === 'Active').length === 0 ? (
                  <div className="text-center py-6">
                    <BookmarkPlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No active reservations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reservations.filter((res: { status: string; }) => res.status === 'Active').slice(0, 5).map((reservation:any) => (
                      <div key={reservation.name} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{reservation.book_title}</h4>
                            <p className="text-xs text-gray-500">by {reservation.book_author}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                Reserved: {new Date(reservation.reservation_date).toLocaleDateString()}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                #{reservation.priority}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancelReservation(reservation.name)}
                            className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Overdue Alert */}
            {overdueLoans > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900">Overdue Books</h4>
                    <p className="text-xs text-red-700 mt-1">
                      You have {overdueLoans} overdue book(s). Please return them ASAP.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;