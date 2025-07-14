/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {toast} from 'react-toastify';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  BookOpen,
  User,
  X,
  Eye,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Users,
  List
} from 'lucide-react';
import {
  useGetReservationsQuery,
  useCreateReservationMutation,
  useGetBooksQuery,
  useGetMembersQuery
} from '../../store/api';

interface CreateReservationFormData {
  book: string;
  member: string;
}

interface ReservationDetailsModalProps {
  reservation: any;
  onClose: () => void;
}

const ReservationsPage: React.FC = () => {
  const { data: reservationsData, isLoading: reservationsLoading, refetch: refetchReservations } = useGetReservationsQuery();
  const { data: booksData } = useGetBooksQuery();
  const { data: membersData } = useGetMembersQuery({});
  const [createReservation, { isLoading: isCreatingReservation }] = useCreateReservationMutation();

  const reservations = reservationsData?.message?.data || [];
  const books = booksData?.message?.data || [];
  const members = membersData?.message?.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateReservationFormData>();

  const enhancedReservations = useMemo(() => {
    return reservations.map((reservation: { book: string; member: string; book_title: any; member_name: any; reservation_date: any; }) => {
      const book = books.find(b => b.name === reservation.book);
      const member = members.find((m: { name: string; }) => m.name === reservation.member);
      
      return {
        ...reservation,
        book,
        member,
        bookTitle: reservation.book_title,
        memberName: reservation.member_name,
        reservationDate: reservation.reservation_date
      };
    });
  }, [reservations, books, members]);

  const filteredReservations = useMemo(() => {
    return enhancedReservations.filter((reservation: { bookTitle: string; memberName: string; book: { isbn: string | string[]; }; member: { membership_id: string | string[]; }; status: string; }) => {
      const matchesSearch =
        reservation.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.book?.isbn?.includes(searchTerm) ||
        reservation.member?.membership_id?.includes(searchTerm);

      const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [enhancedReservations, searchTerm, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const activeReservations = enhancedReservations.filter((r: { status: string; }) => r.status === 'Active');
    const fulfilledReservations = enhancedReservations.filter((r: { status: string; }) => r.status === 'Fulfilled');
    const cancelledReservations = enhancedReservations.filter((r: { status: string; }) => r.status === 'Cancelled');

    // Get books that are currently loaned and have reservations
    const booksWithReservations = new Set(activeReservations.map((r: { book: any; }) => r.book));
    const loanedBooksWithReservations = books.filter(b => 
      b.status === 'Loaned' && booksWithReservations.has(b.name)
    ).length;

    return {
      total: enhancedReservations.length,
      active: activeReservations.length,
      fulfilled: fulfilledReservations.length,
      cancelled: cancelledReservations.length,
      booksWithReservations: booksWithReservations.size,
      avgPriority: activeReservations.length > 0 
        ? Math.round(activeReservations.reduce((sum:any, r:any) => sum + (r.priority || 0), 0) / activeReservations.length)
        : 0
    };
  }, [enhancedReservations, books]);

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-blue-100 text-blue-800',
      Fulfilled: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    };

    const icons = {
      Active: <Clock className="w-3 h-3 mr-1" />,
      Fulfilled: <CheckCircle className="w-3 h-3 mr-1" />,
      Cancelled: <X className="w-3 h-3 mr-1" />,
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]} flex items-center`}>
        {icons[status as keyof typeof icons]}
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: number) => {
    if (priority <= 3) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          High Priority (#{priority})
        </span>
      );
    } else if (priority <= 6) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Medium Priority (#{priority})
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Low Priority (#{priority})
        </span>
      );
    }
  };

  const handleCreateReservation = async (formData: CreateReservationFormData) => {
    try {
      const selectedBook = books.find(b => b.name === formData.book);
      const selectedMember = members.find((m: { name: string; }) => m.name === formData.member);
      
      const response = await createReservation({
        book: formData.book,
        member: formData.member
      }).unwrap();

      toast.success('Reservation created successfully!');

      setIsNewReservationModalOpen(false);
      reset();

    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create reservation');
    }
  };

  const handleOpenNewReservationModal = () => {
    reset({
      book: '',
      member: ''
    });
    setIsNewReservationModalOpen(true);
  };

  if (reservationsLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Reservations Management</h1>
          <p className="text-gray-600 mt-1">Manage book reservations and waiting lists</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* <button
            onClick={() => refetchReservations()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button> */}
          <button
            onClick={handleOpenNewReservationModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <List className="w-8 h-8 text-gray-500" />
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
              <p className="text-sm font-medium text-gray-600">Fulfilled</p>
              <p className="text-2xl font-bold text-green-600">{stats.fulfilled}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <X className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Books Reserved</p>
              <p className="text-2xl font-bold text-purple-600">{stats.booksWithReservations}</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Priority</p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgPriority}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <option value="Active">Active</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book & Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reservation Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation:any) => (
                <tr key={reservation.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=60&h=80&fit=crop'}
                          alt={reservation.bookTitle}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reservation.bookTitle}</p>
                          <p className="text-xs text-gray-500">by {reservation.book?.author}</p>
                          <p className="text-xs text-gray-500">ISBN: {reservation.book?.isbn}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{reservation.memberName}</span>
                        <span className="text-gray-400">•</span>
                        <span>{reservation.member?.membership_id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Reserved: {new Date(reservation.reservationDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Book Status: <span className="ml-1 font-medium">{reservation.book?.status}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {getPriorityBadge(reservation.priority)}
                  </td>

                  <td className="px-6 py-4">
                    {getStatusBadge(reservation.status)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <BookOpen className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <ReservationDetailsModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}

      {/* New Reservation Modal */}
      {isNewReservationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg">
            <form onSubmit={handleSubmit(handleCreateReservation)}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>New Reservation</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setIsNewReservationModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Book select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Book *
                  </label>
                  <select
                    {...register('book', { required: 'Book is required' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" hidden>Select book to reserve...</option>
                    {books
                      .filter((b) => b.status === 'Loaned') // Only loaned books can be reserved
                      .map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.title} 
                        </option>
                      ))}
                  </select>
                  {errors.book && (
                    <p className="text-xs text-red-600 mt-1">{errors.book.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Only books that are currently loaned can be reserved
                  </p>
                </div>

                {/* Member select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member *
                  </label>
                  <select
                    {...register('member', { required: 'Member is required' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" hidden>Select member...</option>
                    {members
                      .filter((m:any) => m.status === 'Active')
                      .map((m:any) => (
                        <option key={m.name} value={m.name}>
                          {m.name1}
                        </option>
                      ))}
                  </select>
                  {errors.member && (
                    <p className="text-xs text-red-600 mt-1">{errors.member.message}</p>
                  )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Reservation Information</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Members will be notified when the book becomes available</li>
                        <li>• Priority is assigned based on reservation order</li>
                        <li>• Members cannot reserve books that are currently available</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewReservationModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingReservation}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingReservation ? 'Creating...' : 'Create Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Reservation Details Modal Component
const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({ reservation, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Reservation Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
                src={reservation.book?.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120&h=160&fit=crop'}
                alt={reservation.bookTitle}
                className="w-20 h-28 object-cover rounded"
              />
              <div className="space-y-2">
                <p><span className="font-medium">Title:</span> {reservation.bookTitle}</p>
                <p><span className="font-medium">Author:</span> {reservation.book?.author}</p>
                <p><span className="font-medium">ISBN:</span> {reservation.book?.isbn}</p>
                <p><span className="font-medium">Current Status:</span> {reservation.book?.status}</p>
              </div>
            </div>
          </div>

          {/* Member Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Member Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Name:</span> {reservation.memberName}</p>
                <p><span className="font-medium">ID:</span> {reservation.member?.membership_id}</p>
              </div>
              <div>
                <p><span className="font-medium">Email:</span> {reservation.member?.email}</p>
                <p><span className="font-medium">Phone:</span> {reservation.member?.phone}</p>
              </div>
            </div>
          </div>

          {/* Reservation Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Reservation Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Reserved Date:</span> {new Date(reservation.reservationDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Priority:</span> #{reservation.priority}</p>
              </div>
              <div>
                <p><span className="font-medium">Status:</span> {reservation.status}</p>
                <p><span className="font-medium">Reservation ID:</span> {reservation.name}</p>
              </div>
            </div>

            {reservation.status === 'Active' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">
                  This reservation is currently active. The member will be notified when the book becomes available.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationsPage;