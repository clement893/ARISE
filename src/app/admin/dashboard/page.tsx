'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  ClipboardCheck, 
  Search, 
  Filter, 
  MoreHorizontal,
  Download,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  assessmentsCompleted: number;
  userGrowth: number;
  activeRate: number;
  revenueGrowth: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
  status: string;
  progress: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    assessmentsCompleted: 0,
    userGrowth: 0,
    activeRate: 0,
    revenueGrowth: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, activeTab, searchQuery]);

  const loadData = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
    setIsLoading(false);
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    // Filter by role
    if (activeTab !== 'all') {
      filtered = filtered.filter(user => user.role === activeTab);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleExport = () => {
    // Export users to CSV
    const headers = ['Name', 'Email', 'Role', 'Plan', 'Status', 'Join Date'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role,
        user.plan,
        user.status,
        new Date(user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arise-users.csv';
    a.click();
  };

  const handleUserAction = async (userId: number, action: string) => {
    setActionMenuOpen(null);
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      
      if (response.ok) {
        loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'coach': return 'bg-[#D4A84B] text-white';
      case 'participant': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'participant', label: 'Participant' },
    { id: 'coach', label: 'Coach' },
    { id: 'admin', label: 'Admin' },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D5C5C]"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Admin</h1>
          <p className="text-gray-500">Manage users, view analytics, and configure platform settings</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D5C5C] text-white rounded-lg hover:bg-[#0a4a4a] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <div className="w-12 h-12 rounded-full bg-[#D4A84B] flex items-center justify-center">
            <span className="text-white text-lg">👤</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.userGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(stats.userGrowth)}%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-xs text-gray-400 mt-1">+{stats.userGrowth}% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600">{stats.activeRate}% active</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="text-xs text-gray-400 mt-1">{stats.activeRate}% active rate</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenueGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(stats.revenueGrowth)}%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-xs text-gray-400 mt-1">+{stats.revenueGrowth}% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.assessmentsCompleted}</p>
          <p className="text-sm text-gray-500">Assessments</p>
          <p className="text-xs text-gray-400 mt-1">Completed this month</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0D5C5C] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C] focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0D5C5C] flex items-center justify-center text-white font-medium text-sm">
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.plan === 'starter' ? 'Complete Profile' : 
                     user.plan === 'individual' ? 'Complete + Coaching' :
                     user.plan === 'coach' ? 'Coach Account' :
                     user.plan === 'business' ? 'Business Account' : user.plan}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0D5C5C] rounded-full"
                          style={{ width: `${user.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{user.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                      {user.status === 'at_risk' ? 'At Risk' : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                      {actionMenuOpen === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                          <button
                            onClick={() => handleUserAction(user.id, 'view')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'edit')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Edit User
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleUserAction(user.id, 'make_admin')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Make Admin
                            </button>
                          )}
                          <button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
