import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Calendar,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';
import Footer from '../common/Footer';
import OuterHeader from '../common/OuterHeader';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      title: "Smart Book Management",
      description: "Efficiently organize and track your entire book collection with advanced search and categorization."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Member Management",
      description: "Streamline member registration, profile management, and borrowing history tracking."
    },
    {
      icon: <Calendar className="w-8 h-8 text-purple-600" />,
      title: "Loan Tracking",
      description: "Monitor book loans, due dates, and automated overdue notifications seamlessly."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Secure Access",
      description: "Role-based authentication ensuring secure access for admins, librarians, and members."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-yellow-600" />,
      title: "Analytics & Reports",
      description: "Comprehensive reporting on book circulation, member activity, and library statistics."
    }
  ];

  const stats = [
    { number: "10K+", label: "Books Managed" },
    { number: "500+", label: "Active Members" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}

     <OuterHeader/>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                Trusted by 1000+ Libraries
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Modern Library
                <span className="text-blue-600 block">Management</span>
                Made Simple
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Streamline your library operations with our comprehensive management system.
                Track books, manage members, and automate workflows with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/dashboard"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors font-semibold">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { action: "Book returned", book: "The Great Gatsby", time: "2 min ago" },
                      { action: "New member", book: "John Smith", time: "5 min ago" },
                      { action: "Book borrowed", book: "To Kill a Mockingbird", time: "10 min ago" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.action}</p>
                          <p className="text-xs text-gray-500">{item.book} • {item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your library
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive suite of tools helps you streamline operations,
              improve member experience, and make data-driven decisions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-100 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to transform your library?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of libraries already using LibraryPro to streamline their operations.
          </p>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;