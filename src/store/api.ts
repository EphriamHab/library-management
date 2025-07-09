/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/store/api.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { Book, Member, Loan, Reservation } from '../types/index.ts';
import { mockBooks, mockMembers, mockLoans, mockReservations } from '../services/mockData';

// ✅ Proper mock baseQuery function with simulated delay
const mockFetchBaseQuery: BaseQueryFn<
  { url: string; method?: string; body?: any },
  unknown,
  unknown
> = async ({ url, method = 'GET', body }) => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

  try {
    switch (url) {
      case '/books':
        return { data: mockBooks };
      case '/members':
        return { data: mockMembers };
      case '/loans':
        return { data: mockLoans };
      case '/reservations':
        return { data: mockReservations };
      default:
        return { error: { status: 404, data: 'Not Found' } };
    }
  } catch (error) {
    return { error: { status: 'CUSTOM_ERROR', data: error } };
  }
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: mockFetchBaseQuery,
  tagTypes: ['Book', 'Member', 'Loan', 'Reservation'],
  endpoints: (builder) => ({
    // Books
    getBooks: builder.query<Book[], void>({
      query: () => ({ url: '/books' }),
      providesTags: ['Book'],
    }),
    getBook: builder.query<Book, string>({
      query: (id) => ({ url: `/books/${id}` }),
      providesTags: ['Book'],
    }),

    // Members
    getMembers: builder.query<Member[], void>({
      query: () => ({ url: '/members' }),
      providesTags: ['Member'],
    }),

    // Loans
    getLoans: builder.query<Loan[], void>({
      query: () => ({ url: '/loans' }),
      providesTags: ['Loan'],
    }),

    // Reservations
    getReservations: builder.query<Reservation[], void>({
      query: () => ({ url: '/reservations' }),
      providesTags: ['Reservation'],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useGetMembersQuery,
  useGetLoansQuery,
  useGetReservationsQuery,
} = api;
