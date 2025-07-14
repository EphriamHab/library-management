/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
    Search,
    BookOpen,
    Calendar,
    User,
     Loader,
    X
} from 'lucide-react';
import { useGetAvailableBooksQuery, useRequestLoanMutation, useReserveBookMutation } from '../../store/api';
import { toast } from 'react-toastify';

const MemberBooksPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [showBookModal, setShowBookModal] = useState(false);

    const { data: rawBooksData, isLoading, refetch } = useGetAvailableBooksQuery({
        page: currentPage,
        limit: 12,
        search: searchTerm
    });
    const booksData = rawBooksData ? {
        data: rawBooksData.data || [],
        pagination: rawBooksData.pagination || {}
    } : { data: [], pagination: {} };
    const [requestLoan, { isLoading: isRequestingLoan }] = useRequestLoanMutation();
    const [reserveBook, { isLoading: isReserving }] = useReserveBookMutation();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        refetch();
    };

    const handleRequestLoan = async (bookId: string) => {
        try {
            await requestLoan({ book_id: bookId }).unwrap();
            toast.success("Loan requested successfully!");
            refetch()
            setShowBookModal(false);

        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to request loan');
        }
    };

    const handleReserveBook = async (bookId: string) => {
        try {
            await reserveBook({ book_id: bookId }).unwrap();
            toast.success("Book Reserved")
            refetch();
            setShowBookModal(false);

        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to reserve book');
        }
    };

    const BookModal = () => {
        if (!selectedBook) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-900">{selectedBook.title}</h2>
                        <button
                            onClick={() => setShowBookModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{selectedBook.author}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">ISBN: {selectedBook.isbn}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                                Published: {new Date(selectedBook.publish_date).getFullYear()}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedBook.status === 'Available'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {selectedBook.status}
                            </span>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        {selectedBook.status === 'Available' ? (
                            <button
                                onClick={() => handleRequestLoan(selectedBook.name)}
                                disabled={isRequestingLoan}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isRequestingLoan ? <Loader/> : 'Request Loan'}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleReserveBook(selectedBook.name)}
                                disabled={isReserving}
                                className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                            >
                                {isReserving ? 'Reserving...' : 'Reserve Book'}
                            </button>
                        )}
                        <button
                            onClick={() => setShowBookModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Browse Books</h1>
                    <p className="text-gray-600">Discover and borrow books from our collection</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
                <form onSubmit={handleSearch} className="flex space-x-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search books by title or author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Books Grid */}
            <div className="bg-white rounded-lg shadow-sm border">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Available Books</h2>
                                <span className="text-sm text-gray-500">
                                    {booksData?.pagination?.total || 0} books found
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {booksData?.data?.map((book: any) => (
                                    <div
                                        key={book.name}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => {
                                            setSelectedBook(book);
                                            setShowBookModal(true);
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                                                    {book.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${book.status === 'Available'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {book.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(book.publish_date).getFullYear()}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <BookOpen className="w-3 h-3 mr-1" />
                                                {book.isbn}
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            {book.status === 'Available' ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRequestLoan(book.name);
                                                    }}
                                                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                                                >
                                                    Request Loan
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReserveBook(book.name);
                                                    }}
                                                    className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded text-sm hover:bg-yellow-700 transition-colors"
                                                >
                                                    Reserve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(!booksData?.data || booksData.data.length === 0) && !isLoading && (
                                <div className="text-center py-12">
                                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No books found</p>
                                    {searchTerm && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setCurrentPage(1);
                                                refetch();
                                            }}
                                            className="text-blue-600 hover:text-blue-500 mt-2"
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {booksData?.pagination && booksData.pagination.pages > 1 && (
                            <div className="border-t px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, booksData.pagination.total)} of {booksData.pagination.total} results
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
                                            disabled={currentPage === booksData.pagination.pages}
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

            {showBookModal && <BookModal />}
        </div>
    );
};

export default MemberBooksPage;