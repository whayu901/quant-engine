/**
 * Admin Dashboard View - SOLID: Interface Segregation Principle
 * Pure presentation component - NO business logic
 * All data and handlers passed as props
 */

import React from 'react';
import { AdminAnalytics, UserActivity, UserManagementData } from '../../models/entities/AdminAnalytics';

// ISP: Segregated interfaces for different concerns
export interface AdminDashboardViewProps {
  analytics: AdminAnalytics | null;
  realtimeMetrics: {
    activeUsers: number;
    activeAnalyses: number;
    systemLoad: number;
    queueDepth: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onRefresh: () => void;
}

export interface MetricsOverviewProps {
  analytics: AdminAnalytics;
  realtimeMetrics: {
    activeUsers: number;
    activeAnalyses: number;
    systemLoad: number;
    queueDepth: number;
  } | null;
}

export interface UserManagementViewProps {
  users: UserManagementData[];
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onUserSelect: (userId: string) => void;
  onInviteUser: () => void;
  onSuspendUser: (userId: string) => void;
  onBulkAction: (userIds: string[], action: 'suspend' | 'unsuspend' | 'delete') => void;
}

export interface ActivityFeedProps {
  activities: UserActivity[];
  isLoading: boolean;
  onLoadMore: () => void;
}

/**
 * Admin Dashboard View Component
 * Pure presentation - delegates all actions to parent
 */
export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  analytics,
  realtimeMetrics,
  isLoading,
  error,
  dateRange,
  onDateRangeChange,
  onRefresh
}) => {
  if (isLoading && !analytics) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-spinner">Loading analytics...</div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="admin-dashboard error">
        <div className="error-message">{error}</div>
        <button className="btn btn-primary" onClick={onRefresh}>
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <AdminHeader
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        onRefresh={onRefresh}
      />

      <MetricsOverview analytics={analytics} realtimeMetrics={realtimeMetrics} />

      <VisualizationSection analytics={analytics} />

      <SystemHealth analytics={analytics} />

      {error && (
        <div className="admin-error-toast">
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Admin Header - Pure presentation
 */
interface AdminHeaderProps {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onRefresh: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ dateRange, onDateRangeChange, onRefresh }) => {
  return (
    <div className="admin-header">
      <div className="header-content">
        <h1>Admin Dashboard</h1>
        <p>Monitor system performance and user activity</p>
      </div>

      <div className="header-actions">
        <div className="date-range-picker">
          <input
            type="date"
            value={dateRange.startDate.toISOString().split('T')[0]}
            onChange={(e) => onDateRangeChange(new Date(e.target.value), dateRange.endDate)}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate.toISOString().split('T')[0]}
            onChange={(e) => onDateRangeChange(dateRange.startDate, new Date(e.target.value))}
          />
        </div>

        <button className="btn btn-secondary" onClick={onRefresh}>
          <span className="icon-refresh">🔄</span>
          Refresh
        </button>
      </div>
    </div>
  );
};

/**
 * Metrics Overview - Pure presentation
 * Hero metrics highlighting SPEED (8 hours → 5 minutes)
 */
const MetricsOverview: React.FC<MetricsOverviewProps> = ({ analytics, realtimeMetrics }) => {
  return (
    <div className="metrics-overview">
      {/* Hero Metric: Time Saved */}
      <div className="metric-card hero-metric">
        <div className="metric-icon speed">⚡</div>
        <div className="metric-content">
          <div className="metric-label">Total Time Saved</div>
          <div className="metric-value">
            {analytics.timeSavedHours.toLocaleString()}
            <span className="metric-unit">hours</span>
          </div>
          <div className="metric-insight">
            <span className="highlight">96x faster</span> than traditional methods
            <br />
            <span className="detail">8 hours → 5 minutes per analysis</span>
          </div>
        </div>
      </div>

      {/* User Activity Metrics */}
      <div className="metric-card">
        <div className="metric-icon">👥</div>
        <div className="metric-content">
          <div className="metric-label">Active Users</div>
          <div className="metric-value">
            {realtimeMetrics?.activeUsers || analytics.userActivity.activeUsers}
          </div>
          <div className="metric-trend positive">
            +{analytics.userActivity.newUsers} new this period
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="metric-card">
        <div className="metric-icon">📊</div>
        <div className="metric-content">
          <div className="metric-label">Analyses Completed</div>
          <div className="metric-value">
            {analytics.usage.totalAnalyses.toLocaleString()}
          </div>
          <div className="metric-detail">
            {analytics.usage.totalMinutesProcessed.toLocaleString()} minutes processed
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="metric-card">
        <div className="metric-icon">
          {analytics.systemHealth.status === 'healthy' ? '✅' : '⚠️'}
        </div>
        <div className="metric-content">
          <div className="metric-label">System Health</div>
          <div className={`metric-value status-${analytics.systemHealth.status}`}>
            {analytics.healthScore.toFixed(1)}%
          </div>
          <div className="metric-detail">
            {analytics.systemHealth.uptime.toFixed(2)}% uptime
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Visualization Section - Pure presentation
 */
const VisualizationSection: React.FC<{ analytics: AdminAnalytics }> = ({ analytics }) => {
  return (
    <div className="visualization-section">
      <div className="chart-grid">
        {/* Time Series Chart */}
        <div className="chart-card large">
          <h3>Analysis Volume Over Time</h3>
          <div className="chart-container">
            {/* Chart component would go here */}
            <div className="chart-placeholder">
              Time series chart showing analysis volume
              <br />
              {analytics.timeSeries.analysisVolume.length} data points
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="chart-card">
          <h3>Geographic Distribution (SEA)</h3>
          <div className="geographic-list">
            {analytics.topCountries.map(country => (
              <div key={country.countryCode} className="country-item">
                <span className="country-flag">{country.countryCode}</span>
                <span className="country-name">{country.country}</span>
                <span className="country-count">{country.userCount} users</span>
                <div className="country-bar">
                  <div
                    className="country-bar-fill"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="chart-card">
          <h3>Revenue Overview</h3>
          <div className="revenue-metrics">
            <div className="revenue-item">
              <div className="revenue-label">MRR</div>
              <div className="revenue-value">
                ${analytics.revenue.mrr.toLocaleString()}
              </div>
            </div>
            <div className="revenue-item">
              <div className="revenue-label">ARR</div>
              <div className="revenue-value">
                ${analytics.revenue.arr.toLocaleString()}
              </div>
            </div>
            <div className="revenue-item">
              <div className="revenue-label">Growth Rate</div>
              <div className="revenue-value positive">
                +{analytics.revenue.growthRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* System Load Chart */}
        <div className="chart-card">
          <h3>System Load</h3>
          <div className="system-metrics">
            <div className="system-metric">
              <span className="metric-label">API Response Time</span>
              <span className="metric-value">
                {analytics.systemHealth.apiResponseTime}ms
              </span>
            </div>
            <div className="system-metric">
              <span className="metric-label">Cache Hit Rate</span>
              <span className="metric-value">
                {analytics.systemHealth.cacheHitRate.toFixed(1)}%
              </span>
            </div>
            <div className="system-metric">
              <span className="metric-label">Error Rate</span>
              <span className="metric-value">
                {analytics.systemHealth.errorRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * System Health Indicators - Pure presentation
 */
const SystemHealth: React.FC<{ analytics: AdminAnalytics }> = ({ analytics }) => {
  const { systemHealth } = analytics;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#10B981';
      case 'degraded':
        return '#F59E0B';
      case 'down':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="system-health-section">
      <h2>System Health Monitoring</h2>

      <div className="health-cards">
        <div className="health-card">
          <div className="health-header">
            <h3>System Status</h3>
            <div
              className="health-indicator"
              style={{ backgroundColor: getStatusColor(systemHealth.status) }}
            >
              {systemHealth.status.toUpperCase()}
            </div>
          </div>
          <div className="health-metrics">
            <div className="health-metric">
              <span>Uptime</span>
              <strong>{systemHealth.uptime.toFixed(2)}%</strong>
            </div>
            <div className="health-metric">
              <span>Active Connections</span>
              <strong>{systemHealth.activeConnections}</strong>
            </div>
          </div>
        </div>

        <div className="health-card">
          <div className="health-header">
            <h3>Performance</h3>
          </div>
          <div className="health-metrics">
            <div className="health-metric">
              <span>API Response Time</span>
              <strong>{systemHealth.apiResponseTime}ms</strong>
            </div>
            <div className="health-metric">
              <span>Queue Depth</span>
              <strong>{systemHealth.queueDepth}</strong>
            </div>
          </div>
        </div>

        <div className="health-card">
          <div className="health-header">
            <h3>Reliability</h3>
          </div>
          <div className="health-metrics">
            <div className="health-metric">
              <span>Cache Hit Rate</span>
              <strong>{systemHealth.cacheHitRate.toFixed(1)}%</strong>
            </div>
            <div className="health-metric">
              <span>Error Rate</span>
              <strong>{systemHealth.errorRate.toFixed(2)}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * User Management Table - Pure presentation
 */
export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  totalUsers,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onUserSelect,
  onInviteUser,
  onSuspendUser,
  onBulkAction
}) => {
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="user-management-view">
      <div className="management-header">
        <h2>User Management</h2>
        <button className="btn btn-primary" onClick={onInviteUser}>
          <span className="icon-plus">+</span>
          Invite User
        </button>
      </div>

      {selectedUsers.length > 0 && (
        <div className="bulk-actions-toolbar">
          <span>{selectedUsers.length} users selected</span>
          <div className="bulk-actions">
            <button
              className="btn btn-sm"
              onClick={() => onBulkAction(selectedUsers, 'suspend')}
            >
              Suspend
            </button>
            <button
              className="btn btn-sm"
              onClick={() => onBulkAction(selectedUsers, 'unsuspend')}
            >
              Unsuspend
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onBulkAction(selectedUsers, 'delete')}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          <table className="user-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Projects</th>
                <th>Storage</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td>
                    <button
                      className="user-link"
                      onClick={() => onUserSelect(user.id)}
                    >
                      {user.fullName}
                    </button>
                  </td>
                  <td>{user.email}</td>
                  <td><span className="role-badge">{user.role}</span></td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.projectCount}</td>
                  <td>{user.storageUsed.toFixed(2)} GB</td>
                  <td>
                    {user.lastLoginAt?.toLocaleDateString() || 'Never'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm"
                        onClick={() => onSuspendUser(user.id)}
                      >
                        {user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <span>
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers}
            </span>
            <div className="pagination-controls">
              <button
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                className="btn btn-sm"
                disabled={currentPage * pageSize >= totalUsers}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Activity Feed - Pure presentation
 */
export const ActivityFeedView: React.FC<ActivityFeedProps> = ({
  activities,
  isLoading,
  onLoadMore
}) => {
  return (
    <div className="activity-feed-view">
      <h2>Recent Activity</h2>

      {isLoading ? (
        <div className="loading">Loading activities...</div>
      ) : (
        <>
          <div className="activity-list">
            {activities.map((activity, index) => (
              <div key={`${activity.userId}-${index}`} className="activity-item">
                <div className="activity-icon">
                  {getActivityIcon(activity.action)}
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <strong>{activity.userName}</strong>
                    <span>{activity.displayAction}</span>
                  </div>
                  <div className="activity-meta">
                    {activity.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={onLoadMore}>
            Load More
          </button>
        </>
      )}
    </div>
  );
};

function getActivityIcon(action: string): string {
  const iconMap: Record<string, string> = {
    create: '➕',
    update: '✏️',
    delete: '🗑️',
    login: '🔐',
    logout: '🚪',
    upload: '📤',
    download: '📥',
    share: '🔗'
  };
  return iconMap[action] || '📋';
}
