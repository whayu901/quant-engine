// ClientDashboard view component - clean and declarative
import React from 'react';
import {
  TrendingUp,
  Users,
  MessageCircle,
  Target,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Brush,
} from 'recharts';
import { useClientDashboardLogic } from './ClientDashboard.logic';
import { MetricCard, VirtualizedTable } from './components';
import {
  dashboardStyles,
  chartColors,
  marketOptions,
  dateRangeOptions,
  tabOptions,
  tableColumns,
  insightsData,
} from './ClientDashboard.styles';

export function ClientDashboard() {
  const {
    data,
    isLoading,
    error,
    selectedMarket,
    dateRange,
    activeTab,
    handleMarketChange,
    handleDateRangeChange,
    handleTabChange,
    handleExport,
  } = useClientDashboardLogic();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">Error loading dashboard</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className={dashboardStyles.container}>
      {/* Header */}
      <div className={dashboardStyles.header.wrapper}>
        <div className={dashboardStyles.header.content}>
          <div className={dashboardStyles.header.innerContent}>
            <div>
              <h1 className={dashboardStyles.header.title}>
                Research Insights Dashboard
              </h1>
              <p className={dashboardStyles.header.subtitle}>
                Real-time insights from your market research data
              </p>
            </div>
            <div className={dashboardStyles.header.controls}>
              <select
                value={selectedMarket}
                onChange={(e) => handleMarketChange(e.target.value)}
                className={dashboardStyles.select}
              >
                {marketOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className={dashboardStyles.select}
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleExport}
                className={dashboardStyles.exportButton}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={dashboardStyles.main}>
        {/* Key Metrics */}
        <div className={dashboardStyles.metricsGrid}>
          <MetricCard
            title="Total Responses"
            value="2.4M"
            change={12}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Avg. Satisfaction"
            value="4.2/5"
            change={5}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard
            title="NPS Score"
            value="+42"
            change={-3}
            icon={Target}
            color="purple"
          />
          <MetricCard
            title="Response Rate"
            value="68%"
            change={8}
            icon={MessageCircle}
            color="orange"
          />
        </div>

        {/* Tabs */}
        <div className={dashboardStyles.tabs.wrapper}>
          <div className={dashboardStyles.tabs.header}>
            <div className={dashboardStyles.tabs.buttonContainer}>
              {tabOptions.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={dashboardStyles.tabs.button(activeTab === tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className={dashboardStyles.tabs.content}>
            {activeTab === 'overview' && (
              <OverviewTab themeData={data.themeData} marketData={data.marketData} />
            )}

            {activeTab === 'sentiment' && (
              <SentimentTab sentimentData={data.sentimentData} />
            )}

            {activeTab === 'concepts' && (
              <ConceptsTab conceptData={data.conceptData} />
            )}

            {activeTab === 'data' && (
              <DataTab responses={data.responses} />
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className={dashboardStyles.insights.wrapper}>
          <h3 className={dashboardStyles.insights.title}>AI-Generated Insights</h3>
          <div className={dashboardStyles.insights.grid}>
            {insightsData.map((insight, index) => (
              <div
                key={index}
                className={dashboardStyles.insights.card(insight.borderColor)}
              >
                <p className={dashboardStyles.insights.cardTitle}>
                  {insight.title}
                </p>
                <p className={dashboardStyles.insights.cardText}>
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ themeData, marketData }: {
  themeData: any[];
  marketData: any[];
}) {
  return (
    <div className={dashboardStyles.charts.section}>
      {/* Theme Performance Over Time */}
      <div>
        <h3 className={dashboardStyles.charts.title}>
          Theme Performance Trends
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={themeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Price Sensitivity"
              stroke={chartColors.priceSensitivity}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Quality"
              stroke={chartColors.quality}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Brand Trust"
              stroke={chartColors.brandTrust}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="User Experience"
              stroke={chartColors.userExperience}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Innovation"
              stroke={chartColors.innovation}
              strokeWidth={2}
            />
            <Brush dataKey="date" height={30} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Market Comparison */}
      <div className={dashboardStyles.charts.grid}>
        <div>
          <h3 className={dashboardStyles.charts.title}>
            Market Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="market" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="satisfaction" fill={chartColors.satisfaction} />
              <Bar dataKey="nps" fill={chartColors.nps} />
              <Bar dataKey="retention" fill={chartColors.retention} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className={dashboardStyles.charts.title}>
            Growth by Market
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="market" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="growth"
                stroke={chartColors.growth}
                fill="#c084fc"
              />
              <ReferenceLine y={15} label="Target" stroke={chartColors.target} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SentimentTab({ sentimentData }: { sentimentData: any[] }) {
  return (
    <div className={dashboardStyles.charts.grid}>
      <div>
        <h3 className={dashboardStyles.charts.title}>
          Sentiment Distribution
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={sentimentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              <Cell fill={chartColors.positive} />
              <Cell fill={chartColors.neutral} />
              <Cell fill={chartColors.negative} />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className={dashboardStyles.charts.title}>
          Sentiment Metrics
        </h3>
        <div className={dashboardStyles.sentimentMetrics.container}>
          {sentimentData.map((item, index) => (
            <div key={index}>
              <div className={dashboardStyles.sentimentMetrics.item}>
                <span className={dashboardStyles.sentimentMetrics.label}>
                  {item.name}
                </span>
                <span className={dashboardStyles.sentimentMetrics.value}>
                  {item.value.toLocaleString()} responses
                </span>
              </div>
              <div className={dashboardStyles.sentimentMetrics.progressBar}>
                <div
                  className={dashboardStyles.sentimentMetrics.progressFill(
                    item.name,
                  )}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <p className={dashboardStyles.sentimentMetrics.percentage}>
                {item.percentage}% of total
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConceptsTab({ conceptData }: { conceptData: any[] }) {
  return (
    <div>
      <h3 className={dashboardStyles.charts.title}>
        Concept Testing Results
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={conceptData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="concept" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Appeal"
            dataKey="appeal"
            stroke={chartColors.appeal}
            fill={chartColors.appeal}
            fillOpacity={0.6}
          />
          <Radar
            name="Uniqueness"
            dataKey="uniqueness"
            stroke={chartColors.uniqueness}
            fill={chartColors.uniqueness}
            fillOpacity={0.6}
          />
          <Radar
            name="Believability"
            dataKey="believability"
            stroke={chartColors.believability}
            fill={chartColors.believability}
            fillOpacity={0.6}
          />
          <Radar
            name="Purchase Intent"
            dataKey="purchase_intent"
            stroke={chartColors.purchaseIntent}
            fill={chartColors.purchaseIntent}
            fillOpacity={0.6}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DataTab({ responses }: { responses: any[] }) {
  return (
    <div>
      <h3 className={dashboardStyles.charts.title}>
        Response Data (Virtualized for Performance)
      </h3>
      <div className={dashboardStyles.dataTable.info}>
        Showing 100 of 2.4M records - Virtualized rendering for smooth
        scrolling
      </div>
      <div
        className={dashboardStyles.dataTable.wrapper}
        style={{ height: '500px' }}
      >
        <div className={dashboardStyles.dataTable.header}>
          <div className={dashboardStyles.dataTable.headerCell}>ID</div>
          <div className={dashboardStyles.dataTable.headerCell}>Respondent</div>
          <div className={dashboardStyles.dataTable.headerCell}>Market</div>
          <div className={dashboardStyles.dataTable.headerCell}>Sentiment</div>
          <div className={dashboardStyles.dataTable.headerCell}>Score</div>
          <div className={dashboardStyles.dataTable.headerCell}>Date</div>
        </div>
        <VirtualizedTable data={responses} columns={tableColumns} />
      </div>
    </div>
  );
}

export default ClientDashboard;
