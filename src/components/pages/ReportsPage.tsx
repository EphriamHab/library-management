/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo } from 'react';
import { useGetLoansQuery, useGetBooksQuery, useGetMembersQuery } from '../../store/api';
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
  Activity
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { data: loans = [] } = useGetLoansQuery();
  const { data: books = [] } = useGetBooksQuery();
  const { data: members = [] } = useGetMembersQuery();
  
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const activeLoans = loans.filter(l => l.status === 'active');
    const overdueLoans = loans.filter(l => {
      const returnDate = new Date(l.returnDate);
      return returnDate < now && l.status === 'active';
    });
    const returnedLoans = loans.filter(l => l.status === 'returned');
    const availableBooks = books.filter(b => b.status === 'available');
    const activeMembers = members.filter(m => m.status === 'active');

    // Monthly loan trends
    const monthlyLoans = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(now.getFullYear(), i, 1);
      const monthLoans = loans.filter(l => {
        const loanDate = new Date(l.loanDate);
        return loanDate.getMonth() === i && loanDate.getFullYear() === now.getFullYear();
      });
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        loans: monthLoans.length,
        returns: monthLoans.filter(l => l.status === 'returned').length,
      };
    });

    // Popular books
    const bookLoanCounts = books.map(book => ({
      ...book,
      loanCount: loans.filter(l => l.bookId === book.id).length,
    })).sort((a, b) => b.loanCount - a.loanCount);

    // Member activity
    const memberActivity = members.map(member => ({
      ...member,
      totalLoans: loans.filter(l => l.memberId === member.id).length,
      activeLoans: activeLoans.filter(l => l.memberId === member.id).length,
      overdueLoans: overdueLoans.filter(l => l.memberId === member.id).length,
    })).sort((a, b) => b.totalLoans - a.totalLoans);

    // Category distribution
    const categoryStats = books.reduce((acc, book) => {
      const category = book.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { total: 0, loaned: 0, available: 0 };
      }
      acc[category].total++;
      if (book.status === 'available') acc[category].available++;
      if (book.status === 'borrowed') acc[category].loaned++;
      return acc;
    }, {} as Record<string, { total: number; loaned: number; available: number }>);

    return {
      totalBooks: books.length,
      totalMembers: members.length,
      totalLoans: loans.length,
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length,
      returnedLoans: returnedLoans.length,
      availableBooks: availableBooks.length,
      activeMembers: activeMembers.length,
      returnRate: loans.length > 0 ? Math.round((returnedLoans.length / loans.length) * 100) : 0,
      monthlyLoans,
      popularBooks: bookLoanCounts.slice(0, 10),
      memberActivity: memberActivity.slice(0, 10),
      categoryStats,
    };
  }, [loans, books, members]);

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'loans', name: 'Loan Analysis', icon: BookOpen },
    { id: 'members', name: 'Member Activity', icon: Users },
    { id: 'inventory', name: 'Inventory Report', icon: FileText },
    { id: 'overdue', name: 'Overdue Analysis', icon: AlertTriangle },
  ];

  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting ${selectedReport} report as ${format}`);
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.availableBooks} available
              </p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeMembers}</p>
              <p className="text-sm text-gray-500 mt-1">
                of {stats.totalMembers} total
              </p>
            </div>
            <Users className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.activeLoans}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.totalLoans} total loans
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Books</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdueLoans}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.returnRate}% return rate
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Loan Trends</h3>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
        <div className="h-64 flex items-end justify-between space-x-2">
          {stats.monthlyLoans.map((month, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '200px' }}>
                <div 
                  className="bg-blue-500 rounded-t absolute bottom-0 w-full transition-all duration-500"
                  style={{ height: `${(month.loans / Math.max(...stats.monthlyLoans.map(m => m.loans))) * 100}%` }}
                ></div>
                <div 
                  className="bg-green-500 rounded-t absolute bottom-0 w-full transition-all duration-500"
                  style={{ height: `${(month.returns / Math.max(...stats.monthlyLoans.map(m => m.loans))) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">{month.month}</p>
              <p className="text-xs font-medium text-gray-900">{month.loans}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Loans</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Returns</span>
          </div>
        </div>
      </div>

      {/* Popular Books and Active Members */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Books</h3>
          <div className="space-y-3">
            {stats.popularBooks.slice(0, 5).map((book, index) => (
              <div key={book.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{book.title}</p>
                    <p className="text-xs text-gray-500">by {book.author}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-600">{book.loanCount} loans</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Members</h3>
          <div className="space-y-3">
            {stats.memberActivity.slice(0, 5).map((member, index) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.membershipId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">{member.totalLoans} loans</span>
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

  const renderLoanAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Status Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-blue-600">{stats.activeLoans}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Active</p>
            <p className="text-xs text-gray-500">
              {stats.totalLoans > 0 ? Math.round((stats.activeLoans / stats.totalLoans) * 100) : 0}%
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-green-600">{stats.returnedLoans}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Returned</p>
            <p className="text-xs text-gray-500">{stats.returnRate}%</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-red-600">{stats.overdueLoans}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Overdue</p>
            <p className="text-xs text-gray-500">
              {stats.activeLoans > 0 ? Math.round((stats.overdueLoans / stats.activeLoans) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
        <div className="space-y-4">
          {Object.entries(stats.categoryStats).map(([category, data]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{category}</span>
                <span className="text-sm text-gray-500">{data.total} books</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(data.loaned / data.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{data.loaned} loaned</span>
                <span>{data.available} available</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentReport = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport();
      case 'loans':
        return renderLoanAnalysis();
      case 'members':
        return <div className="text-center py-12 text-gray-500">Member Activity Report - Coming Soon</div>;
      case 'inventory':
        return <div className="text-center py-12 text-gray-500">Inventory Report - Coming Soon</div>;
      case 'overdue':
        return <div className="text-center py-12 text-gray-500">Overdue Analysis - Coming Soon</div>;
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