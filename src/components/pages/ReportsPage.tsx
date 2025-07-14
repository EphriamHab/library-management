/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  Filter,
  FileText,
  PieChart,
  Activity,
  RefreshCw,
  Mail,
  Phone,
  Eye,
  ExternalLink
} from 'lucide-react';
import { 
  useGetBooksQuery, 
  useGetLoansQuery, 
  useGetMembersQuery,
  useGetBooksOnLoanQuery,
  useGetOverdueBooksQuery,
  useGetMemberLoanHistoryQuery
} from '../../store/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ReportsPage: React.FC = () => {
  const { data: loansData, isLoading: loansLoading, refetch: refetchLoans } = useGetLoansQuery();
  const { data: booksData, isLoading: booksLoading, refetch: refetchBooks } = useGetBooksQuery();
  const { data: membersData, isLoading: membersLoading, refetch: refetchMembers } = useGetMembersQuery({});
  const { data: booksOnLoanData, isLoading: booksOnLoanLoading, refetch: refetchBooksOnLoan } = useGetBooksOnLoanQuery();
  const { data: overdueBooksData, isLoading: overdueBooksLoading, refetch: refetchOverdueBooks } = useGetOverdueBooksQuery();
  
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [selectedMember, setSelectedMember] = useState<string>('');

  const loans = loansData?.message?.data || [];
  const books = booksData?.message?.data || [];
  const members = membersData?.message?.data || [];
  const booksOnLoan = booksOnLoanData?.message?.data || [];
  const overdueBooks = overdueBooksData?.message?.data || [];

  const isLoading = loansLoading || booksLoading || membersLoading;

  const stats = useMemo(() => {
    const now = new Date();
    const activeLoans = loans.filter(l => l.status === 'Active');
    const returnedLoans = loans.filter(l => l.status === 'Returned');
    const availableBooks = books.filter(b => b.status === 'Available');
    const activeMembers = members.filter((m: { status: string; }) => m.status === 'Active');

    const monthlyLoans = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLoans = loans.filter(l => {
        const loanDate = new Date(l.loan_date);
        return loanDate.getMonth() === month.getMonth() && 
               loanDate.getFullYear() === month.getFullYear();
      });
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        loans: monthLoans.length,
        returns: monthLoans.filter(l => l.status === 'Returned').length,
      };
    }).reverse();

    // Popular books analysis
    const bookLoanCounts = books.map(book => ({
      ...book,
      loanCount: loans.filter(l => l.book === book.name).length,
    })).sort((a, b) => b.loanCount - a.loanCount);

    // Member activity analysis
    const memberActivity = members.map((member: { name: string; }) => ({
      ...member,
      totalLoans: loans.filter(l => l.member === member.name).length,
      activeLoans: activeLoans.filter(l => l.member === member.name).length,
      overdueLoans: overdueBooks.filter((l: { member: string; }) => l.member === member.name).length,
    })).sort((a:any, b:any) => b.totalLoans - a.totalLoans);

    // Category distribution
    const categoryStats = books.reduce((acc, book) => {
      const category = book.status || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { total: 0, loaned: 0, available: 0 };
      }
      acc[category].total++;
      if (book.status === 'Available') acc[category].available++;
      if (book.status === 'Loaned') acc[category].loaned++;
      return acc;
    }, {} as Record<string, { total: number; loaned: number; available: number }>);

    return {
      totalBooks: books.length,
      totalMembers: members.length,
      totalLoans: loans.length,
      activeLoans: activeLoans.length,
      overdueLoans: overdueBooks.length,
      returnedLoans: returnedLoans.length,
      availableBooks: availableBooks.length,
      activeMembers: activeMembers.length,
      returnRate: loans.length > 0 ? Math.round((returnedLoans.length / loans.length) * 100) : 0,
      monthlyLoans,
      popularBooks: bookLoanCounts.slice(0, 10),
      memberActivity: memberActivity.slice(0, 10),
      categoryStats,
    };
  }, [loans, books, members, overdueBooks]);

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'loans', name: 'Active Loans', icon: BookOpen },
    { id: 'overdue', name: 'Overdue Analysis', icon: AlertTriangle },
    { id: 'members', name: 'Member Activity', icon: Users },
    { id: 'inventory', name: 'Inventory Report', icon: FileText },
  ];

  const handleRefreshData = () => {
    refetchLoans();
    refetchBooks();
    refetchMembers();
    refetchBooksOnLoan();
    refetchOverdueBooks();
  };
  const handleExportReport = (format: 'pdf' | 'excel') => {
    const doc = format === 'pdf' ? new jsPDF() : null;
    const reportData: any[] = [];
    const reportTitle = reportTypes.find(r => r.id === selectedReport)?.name || 'Library Report';
    const timestamp = new Date().toLocaleString();

    // Helper function to format date
    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    };

    // Prepare data based on selected report
    switch (selectedReport) {
      case 'overview':
        { reportData.push([
          { title: 'Total Books', value: stats.totalBooks },
          { title: 'Available Books', value: stats.availableBooks },
          { title: 'Total Members', value: stats.totalMembers },
          { title: 'Active Members', value: stats.activeMembers },
          { title: 'Total Loans', value: stats.totalLoans },
          { title: 'Active Loans', value: stats.activeLoans },
          { title: 'Overdue Loans', value: stats.overdueLoans },
          { title: 'Return Rate', value: `${stats.returnRate}%` }
        ]);
        const monthlyData = stats.monthlyLoans.map(m => ({
          Month: m.month,
          Loans: m.loans,
          Returns: m.returns
        }));

        // Popular books
        const popularBooksData = stats.popularBooks.map((b, index) => ({
          Rank: index + 1,
          Title: b.title,
          Author: b.author,
          Loans: b.loanCount
        }));

        const activeMembersData = stats.memberActivity.map((m: { name1: any; membership_id: any; totalLoans: any; activeLoans: any; overdueLoans: any; }, index: number) => ({
          Rank: index + 1,
          Name: m.name1,
          MembershipID: m.membership_id,
          TotalLoans: m.totalLoans,
          ActiveLoans: m.activeLoans,
          OverdueLoans: m.overdueLoans
        }));

        if (format === 'pdf') {
          doc?.text(`${reportTitle} - Overview`, 14, 20);
          doc?.text(`Generated: ${timestamp}`, 14, 30);
          
          autoTable(doc!, {
            startY: 40,
            head: [['Metric', 'Value']],
            body: reportData[0].map((item: any) => [item.title, item.value]),
            theme: 'striped'
          });

          autoTable(doc!, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Month', 'Loans', 'Returns']],
            body: monthlyData.map(m => [m.Month, m.Loans, m.Returns]),
            theme: 'striped'
          });

          autoTable(doc!, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Rank', 'Title', 'Author', 'Loans']],
            body: popularBooksData.map(b => [b.Rank, b.Title, b.Author, b.Loans]),
            theme: 'striped'
          });

          autoTable(doc!, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Rank', 'Name', 'Membership ID', 'Total Loans', 'Active Loans', 'Overdue Loans']],
            body: activeMembersData.map((m: { Rank: any; Name: any; MembershipID: any; TotalLoans: any; ActiveLoans: any; OverdueLoans: any; }) => [m.Rank, m.Name, m.MembershipID, m.TotalLoans, m.ActiveLoans, m.OverdueLoans]),
            theme: 'striped'
          });
        } else {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData[0]), 'Summary');
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlyData), 'Monthly Trends');
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(popularBooksData), 'Popular Books');
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(activeMembersData), 'Active Members');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${reportTitle}_${timestamp}.xlsx`);
        }
        break; }

      case 'loans':
        reportData.push(...booksOnLoan.map((loan: any) => ({
          BookTitle: loan.book_title,
          Author: loan.book_author,
          Member: loan.member_name,
          MemberID: loan.member_id,
          LoanDate: formatDate(loan.loan_date),
          DueDate: formatDate(loan.return_date),
          Status: loan.status
        })));

        if (format === 'pdf') {
          doc?.text(`${reportTitle} - Active Loans`, 14, 20);
          doc?.text(`Generated: ${timestamp}`, 14, 30);
          
          autoTable(doc!, {
            startY: 40,
            head: [['Book Title', 'Author', 'Member', 'Member ID', 'Loan Date', 'Due Date', 'Status']],
            body: reportData.map(loan => [
              loan.BookTitle,
              loan.Author,
              loan.Member,
              loan.MemberID,
              loan.LoanDate,
              loan.DueDate,
              loan.Status
            ]),
            theme: 'striped'
          });
        } else {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData), 'Active Loans');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${reportTitle}_${timestamp}.xlsx`);
        }
        break;

      case 'overdue':
        reportData.push(...overdueBooks.map((loan: any) => ({
          BookTitle: loan.book_title,
          Author: loan.book_author,
          Member: loan.member_name,
          MemberID: loan.member_id,
          DueDate: formatDate(loan.return_date),
          DaysOverdue: loan.days_overdue,
          Email: loan.member_email
        })));

        if (format === 'pdf') {
          doc?.text(`${reportTitle} - Overdue Books`, 14, 20);
          doc?.text(`Generated: ${timestamp}`, 14, 30);
          
          autoTable(doc!, {
            startY: 40,
            head: [['Book Title', 'Author', 'Member', 'Member ID', 'Due Date', 'Days Overdue', 'Email']],
            body: reportData.map(loan => [
              loan.BookTitle,
              loan.Author,
              loan.Member,
              loan.MemberID,
              loan.DueDate,
              loan.DaysOverdue,
              loan.Email
            ]),
            theme: 'striped'
          });
        } else {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData), 'Overdue Books');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${reportTitle}_${timestamp}.xlsx`);
        }
        break;

      case 'members':
        reportData.push(...stats.memberActivity.map((member: any, index: number) => ({
          Rank: index + 1,
          Name: member.name1,
          MembershipID: member.membership_id,
          TotalLoans: member.totalLoans,
          ActiveLoans: member.activeLoans,
          OverdueLoans: member.overdueLoans
        })));

        if (format === 'pdf') {
          doc?.text(`${reportTitle} - Member Activity`, 14, 20);
          doc?.text(`Generated: ${timestamp}`, 14, 30);
          
          autoTable(doc!, {
            startY: 40,
            head: [['Rank', 'Name', 'Membership ID', 'Total Loans', 'Active Loans', 'Overdue Loans']],
            body: reportData.map(member => [
              member.Rank,
              member.Name,
              member.MembershipID,
              member.TotalLoans,
              member.ActiveLoans,
              member.OverdueLoans
            ]),
            theme: 'striped'
          });
        } else {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData), 'Member Activity');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${reportTitle}_${timestamp}.xlsx`);
        }
        break;

      case 'inventory':
        reportData.push(...Object.entries(stats.categoryStats).map(([category, data]) => ({
          Category: category,
          Total: data.total,
          Loaned: data.loaned,
          Available: data.available
        })));

        if (format === 'pdf') {
          doc?.text(`${reportTitle} - Inventory`, 14, 20);
          doc?.text(`Generated: ${timestamp}`, 14, 30);
          
          autoTable(doc!, {
            startY: 40,
            head: [['Category', 'Total', 'Loaned', 'Available']],
            body: reportData.map(item => [
              item.Category,
              item.Total,
              item.Loaned,
              item.Available
            ]),
            theme: 'striped'
          });
        } else {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData), 'Inventory');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${reportTitle}_${timestamp}.xlsx`);
        }
        break;
    }

    if (format === 'pdf') {
      doc?.save(`${reportTitle}_${timestamp}.pdf`);
    }
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Books</p>
              <p className="text-3xl font-bold">{stats.totalBooks}</p>
              <p className="text-blue-100 text-sm mt-1">
                {stats.availableBooks} available
              </p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Members</p>
              <p className="text-3xl font-bold">{stats.activeMembers}</p>
              <p className="text-green-100 text-sm mt-1">
                of {stats.totalMembers} total
              </p>
            </div>
            <Users className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Active Loans</p>
              <p className="text-3xl font-bold">{stats.activeLoans}</p>
              <p className="text-yellow-100 text-sm mt-1">
                {stats.totalLoans} total loans
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Overdue Books</p>
              <p className="text-3xl font-bold">{stats.overdueLoans}</p>
              <p className="text-red-100 text-sm mt-1">
                {stats.returnRate}% return rate
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-200" />
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Loan Trends</h3>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
        <div className="h-80">
          <div className="h-64 flex items-end justify-between space-x-2">
            {stats.monthlyLoans.map((month, index) => {
              const maxLoans = Math.max(...stats.monthlyLoans.map(m => m.loans));
              const loanHeight = maxLoans > 0 ? (month.loans / maxLoans) * 100 : 0;
              const returnHeight = maxLoans > 0 ? (month.returns / maxLoans) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t relative" style={{ height: '200px' }}>
                    <div 
                      className="bg-blue-500 rounded-t absolute bottom-0 w-full transition-all duration-500 hover:bg-blue-600"
                      style={{ height: `${loanHeight}%` }}
                      title={`${month.loans} loans`}
                    ></div>
                    <div 
                      className="bg-green-500 rounded-t absolute bottom-0 w-3/4 transition-all duration-500 hover:bg-green-600"
                      style={{ height: `${returnHeight}%` }}
                      title={`${month.returns} returns`}
                    ></div>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-600">{month.month}</p>
                    <p className="text-sm font-medium text-gray-900">{month.loans}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Total Loans</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Books and Active Members */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Books</h3>
          <div className="space-y-4">
            {stats.popularBooks.slice(0, 5).map((book, index) => (
              <div key={book.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-gray-500 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{book.title}</p>
                    <p className="text-xs text-gray-500">by {book.author}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-blue-600">{book.loanCount}</span>
                  <p className="text-xs text-gray-500">loans</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Members</h3>
          <div className="space-y-4">
            {stats.memberActivity.slice(0, 5).map((member:any, index:any) => (
              <div key={member.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-gray-500 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name1}</p>
                    <p className="text-xs text-gray-500">{member.membership_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">{member.totalLoans}</span>
                  <p className="text-xs text-gray-500">loans</p>
                  {member.activeLoans > 0 && (
                    <p className="text-xs text-blue-600">{member.activeLoans} active</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveLoansReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Currently Active Loans</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Total: {booksOnLoan.length}</span>
            <button
              onClick={refetchBooksOnLoan}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {booksOnLoanLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {booksOnLoan.map((loan:any) => (
                  <tr key={loan.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{loan.book_title}</p>
                        <p className="text-xs text-gray-500">by {loan.book_author}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{loan.member_name}</p>
                        <p className="text-xs text-gray-500">{loan.member_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(loan.loan_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(loan.return_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderOverdueReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Overdue Books Analysis</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-red-600 font-medium">
              {overdueBooks.length} overdue items
            </span>
            <button
              onClick={refetchOverdueBooks}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {overdueBooksLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : overdueBooks.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Overdue Books</h3>
            <p className="text-gray-500">All books are returned on time!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Overdue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overdueBooks.map((loan:any) => (
                  <tr key={loan.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{loan.book_title}</p>
                        <p className="text-xs text-gray-500">by {loan.book_author}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{loan.member_name}</p>
                        <p className="text-xs text-gray-500">{loan.member_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-red-600 font-medium">
                        {new Date(loan.return_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {loan.days_overdue} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title={`Email: ${loan.member_email}`}
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Call member"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderMemberActivityReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Activity Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">{stats.activeMembers}</div>
            <div className="text-sm text-gray-600">Active Members</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {Math.round(stats.totalLoans / stats.totalMembers) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Loans per Member</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">{stats.returnRate}%</div>
            <div className="text-sm text-gray-600">Return Rate</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Most Active Members</h3>
        <div className="space-y-3">
          {stats.memberActivity.slice(0, 10).map((member:any, index:any) => (
            <div key={member.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name1}</p>
                  <p className="text-xs text-gray-500">{member.membership_id}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">{member.totalLoans}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-600">{member.activeLoans}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-red-600">{member.overdueLoans}</div>
                    <div className="text-xs text-gray-500">Overdue</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Category Distribution</h3>
        <div className="space-y-4">
          {Object.entries(stats.categoryStats).map(([category, data]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{category}</span>
                <span className="text-sm text-gray-500">{data.total} books</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="flex rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full"
                    style={{ width: `${(data.loaned / data.total) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-green-500 h-full"
                    style={{ width: `${(data.available / data.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{data.loaned} loaned</span>
                <span>{data.available} available</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">{stats.totalBooks}</div>
            <div className="text-sm text-gray-600">Total Books</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">{stats.availableBooks}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-2">{stats.activeLoans}</div>
            <div className="text-sm text-gray-600">On Loan</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-2">{stats.overdueLoans}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentReport = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport();
      case 'loans':
        return renderActiveLoansReport();
      case 'overdue':
        return renderOverdueReport();
      case 'members':
        return renderMemberActivityReport();
      case 'inventory':
        return renderInventoryReport();
      default:
        return renderOverviewReport();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive library performance insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExportReport('pdf')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleExportReport('excel')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex space-x-1">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedReport === report.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <report.icon className="w-4 h-4" />
              <span className="font-medium">{report.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      {renderCurrentReport()}
    </div>
  );
};

export default ReportsPage;