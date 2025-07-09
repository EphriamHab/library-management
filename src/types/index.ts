export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishDate: string;
  status: 'available' | 'borrowed' | 'reserved';
  category: string;
  description?: string;
  coverImage?: string;
}

export interface Member {
  id: string;
  name: string;
  membershipId: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'inactive';
  role: 'admin' | 'librarian' | 'member';
}

export interface Loan {
  id: string;
  bookId: string;
  memberId: string;
  loanDate: string;
  returnDate: string;
  actualReturnDate?: string;
  status: 'active' | 'returned' | 'overdue';
}

export interface Reservation {
  id: string;
  bookId: string;
  memberId: string;
  reservationDate: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'librarian' | 'member';
  isAuthenticated: boolean;
}