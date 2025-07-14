/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState,  memo, useEffect} from 'react';
import {
  useGetBooksQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation
} from '../../store/api';
import {toast} from 'react-toastify';
import { Plus, Search, Filter, Edit, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Book {
  name: string;
  title: string;
  author: string;
  publish_date: string;
  isbn: string;
  status: 'Available' | 'Loaned';
}

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  publish_date: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const BooksPage: React.FC = () => {
  const { data, isLoading, error: queryError } = useGetBooksQuery();
  const [createBook] = useCreateBookMutation();
  const [updateBook] = useUpdateBookMutation();
  const [deleteBook] = useDeleteBookMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const books: Book[] = data?.message?.data || [];
  const filteredBooks = books.filter((book: Book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || book.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });



  const handleAddBook = async (formData: BookFormData) => {
    try {
      await createBook(formData).unwrap();
      setShowAddModal(false);
      toast.success('Book added successfully!');
    } catch (error: any) {
      toast.error(`Failed to add book: ${error?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleEditBook = async (formData: BookFormData) => {
    if (!selectedBook) {
      return;
    }

    console.log('Attempting to update book:', selectedBook.name, formData); // Debug log
    try {
      await updateBook({
        id: selectedBook.name,
        book: formData,
      }).unwrap();
      setShowEditModal(false);
      setSelectedBook(null);
      toast.success('Book updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update book: ${error?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) {
      return;
    }

    try {
      await deleteBook(selectedBook.name).unwrap();
      setShowDeleteModal(false);
      setSelectedBook(null);
      toast.success('Book deleted successfully!');
    } catch (error: any) {
      toast.error(`Failed to delete book: ${error?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const openEditModal = (book: Book) => {
    setSelectedBook(book);
    setShowEditModal(true);
  };

  const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> =
    ({ isOpen, onClose, title, children }) => {

      useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
          document.addEventListener('keydown', handleEscape);
          return () => document.removeEventListener('keydown', handleEscape);
        }
      }, [isOpen, onClose]);

      if (!isOpen) return null;

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-opacity-50  transition-opacity duration-300"
            onClick={onClose}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto z-50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {children}
            </div>
          </div>
        </div>
      );
    };

  const BookForm = memo((
    { onSubmit, submitText, onCancel, initialData }:
      { onSubmit: (data: BookFormData) => void; submitText: string; onCancel: () => void; initialData?: BookFormData }
  ) => {
    const [formData, setFormData] = useState<BookFormData>(
      initialData || {
        title: '',
        author: '',
        isbn: '',
        publish_date: '',
      }
    );


    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Form submitted:', formData); // Debug log
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value }));
            }}
            onFocus={() => console.log('Title input focused')} // Debug log
            onBlur={() => console.log('Title input blurred')} // Debug log
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter book title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <input
            type="text"
            required
            value={formData.author}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, author: e.target.value }));
            }}
            onFocus={() => console.log('Author input focused')} // Debug log
            onBlur={() => console.log('Author input blurred')} // Debug log
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter author name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
          <input
            type="text"
            required
            value={formData.isbn}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, isbn: e.target.value }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter ISBN"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
          <input
            type="date"
            required
            value={formData.publish_date}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, publish_date: e.target.value }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex space-x-3 pt-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 cursor-pointer">
            {submitText}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading books</h3>
        <p className="text-gray-500">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Books Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add Book</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search books by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="loaned">Loaned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book: Book) => (
          <div key={book.name} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <img
              src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"
              alt={book.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">{book.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${book.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {book.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">by {book.author}</p>
              <p className="text-xs text-gray-500 mb-3">ISBN: {book.isbn}</p>
              <p className="text-xs text-gray-500 mb-4">Published: {new Date(book.publish_date).getFullYear()}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {book.name}
                </span>
                <div className="flex items-center space-x-1">
                  <button onClick={() => openEditModal(book)} className="p-1 text-gray-400 hover:text-green-600 cursor-pointer">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setSelectedBook(book); setShowDeleteModal(true); }} className="p-1 text-gray-400 hover:text-red-600 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); }} title="Add New Book">
        <BookForm
          onSubmit={handleAddBook}
          submitText="Add Book"
          onCancel={() => { setShowAddModal(false); }}
        />
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedBook(null); }} title="Edit Book">
        <BookForm
          onSubmit={handleEditBook}
          submitText="Update Book"
          onCancel={() => { setShowEditModal(false); setSelectedBook(null); }}
          initialData={{
            title: selectedBook?.title || '',
            author: selectedBook?.author || '',
            isbn: selectedBook?.isbn || '',
            publish_date: selectedBook?.publish_date || '',
          }}
        />
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedBook(null); }} title="Delete Book">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{selectedBook?.title}"? This action cannot be undone.
          </p>
          <div className="flex space-x-3 pt-4">
            <button onClick={handleDeleteBook} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 cursor-pointer">
              Delete
            </button>
            <button onClick={() => { setShowDeleteModal(false); setSelectedBook(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BooksPage;