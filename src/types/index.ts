export interface Book {
  name: string;
  title: string;
  author: string;
  publish_date: string;
  isbn: string;
  status: "Available" | "Loaned";
}

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  publish_date: string;
}

export interface BooksResponse {
  success: boolean;
  message: {
    data: Book[];
  };
}
export interface MemberFormData { 
  name: string,
  membership_id: string,
  email: string,
  phone: string,
}
export interface Member {
  name: string;
  name1: string;
  membership_id: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  roles: string[];
}

export interface MembersResponse {
  success: boolean;
  message: {
    data: Member[];
  };
}
export interface Loan{
  name: string;
  book: string; 
  member: string; 
  loan_date: string;
  return_date: string;
  status: "Active" | "Returned" | "Overdue";
  actual_return_date: string | null;
  book_title: string;
  member_name: string;
};

export interface EnhancedLoan {
  bookDetails?: Book;
  memberDetails?: Member;
  isOverdue: boolean;
  daysOverdue: number;
  bookTitle: string;
  memberName: string;
  loanDate: string;
  returnDate: string;
  actualReturnDate: string | null;
};

export interface LoansResponse {
  success: boolean;
  message: {
    data: Loan[];
  };
}
// export interface Reservation {
//   id: string;
//   bookId: string;
//   memberId: string;
//   reservationDate: string;
//   status: "pending" | "fulfilled" | "cancelled";
// }

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'Library Member' | 'Librarian';
  membership_id?: string;
  phone?: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
  };
}

export interface User {
  name: string;
  email: string;
  full_name: string;
  user_type: string;
  creation: string;
  enabled: number;
  library_roles: string[];
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
