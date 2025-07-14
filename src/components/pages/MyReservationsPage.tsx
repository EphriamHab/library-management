/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Calendar,
  BookOpen,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import { useGetMyReservationsQuery, useCancelReservationMutation } from '../../store/api';
import { toast } from 'react-toastify';

const MyReservationsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: reservationsData, isLoading, refetch } = useGetMyReservationsQuery({
    page: currentPage,
    limit: 10,
    status: statusFilter
  });

  const [cancelReservation, { isLoading: isCancelling }] = useCancelReservationMutation();

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const result = await cancelReservation({ reservation_id: reservationId }).unwrap();
        if (result.success) {
          toast.success('Reservation cancelled successfully');
        refetch();
        } else {
            toast.error(result.message || 'Failed to cancel reservation');
      }
    } catch (error: any) {
        toast.error(error?.data?.message ?? 'Error cancelling reservation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Fulfilled':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const reservations = reservationsData?.message?.data || [];
  const pagination = reservationsData?.message?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
          <p className="text-gray-600">Track your book reservations and queue position</p>
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
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Reservations ({pagination?.total || 0})
              </h2>

              <div className="space-y-4">
                {reservations.map((reservation: any) => (
                  <div key={reservation.name} className="border rounded-lg p-4 border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {reservation.book_title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              by {reservation.book_author}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Reserved: {new Date(reservation.reservation_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Priority: #{reservation.priority}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <BookOpen className="w-4 h-4" />
                                <span>Book Status: {reservation.book_status}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                              {reservation.status}
                            </span>

                            {reservation.status === 'Active' && (
                              <button
                                onClick={() => handleCancelReservation(reservation.name)}
                                disabled={isCancelling}
                                className="flex items-center space-x-1 text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50  cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                                <span>{isCancelling ? 'Cancelling...' : 'Cancel'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {reservation.status === 'Active' && reservation.priority === 1 && (
                          <div className="mt-3 flex items-center space-x-2 text-green-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              You're next in line! You'll be notified when the book becomes available.
                            </span>
                          </div>
                        )}

                        {reservation.status === 'Fulfilled' && (
                          <div className="mt-3 flex items-center space-x-2 text-green-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Book is now available for you to borrow!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {reservations.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reservations found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {statusFilter ? 'Try adjusting your filters' : 'Reserve books that are currently unavailable'}
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

export default MyReservationsPage;
