import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, tasksAPI } from '../services/api';
import BMICalculator from '../components/BMICalculator';
import TaskList from '../components/TaskList';
import AIRecommendations from '../components/AIRecommendations';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [bmiHistory, setBmiHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileResponse, statsResponse, bmiResponse] = await Promise.all([
        userAPI.getProfile(),
        tasksAPI.getTaskStats(),
        userAPI.getBMIHistory(),
      ]);

      updateUser(profileResponse.data);
      setStats(statsResponse.data);
      setBmiHistory(bmiResponse.data.slice(0, 10)); // Last 10 entries
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBMIUpdate = (newBMI) => {
    updateUser({ ...user, currentBMI: newBMI });
    fetchDashboardData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'bmi', name: 'BMI Tracker' },
    { id: 'tasks', name: 'Tasks' },
    { id: 'ai', name: 'AI Recommendations' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your health journey and get personalized recommendations
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">BMI</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Current BMI</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user?.currentBMI || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                        <span className="text-success-600 font-semibold">✓</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.completedTasks}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                        <span className="text-warning-600 font-semibold">⏱</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.pendingTasks}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">%</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.completionRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BMI History Chart */}
            {bmiHistory.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">BMI History</h3>
                <div className="space-y-2">
                  {bmiHistory.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <span className="text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">BMI: {entry.bmi}</span>
                        <span className="text-sm text-gray-500">Weight: {entry.weight}kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('bmi')}
                  className="btn btn-primary p-4 text-left"
                >
                  <div className="font-medium">Update BMI</div>
                  <div className="text-sm opacity-75">Track your progress</div>
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="btn btn-secondary p-4 text-left"
                >
                  <div className="font-medium">Add Task</div>
                  <div className="text-sm opacity-75">Plan your day</div>
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className="btn btn-secondary p-4 text-left"
                >
                  <div className="font-medium">Get AI Advice</div>
                  <div className="text-sm opacity-75">Personalized recommendations</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bmi' && (
          <BMICalculator onBMIUpdate={handleBMIUpdate} />
        )}

        {activeTab === 'tasks' && (
          <TaskList onTaskUpdate={fetchDashboardData} />
        )}

        {activeTab === 'ai' && (
          <AIRecommendations />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
