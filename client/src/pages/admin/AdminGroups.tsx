import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material'
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Group,
  Quiz
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

interface Group {
  _id: string
  name: string
  description: string
  created_by: number
  created_at: string
  updated_at: string
}

interface Quiz {
  _id: string
  title: string
  description: string
  group_id?: string
  is_published: boolean
  total_points: number
  tags: string[]
}

const AdminGroups: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [groups, setGroups] = useState<Group[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Form state
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (isEditing && id) {
      fetchGroupDetails(id)
    }
  }, [isEditing, id])

  const fetchData = async () => {
    try {
      const [groupsResponse, quizzesResponse] = await Promise.all([
        axios.get('/admin/groups'),
        axios.get('/admin/quizzes')
      ])
      setGroups(groupsResponse.data)
      setQuizzes(quizzesResponse.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchGroupDetails = async (groupId: string) => {
    try {
      const response = await axios.get(`/admin/groups/${groupId}`)
      setCurrentGroup(response.data)
      setGroupForm({
        name: response.data.name,
        description: response.data.description
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load group details')
    }
  }

  const handleCreateGroup = async () => {
    try {
      const response = await axios.post('/admin/groups', {
        ...groupForm,
        created_by: user?.id
      })
      setGroups(prev => [...prev, response.data])
      setShowCreateDialog(false)
      resetGroupForm()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create group')
    }
  }

  const handleUpdateGroup = async () => {
    if (!currentGroup) return
    
    try {
      const response = await axios.put(`/admin/groups/${currentGroup._id}`, groupForm)
      setCurrentGroup(response.data)
      setGroups(prev => prev.map(g => g._id === currentGroup._id ? response.data : g))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update group')
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group? Quizzes in this group will be ungrouped.')) return
    
    try {
      await axios.delete(`/admin/groups/${groupId}`)
      setGroups(prev => prev.filter(g => g._id !== groupId))
      if (currentGroup?._id === groupId) {
        navigate('/admin/groups')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete group')
    }
  }

  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      description: ''
    })
  }

  const getQuizzesInGroup = (groupId: string) => {
    return quizzes.filter(quiz => quiz.group_id === groupId)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/admin')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {isEditing ? `Edit Group: ${currentGroup?.name}` : 'Manage Groups'}
          </Typography>
          {!isEditing && (
            <Button
              color="inherit"
              startIcon={<Add />}
              onClick={() => setShowCreateDialog(true)}
            >
              New Group
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isEditing ? (
          // Edit Group Form
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Group Details
                </Typography>
                
                <TextField
                  fullWidth
                  label="Group Name"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                
                <Box display="flex" gap={2} mt={3}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleUpdateGroup}
                  >
                    Save Group
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/admin/groups')}
                  >
                    Cancel
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Group Stats
                </Typography>
                <Box mb={2}>
                  <Typography color="textSecondary">Quizzes in Group</Typography>
                  <Typography variant="h4">
                    {currentGroup ? getQuizzesInGroup(currentGroup._id).length : 0}
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography color="textSecondary">Published Quizzes</Typography>
                  <Typography variant="h4">
                    {currentGroup ? getQuizzesInGroup(currentGroup._id).filter(q => q.is_published).length : 0}
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography color="textSecondary">Total Points</Typography>
                  <Typography variant="h4">
                    {currentGroup ? getQuizzesInGroup(currentGroup._id).reduce((sum, q) => sum + q.total_points, 0) : 0}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            {/* Quizzes in Group */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quizzes in this Group ({currentGroup ? getQuizzesInGroup(currentGroup._id).length : 0})
                </Typography>
                
                {currentGroup && getQuizzesInGroup(currentGroup._id).length > 0 ? (
                  <List>
                    {getQuizzesInGroup(currentGroup._id).map(quiz => (
                      <ListItem key={quiz._id} divider>
                        <ListItemText
                          primary={quiz.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {quiz.description}
                              </Typography>
                              <Box display="flex" gap={1} mt={1}>
                                <Chip
                                  label={quiz.is_published ? 'Published' : 'Draft'}
                                  color={quiz.is_published ? 'success' : 'warning'}
                                  size="small"
                                />
                                <Chip
                                  label={`${quiz.total_points} pts`}
                                  size="small"
                                  variant="outlined"
                                />
                                {quiz.tags.map(tag => (
                                  <Chip key={tag} label={tag} size="small" />
                                ))}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
                          >
                            Edit Quiz
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Quiz sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No Quizzes in this Group
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Assign quizzes to this group to organize them better
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/admin/quizzes')}
                      sx={{ mt: 2 }}
                    >
                      Manage Quizzes
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        ) : (
          // Groups List
          <Paper>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                All Groups ({groups.length})
              </Typography>
            </Box>
            <List>
              {groups.map(group => (
                <ListItem key={group._id} divider>
                  <ListItemText
                    primary={group.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {group.description}
                        </Typography>
                        <Box display="flex" gap={1} mt={1}>
                          <Chip
                            label={`${getQuizzesInGroup(group._id).length} quizzes`}
                            size="small"
                            color="primary"
                          />
                          <Chip
                            label={`${getQuizzesInGroup(group._id).filter(q => q.is_published).length} published`}
                            size="small"
                            color="success"
                          />
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/groups/${group._id}`)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteGroup(group._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {groups.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No groups yet"
                    secondary="Create your first group to organize quizzes"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        )}

        {/* Create Group Dialog */}
        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Group Name"
              value={groupForm.name}
              onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={groupForm.description}
              onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateGroup} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default AdminGroups
