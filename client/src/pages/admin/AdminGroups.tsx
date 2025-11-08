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
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material'
import SandglassLoader from '../../components/SandglassLoader'
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
import { useAuthV2 as useAuth } from '../../contexts/AuthContextV2'
import axios from 'axios'
import { designSystem } from '../../theme/designSystem'

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: designSystem.colors.darkBg }}>
        <SandglassLoader size={80} color={designSystem.colors.brandPrimary} />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: designSystem.colors.darkBg, minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: designSystem.colors.darkBg, boxShadow: 'none', borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate('/admin')}
            sx={{ 
              color: designSystem.colors.textLight,
              '&:hover': { bgcolor: `${designSystem.colors.brandPrimary}25` }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: designSystem.colors.textLight,
              fontWeight: 700,
              fontFamily: designSystem.typography.fontFamily.display 
            }}
          >
            {isEditing ? `Edit Group: ${currentGroup?.name}` : 'Manage Groups'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: designSystem.borderRadius.md,
              bgcolor: `${designSystem.colors.brandPrimary}15`,
              color: designSystem.colors.brandPrimary,
              border: `1px solid ${designSystem.colors.brandPrimary}`,
            }}
          >
            {error}
          </Alert>
        )}

        {isEditing ? (
          // Edit Group Form
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper 
                sx={{ 
                  p: designSystem.spacing.md,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: designSystem.borderRadius.bento,
                  boxShadow: designSystem.shadows.bento,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: designSystem.colors.textLight,
                    fontFamily: designSystem.typography.fontFamily.display 
                  }}
                >
                  Group Details
                </Typography>
                
                <TextField
                  fullWidth
                  label="Group Name"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: designSystem.colors.textLight,
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
                      '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
                  }}
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: designSystem.colors.textLight,
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
                      '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
                  }}
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
              <Paper 
                sx={{ 
                  p: 3,
                  background: 'linear-gradient(135deg, #121212 0%, #181818 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: designSystem.borderRadius.bento,
                  boxShadow: designSystem.shadows.bento,
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: designSystem.colors.textLight,
                    fontWeight: 700,
                    fontFamily: designSystem.typography.fontFamily.display,
                  }}
                >
                  Group Stats
                </Typography>
                <Box mb={2}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Quizzes in Group</Typography>
                  <Typography 
                    variant="h4"
                    sx={{ 
                      color: designSystem.colors.textLight,
                      fontFamily: designSystem.typography.fontFamily.mono,
                    }}
                  >
                    {currentGroup ? getQuizzesInGroup(currentGroup._id).length : 0}
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Published Quizzes</Typography>
                  <Typography 
                    variant="h4"
                    sx={{ 
                      color: designSystem.colors.textLight,
                      fontFamily: designSystem.typography.fontFamily.mono,
                    }}
                  >
                    {currentGroup ? getQuizzesInGroup(currentGroup._id).filter(q => q.is_published).length : 0}
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Total Points</Typography>
                  <Typography 
                    variant="h4"
                    sx={{ 
                      color: designSystem.colors.textLight,
                      fontFamily: designSystem.typography.fontFamily.mono,
                    }}
                  >
                    {currentGroup ? getQuizzesInGroup(currentGroup._id).reduce((sum, q) => sum + q.total_points, 0) : 0}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            {/* Quizzes in Group */}
            <Grid size={{ xs: 12 }}>
              <Paper 
                sx={{ 
                  p: 3,
                  background: 'linear-gradient(135deg, #121212 0%, #181818 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: designSystem.borderRadius.bento,
                  boxShadow: designSystem.shadows.bento,
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: designSystem.colors.textLight,
                    fontWeight: 700,
                    fontFamily: designSystem.typography.fontFamily.display,
                  }}
                >
                  Quizzes in this Group ({currentGroup ? getQuizzesInGroup(currentGroup._id).length : 0})
                </Typography>
                
                {currentGroup && getQuizzesInGroup(currentGroup._id).length > 0 ? (
                  <List>
                    {getQuizzesInGroup(currentGroup._id).map(quiz => (
                      <ListItem 
                        key={quiz._id} 
                        divider
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography sx={{ color: designSystem.colors.textLight, fontWeight: 600 }}>
                              {quiz.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {quiz.description}
                              </Typography>
                              <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                                <Chip
                                  label={quiz.is_published ? 'Published' : 'Draft'}
                                  size="small"
                                  sx={{
                                    bgcolor: quiz.is_published 
                                      ? 'rgba(125, 214, 141, 0.15)' 
                                      : 'rgba(245, 224, 153, 0.15)',
                                    color: quiz.is_published 
                                      ? designSystem.colors.accentGreen 
                                      : designSystem.colors.accentYellow,
                                    border: `1px solid ${quiz.is_published 
                                      ? designSystem.colors.accentGreen 
                                      : designSystem.colors.accentYellow}`,
                                    fontWeight: 600,
                                  }}
                                />
                                <Chip
                                  label={`${quiz.total_points} pts`}
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    color: designSystem.colors.textLight,
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                  }}
                                />
                                {quiz.tags.map(tag => (
                                  <Chip 
                                    key={tag} 
                                    label={tag} 
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(107, 194, 245, 0.15)',
                                      color: designSystem.colors.accentBlue,
                                      border: `1px solid ${designSystem.colors.accentBlue}`,
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
                            sx={{
                              color: designSystem.colors.textLight,
                              borderColor: 'rgba(255, 255, 255, 0.12)',
                              '&:hover': {
                                borderColor: designSystem.colors.accentBlue,
                                bgcolor: 'rgba(107, 194, 245, 0.1)',
                              }
                            }}
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
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        color: designSystem.colors.textLight,
                        fontWeight: 700,
                      }}
                    >
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
          <>
            {/* Create Group Button */}
            <Box 
              display="flex" 
              justifyContent="flex-end"
              mb={3}
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #121212 0%, #181818 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: designSystem.borderRadius.bento,
                boxShadow: designSystem.shadows.bento,
              }}
            >
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowCreateDialog(true)}
                sx={{
                  bgcolor: designSystem.colors.accentGreen,
                  color: designSystem.colors.textDark,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  py: 1.5,
                  borderRadius: designSystem.borderRadius.bento,
                  boxShadow: designSystem.shadows.bento,
                  transition: designSystem.animations.transition.default,
                  '&:hover': {
                    bgcolor: designSystem.colors.accentGreen,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(125, 214, 141, 0.3)',
                  }
                }}
              >
                Create New Group
              </Button>
            </Box>

            <Paper
              sx={{
                background: 'linear-gradient(135deg, #121212 0%, #181818 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: designSystem.borderRadius.bento,
                boxShadow: designSystem.shadows.bento,
              }}
            >
              <Box p={3}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: designSystem.colors.textLight,
                    fontWeight: 700,
                    fontFamily: designSystem.typography.fontFamily.display,
                  }}
                >
                  All Groups ({groups.length})
                </Typography>
              </Box>
            <List>
              {groups.map(group => (
                <ListItem 
                  key={group._id} 
                  divider
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ color: designSystem.colors.textLight, fontWeight: 600 }}>
                        {group.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {group.description}
                        </Typography>
                        <Box display="flex" gap={1} mt={1}>
                          <Chip
                            label={`${getQuizzesInGroup(group._id).length} quizzes`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(107, 194, 245, 0.15)',
                              color: designSystem.colors.accentBlue,
                              border: `1px solid ${designSystem.colors.accentBlue}`,
                              fontWeight: 600,
                            }}
                          />
                          <Chip
                            label={`${getQuizzesInGroup(group._id).filter(q => q.is_published).length} published`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(125, 214, 141, 0.15)',
                              color: designSystem.colors.accentGreen,
                              border: `1px solid ${designSystem.colors.accentGreen}`,
                              fontWeight: 600,
                            }}
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
                        sx={{ color: designSystem.colors.textLight }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteGroup(group._id)}
                        sx={{ color: designSystem.colors.brandPrimary }}
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
                    primary={
                      <Typography sx={{ color: designSystem.colors.textLight }}>
                        No groups yet
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Create your first group to organize quizzes
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Paper>
          </>
        )}

        {/* Create Group Dialog */}
        <Dialog 
          open={showCreateDialog} 
          onClose={() => setShowCreateDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: designSystem.colors.darkBg,
              backgroundImage: 'none',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <DialogTitle sx={{ color: designSystem.colors.textLight }}>
            Create New Group
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Group Name"
              value={groupForm.name}
              onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
              sx={{ 
                mb: 2, 
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  color: designSystem.colors.textLight,
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
                  '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={groupForm.description}
              onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: designSystem.colors.textLight,
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
                  '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShowCreateDialog(false)}
              sx={{ color: designSystem.colors.textLight }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGroup} 
              variant="contained"
              sx={{
                bgcolor: designSystem.colors.brandPrimary,
                color: designSystem.colors.textLight,
                '&:hover': {
                  bgcolor: designSystem.colors.brandHover,
                }
              }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default AdminGroups
