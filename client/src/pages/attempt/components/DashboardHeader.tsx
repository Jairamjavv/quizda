import React from 'react'
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { designSystem } from '../../../theme/designSystem'

interface GroupStat {
  id: string
  name: string
  attemptCount: number
  averageScore: number
}

interface DashboardHeaderProps {
  selectedGroup: string
  groups: GroupStat[]
  onGroupChange: (event: SelectChangeEvent) => void
  onViewHistory: () => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedGroup,
  groups,
  onGroupChange,
  onViewHistory,
}) => {
  return (
    <Box mb={4}>
      <Typography 
        variant="h4" 
        component="h1"
        sx={{
          fontWeight: 800,
          color: designSystem.colors.textLight,
          mb: 1,
          fontFamily: designSystem.typography.fontFamily.display,
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
        }}
      >
        Welcome back! 👋
      </Typography>
      <Typography 
        variant="body1" 
        sx={{
          color: designSystem.colors.textMuted,
          mb: 3,
          fontFamily: designSystem.typography.fontFamily.primary,
          fontSize: { xs: '0.9rem', sm: '1rem' },
        }}
      >
        Track your progress and continue learning
      </Typography>
      
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <Button
          variant="outlined"
          size="large"
          onClick={onViewHistory}
          sx={{ 
            px: { xs: 3, sm: 4 },
            py: { xs: 1.25, sm: 1.5 },
            borderRadius: designSystem.borderRadius.md,
            borderColor: designSystem.colors.textMuted,
            color: designSystem.colors.textLight,
            fontWeight: designSystem.typography.fontWeight.medium,
            fontFamily: designSystem.typography.fontFamily.primary,
            textTransform: 'none',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            '&:hover': {
              borderColor: designSystem.colors.accentBlue,
              bgcolor: `${designSystem.colors.accentBlue}10`,
            },
          }}
        >
          View History
        </Button>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 }, width: { xs: '100%', sm: 'auto' } }}>
          <InputLabel 
            id="group-select-label"
            sx={{ 
              color: designSystem.colors.textMuted,
              fontFamily: designSystem.typography.fontFamily.primary,
            }}
          >
            Filter by Group
          </InputLabel>
          <Select
            labelId="group-select-label"
            id="group-select"
            value={selectedGroup}
            label="Filter by Group"
            onChange={onGroupChange}
            sx={{
              borderRadius: designSystem.borderRadius.md,
              color: designSystem.colors.textLight,
              fontFamily: designSystem.typography.fontFamily.primary,
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: designSystem.colors.textMuted,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: designSystem.colors.accentBlue,
              },
            }}
          >
            <MenuItem value="all">All Groups</MenuItem>
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  )
}

export default DashboardHeader
