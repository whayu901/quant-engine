'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  FolderOpen,
  Edit,
  Delete,
  Description,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { apiClient } from '@/lib/api-client';
import { useAppDispatch } from '@/store/hooks';
import { setProjects } from '@/store/slices/projectsSlice';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  transcript_count?: number;
  created_at: string;
  updated_at: string;
}

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const data = await apiClient.get<Project[]>('/api/projects');
      dispatch(setProjects(data));
      return data;
    },
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      return await apiClient.post<Project>('/api/projects', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setCreateModalOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setAnchorEl(null);
      setSelectedProject(null);
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createMutation.mutate({
        name: newProjectName,
        description: newProjectDescription,
      });
    }
  };

  const handleDeleteProject = () => {
    if (selectedProject) {
      deleteMutation.mutate(selectedProject.id);
    }
  };

  const filteredProjects = projects?.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress size={60} />
          </Box>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <Alert severity="error">Failed to load projects. Please try again.</Alert>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your research projects and transcripts
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </Button>
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateModalOpen(true)}
            >
              New Project
            </Button>
          </Box>

          {filteredProjects && filteredProjects.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {filteredProjects.map((project) => (
                <Box key={project.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: 'primary.light',
                            color: 'primary.main',
                          }}
                        >
                          <FolderOpen />
                        </Box>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, project)}>
                          <MoreVert />
                        </IconButton>
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.description || 'No description'}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Description fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {project.transcript_count || 0} transcripts
                        </Typography>
                      </Box>

                      <Chip
                        label={project.status}
                        size="small"
                        color={getStatusColor(project.status) as any}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </CardContent>
                    <CardActions>
                      <Button size="small" fullWidth>
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 2,
              }}
            >
              <FolderOpen sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No projects found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first project to get started'}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Create Project
                </Button>
              )}
            </Box>
          )}

          {/* Project menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <Edit fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDeleteProject}>
              <Delete fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>

          {/* Create project dialog */}
          <Dialog
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Create New Project</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Project Name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                sx={{ mt: 2, mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                multiline
                rows={4}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCreateProject}
                variant="contained"
                disabled={!newProjectName.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AppLayout>
    </ProtectedRoute>
  );
}
