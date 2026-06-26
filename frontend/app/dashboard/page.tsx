'use client';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  FolderOpen,
  Description,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { useAppSelector } from '@/store/hooks';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
  trend?: string;
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          </Box>
        </Box>
        {trend && (
          <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUp fontSize="small" />
            {trend}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    {
      title: 'Total Projects',
      value: 12,
      icon: <FolderOpen />,
      color: 'primary',
      trend: '+12% from last month',
    },
    {
      title: 'Transcripts',
      value: 156,
      icon: <Description />,
      color: 'secondary',
      trend: '+8% from last month',
    },
    {
      title: 'Analyses',
      value: 89,
      icon: <TrendingUp />,
      color: 'success',
      trend: '+23% from last month',
    },
    {
      title: 'Completed',
      value: 45,
      icon: <CheckCircle />,
      color: 'info',
      trend: '+15% from last month',
    },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {user?.name || 'User'}!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Here's what's happening with your projects today.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
              mb: 4,
            }}
          >
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                lg: 'repeat(12, 1fr)',
              },
              gap: 3,
            }}
          >
            <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 8' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Recent Activity
                  </Typography>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent activity to display
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 4' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Project Progress
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Market Research Q1</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>75%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Customer Insights</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>60%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={60} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Brand Analysis</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>40%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={40} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </AppLayout>
    </ProtectedRoute>
  );
}
