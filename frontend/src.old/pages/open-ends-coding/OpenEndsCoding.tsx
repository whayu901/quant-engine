// OpenEndsCoding component - View layer only
import React from 'react';
import {
  Hash,
  Brain,
  Download,
  Filter,
  Tag,
  CheckSquare,
  Zap,
  Search,
} from 'lucide-react';
import { List } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useOpenEndsCoding } from './OpenEndsCoding.logic';
import { styles, parseStyle } from './OpenEndsCoding.styles';
import ResponseRow from './components/ResponseRow';
import CodebookPanel from './components/CodebookPanel';

export default function OpenEndsCoding() {
  const {
    loading,
    responses,
    codes,
    filteredResponses,
    selectedResponses,
    aiProgress,
    codeDistribution,
    marketDistribution,
    codedPercentage,
    filters,
    updateFilter,
    toggleResponseSelection,
    handleAICoding,
    handleBulkCode,
    handleAddCode,
    handleEditCode,
    handleDeleteCode,
  } = useOpenEndsCoding();

  if (loading) {
    return (
      <div style={parseStyle(styles.loading.wrapper)}>
        <div style={parseStyle(styles.loading.spinner)} />
      </div>
    );
  }

  return (
    <div style={parseStyle(styles.container)}>
      {/* Header */}
      <div style={parseStyle(styles.header.wrapper)}>
        <div style={parseStyle(styles.header.inner)}>
          <h1 style={parseStyle(styles.header.title)}>Open Ends Coding</h1>
          <p style={parseStyle(styles.header.subtitle)}>
            AI-assisted coding for open-ended survey responses
          </p>
        </div>
      </div>

      <div style={parseStyle(styles.main.wrapper)}>
        {/* Stats Cards */}
        <div style={parseStyle(styles.statsGrid.wrapper)}>
          <div style={parseStyle(styles.statCard.wrapper)}>
            <div style={parseStyle(styles.statCard.inner)}>
              <div style={parseStyle(styles.statCard.content)}>
                <p style={parseStyle(styles.statCard.value)}>
                  {responses.length.toLocaleString()}
                </p>
                <p style={parseStyle(styles.statCard.label)}>Total Responses</p>
              </div>
              <Hash
                className="h-8 w-8"
                style={{ color: 'rgb(59, 130, 246)' }}
              />
            </div>
          </div>

          <div style={parseStyle(styles.statCard.wrapper)}>
            <div style={parseStyle(styles.statCard.inner)}>
              <div style={parseStyle(styles.statCard.content)}>
                <p style={parseStyle(styles.statCard.value)}>
                  {codes.length}
                </p>
                <p style={parseStyle(styles.statCard.label)}>Active Codes</p>
              </div>
              <Tag
                className="h-8 w-8"
                style={{ color: 'rgb(16, 185, 129)' }}
              />
            </div>
          </div>

          <div style={parseStyle(styles.statCard.wrapper)}>
            <div style={parseStyle(styles.statCard.inner)}>
              <div style={parseStyle(styles.statCard.content)}>
                <p style={parseStyle(styles.statCard.value)}>
                  {codedPercentage}%
                </p>
                <p style={parseStyle(styles.statCard.label)}>Coded</p>
              </div>
              <CheckSquare
                className="h-8 w-8"
                style={{ color: 'rgb(139, 92, 246)' }}
              />
            </div>
          </div>

          <div style={parseStyle(styles.statCard.wrapper)}>
            <div style={parseStyle(styles.statCard.inner)}>
              <div style={parseStyle(styles.statCard.content)}>
                <p style={parseStyle(styles.statCard.value)}>85%</p>
                <p style={parseStyle(styles.statCard.label)}>AI Confidence</p>
              </div>
              <Brain
                className="h-8 w-8"
                style={{ color: 'rgb(249, 115, 22)' }}
              />
            </div>
          </div>
        </div>

        <div style={parseStyle(styles.gridLayout)}>
          {/* Main Content */}
          <div style={parseStyle(styles.mainContent)}>
            {/* Toolbar */}
            <div style={parseStyle(styles.toolbarCard.wrapper)}>
              <div style={parseStyle(styles.toolbarCard.controls)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={parseStyle(styles.toolbarCard.searchBar.wrapper)}>
                    <Search
                      className="h-4 w-4"
                      style={parseStyle(styles.toolbarCard.searchBar.icon)}
                    />
                    <input
                      type="text"
                      placeholder="Search responses..."
                      value={filters.searchTerm}
                      onChange={(e) =>
                        updateFilter('searchTerm', e.target.value)
                      }
                      style={parseStyle(styles.toolbarCard.searchBar.input)}
                    />
                  </div>
                  <select
                    value={filters.filterMarket}
                    onChange={(e) =>
                      updateFilter('filterMarket', e.target.value)
                    }
                    style={parseStyle(styles.toolbarCard.select)}
                  >
                    <option value="all">All Markets</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Philippines">Philippines</option>
                  </select>
                  <select
                    value={filters.filterCode}
                    onChange={(e) =>
                      updateFilter('filterCode', e.target.value)
                    }
                    style={parseStyle(styles.toolbarCard.select)}
                  >
                    <option value="all">All Codes</option>
                    {codes.map((code) => (
                      <option key={code.id} value={code.label}>
                        {code.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={parseStyle(styles.toolbarCard.actions)}>
                  {selectedResponses.size > 0 && (
                    <span style={parseStyle(styles.toolbarCard.selectedCount)}>
                      {selectedResponses.size} selected
                    </span>
                  )}
                  <button
                    onClick={handleAICoding}
                    disabled={aiProgress !== null}
                    style={{
                      ...parseStyle(styles.toolbarCard.button),
                      ...parseStyle(styles.toolbarCard.buttonPrimary),
                      opacity: aiProgress !== null ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Zap className="h-4 w-4" />
                    <span>AI Auto-Code</span>
                  </button>
                  <button
                    style={{
                      ...parseStyle(styles.toolbarCard.button),
                      ...parseStyle(styles.toolbarCard.buttonSuccess),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {aiProgress && (
                <div style={parseStyle(styles.toolbarCard.progressBar.wrapper)}>
                  <div style={parseStyle(styles.toolbarCard.progressBar.label)}>
                    <span>AI Coding in progress...</span>
                    <span>
                      {Math.round(
                        (aiProgress.current / aiProgress.total) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div style={parseStyle(styles.toolbarCard.progressBar.track)}>
                    <div
                      style={{
                        ...parseStyle(
                          styles.toolbarCard.progressBar.fill
                        ),
                        width: `${(aiProgress.current / aiProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <p style={parseStyle(styles.toolbarCard.info)}>
                Showing {filteredResponses.length.toLocaleString()} of{' '}
                {responses.length.toLocaleString()} responses
              </p>
            </div>

            {/* Responses Table */}
            <div style={parseStyle(styles.responsesTable.wrapper)}>
              <div style={parseStyle(styles.responsesTable.container)}>
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      itemCount={filteredResponses.length}
                      itemSize={80}
                      width={width}
                      itemData={{
                        responses: filteredResponses,
                        selectedResponses,
                        onToggleSelection: toggleResponseSelection,
                      }}
                    >
                      {ResponseRow}
                    </List>
                  )}
                </AutoSizer>
              </div>
            </div>

            {/* Analytics */}
            <div style={parseStyle(styles.analyticsGrid.wrapper)}>
              <div style={parseStyle(styles.chartCard.wrapper)}>
                <h3 style={parseStyle(styles.chartCard.title)}>
                  Code Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={codeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={parseStyle(styles.chartCard.wrapper)}>
                <h3 style={parseStyle(styles.chartCard.title)}>
                  Market Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={marketDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {marketDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar - Codebook */}
          <div style={parseStyle(styles.sidebar)}>
            <CodebookPanel
              codes={codes}
              onAddCode={handleAddCode}
              onEditCode={handleEditCode}
              onDeleteCode={handleDeleteCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
