/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Book, Member, Loan, BooksResponse, BookFormData, LoansResponse, MembersResponse, MemberFormData, CreateUserResponse, CreateUserRequest } from "../types/index.ts";

const BASE_URL = "http://localhost:8000/api/method/";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "omit",
  prepareHeaders: (headers, { endpoint }) => {
    const guestEndpoints = ["login", "refreshToken", "register"];

    if (!guestEndpoints.includes(endpoint)) {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Book", "Member", "Loan", "Reservation", "User"],
  endpoints: (builder) => ({
    login: builder.mutation<
      {
        message: {
          success: boolean;
          message: string;
          data: {
            user: {
              name: string;
              email: string;
              full_name: string;
              user_type: string;
              roles: string[];
            };
            member: {
              name: string;
              name1: string;
              membership_id: string;
            } | null;
            tokens: {
              access_token: string;
              refresh_token: string;
              token_type: string;
              expires_in: number;
            };
          };
        };
      },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "library_app.api.auth.login",
        method: "POST",
        body: {
          email: credentials.email,
          password: credentials.password,
          use_token: 1,
        },
      }),
    }),
    register: builder.mutation<any, CreateUserRequest>({
      query: (userData) => ({
        url: "library_app.api.auth.register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "library_app.api.auth.logout",
        method: "POST",
        body: {
          token_based: 1,
        },
      }),
    }),

    refreshToken: builder.mutation<
      {
        success: boolean;
        message: string;
        data: {
          tokens: {
            access_token: string;
            refresh_token: string;
            token_type: string;
            expires_in: number;
          };
        };
      },
      { refresh_token: string }
    >({
      query: ({ refresh_token }) => ({
        url: "library_app.api.auth.refresh_token",
        method: "POST",
        body: { refresh_token },
      }),
    }),

    getCurrentUser: builder.query<
      {
        success: boolean;
        data: {
          user: {
            name: string;
            email: string;
            full_name: string;
            user_type: string;
            roles: string[];
          };
          member?: {
            name: string;
            name1: string;
            membership_id: string;
          };
        };
      },
      void
    >({
      query: () => "library_app.api.auth.get_current_user",
      providesTags: ["User"],
    }),

    changePassword: builder.mutation<
      { success: boolean; message: string },
      { old_password: string; new_password: string }
    >({
      query: (passwords) => ({
        url: "library_app.api.auth.change_password",
        method: "POST",
        body: passwords,
      }),
    }),

    getBooks: builder.query<BooksResponse, void>({
      query: () => "library_app.api.books.get_books",
      providesTags: ["Book"],
    }),
    getBook: builder.query<Book, string>({
      query: (id) => `library_app.api.books.get_book?id=${id}`,
      providesTags: (result, error, id) => [{ type: "Book", id }],
    }),
    createBook: builder.mutation<Book, BookFormData>({
      query: (book) => ({
        url: "library_app.api.books.create_book",
        method: "POST",
        body: book,
      }),
      invalidatesTags: ["Book"],
    }),
    updateBook: builder.mutation<Book, { id: string; book: BookFormData }>({
      query: ({ id, book }) => ({
        url: `library_app.api.books.update_book?id=${id}`,
        method: "PUT",
        body: book,
      }),
      invalidatesTags: ["Book"],
    }),
    deleteBook: builder.mutation<void, string>({
      query: (id) => ({
        url: `library_app.api.books.delete_book?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Book"],
    }),

    getMembers: builder.query<MembersResponse, void>({
      query: () => "library_app.api.members.get_members",
      providesTags: ["Member"],
    }),
    createMember: builder.mutation<Member, MemberFormData>({
      query: (member) => ({
        url: "library_app.api.members.create_member",
        method: "POST",
        body: member,
      }),
      invalidatesTags: ["Member"],
    }),
    updateMember: builder.mutation<
      Member,
      { id: string; member: Partial<Member> }
    >({
      query: ({ id, member }) => ({
        url: `library_app.api.members.update_member?id=${id}`,
        method: "PUT",
        body: member,
      }),
      invalidatesTags: ["Member"],
    }),
    deleteMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `library_app.api.members.delete_member?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Member"],
    }),

    // Loans
    getLoans: builder.query<LoansResponse, void>({
      query: () => "library_app.api.loans.get_loans",
      providesTags: ["Loan"],
    }),
    createLoan: builder.mutation<
      Loan,
      { book: string; member: string; loan_date: string, return_date: string }
    >({
      query: (loan) => ({
        url: "library_app.api.loans.create_loan",
        method: "POST",
        body: loan,
      }),
      invalidatesTags: ["Loan", "Book"],
    }),
    returnBook: builder.mutation<void, { loanId: string }>({
      query: ({ loanId }) => ({
        url: `library_app.api.loans.return_book?id=${loanId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Loan", "Book"],
    }),
    getOverdueLoans: builder.query<Loan[], void>({
      query: () => "library_app.api.loans.get_overdue_loans",
      providesTags: ["Loan"],
    }),

    // Reservations
    getReservations: builder.query<any, void>({
      query: () => "library_app.api.reservations.get_reservations",
      providesTags: ["Reservation"],
    }),
    createReservation: builder.mutation<
      any,
      { book: string; member: string }
    >({
      query: (reservation) => ({
        url: "library_app.api.reservations.create_reservation",
        method: "POST",
        body: reservation,
      }),
      invalidatesTags: ["Reservation", "Book"],
    }),

    // Reports
    getBooksOnLoan: builder.query<any, void>({
      query: () => "library_app.api.reports.get_books_on_loan",
      providesTags: ["Book", "Loan"],
    }),
    getOverdueBooks: builder.query<any, void>({
      query: () => "library_app.api.reports.get_overdue_books",
      providesTags: ["Book", "Loan"],
    }),
    getMemberLoanHistory: builder.query<Loan, string>({
      query: (memberId) =>
        `library_app.api.reports.get_member_loan_history?memberId=${memberId}`,
      providesTags: ["Loan"],
    }),

    // User Management
    createUser: builder.mutation<CreateUserResponse, CreateUserRequest>({
      query: (userData) => ({
        url: 'library_app.api.users.create_user',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    getUsers: builder.query<any[], void>({
      query: () => "library_app.api.users.get_users",
      providesTags: ["User"],
    }),
    updateUser: builder.mutation<any, { id: string; user: Partial<any> }>({
      query: ({ id, user }) => ({
        url: "library_app.api.users.update_user",
        method: "PUT",
        body: { id, ...user },
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: "library_app.api.users.delete_user",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["User"],
    }),
    // Member Books
    getAvailableBooks: builder.query({
      query: (params) => ({
        url: 'library_app.api.member_books.get_available_books',
        params: params 
      }),
      transformResponse: (response: any) => {
        return {
          data: response.message?.data || [],
          pagination: response.message?.pagination || {}
        };
      }
    }),
    requestLoan: builder.mutation({
      query: ({book_id}) => ({
        url: `library_app.api.member_books.request_loan?book_id=${book_id}`,
        method: 'PUT',
      }),
    }),
    reserveBook: builder.mutation({
      query: (data) => ({
        url: 'library_app.api.member_books.reserve_book',
        method: 'POST',
        body: data,
      }),
    }),
    
    getMyLoans: builder.query({
      query: (params) => ({
        url: 'library_app.api.member_loans.get_my_loans',
        params,
      }),
    }),
    renewLoan: builder.mutation({
      query: ({loan_id}) => ({
        url: `library_app.api.member_loans.renew_loan?loan_id=${loan_id}`,
        method: 'PUT',
      }),
    }),
    
    getMyReservations: builder.query({
      query: (params) => ({
        url: 'library_app.api.member_reservations.get_my_reservations',
        params,
      }),
    }),
    cancelReservation: builder.mutation({
      query: ({reservation_id}) => ({
        url: `library_app.api.member_reservations.cancel_reservation?reservation_id=${reservation_id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  // Authentication
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useChangePasswordMutation,
  useRegisterMutation,

  // Books
  useGetBooksQuery,
  useGetBookQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,

  // Members
  useGetMembersQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,

  // Loans
  useGetLoansQuery,
  useCreateLoanMutation,
  useReturnBookMutation,
  useGetOverdueLoansQuery,

  // Reservations
  useGetReservationsQuery,
  useCreateReservationMutation,

  // Reports
  useGetBooksOnLoanQuery,
  useGetOverdueBooksQuery,
  useGetMemberLoanHistoryQuery,

  // User Management
  useCreateUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  // Member 
  useGetAvailableBooksQuery,
  useRequestLoanMutation,
  useReserveBookMutation,
  useGetMyLoansQuery,
  useRenewLoanMutation,
  useGetMyReservationsQuery,
  useCancelReservationMutation,

} = api;
