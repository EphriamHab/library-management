// src/components/pages/Dashboard.tsx
import React from 'react';
import { useGetBooksQuery, useGetMembersQuery, useGetLoansQuery } from '../../store/api';
import { BookOpen, Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data: books = [] } = useGetBooksQuery();
  const { data: members = [] } = useGetMembersQuery();
  const { data: loans = [] } = useGetLoansQuery();

  const stats = [
    {
      title: 'Total Books',
      value: books.length,
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Members',
      value: members.filter(m => m.status === 'active').length,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Active Loans',
      value: loans.filter(l => l.status === 'active').length,
      icon: Calendar,
      color: 'bg-yellow-500',
      change: '+15%'
    },
    {
      title: 'Available Books',
      value: books.filter(b => b.status === 'available').length,
      icon: CheckCircle,
      color: 'bg-purple-500',
      change: '-3%'
    }
  ];

  const recentActivity = [
    { action: 'Book returned', item: 'The Great Gatsby', user: 'John Smith', time: '2 hours ago' },
    { action: 'New member registered', item: 'Sarah Johnson', user: 'System', time: '4 hours ago' },
    { action: 'Book borrowed', item: 'To Kill a Mockingbird', user: 'Mike Wilson', time: '6 hours ago' },
    { action: 'Book reserved', item: 'Pride and Prejudice', user: 'Emily Davis', time: '1 day ago' },
  ];

  const overdueBooks = loans.filter(loan => {
    const returnDate = new Date(loan.returnDate);
    return returnDate < new Date() && loan.status === 'active';
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-sm mt-2 ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}:</span> {activity.item}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overdue Books Alert */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Overdue Books</h2>
            </div>
          </div>
          <div className="p-6">
            {overdueBooks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No overdue books!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {overdueBooks.slice(0, 5).map((loan, index) => {
                  const book = books.find(b => b.id === loan.bookId);
                  const member = members.find(m => m.id === loan.memberId);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{book?.title}</p>
                        <p className="text-sm text-gray-600">{member?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          Due: {new Date(loan.returnDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-900">Add New Book</span>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-6 h-6 text-green-600" />
            <span className="font-medium text-gray-900">Register Member</span>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-gray-900">Process Loan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;