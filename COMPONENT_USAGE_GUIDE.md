# Reusable Components - Quick Reference Guide

## Overview

This guide provides quick examples for using the new reusable components in Quizda.

---

## 1. PageHeader

**Replace:** Custom AppBar implementations  
**Location:** `client/src/components/PageHeader.tsx`

### Basic Usage

```tsx
import { PageHeader } from "@/components";

<PageHeader title="My Page Title" />;
```

### With Back Button

```tsx
<PageHeader title="Edit Quiz" showBackButton backPath="/admin/quizzes" />
```

### With Logout (Dashboard)

```tsx
<PageHeader
  title="Dashboard"
  userEmail={user?.email}
  showLogoutButton
  onLogout={handleLogout}
/>
```

### With Custom Actions

```tsx
<PageHeader
  title="Manage Quizzes"
  showBackButton
  rightActions={
    <Button variant="contained" startIcon={<Add />}>
      Create Quiz
    </Button>
  }
/>
```

---

## 2. LoadingScreen

**Replace:** Loading state Box + SandglassLoader  
**Location:** `client/src/components/LoadingScreen.tsx`

### Basic Usage

```tsx
import { LoadingScreen } from "@/components";

if (loading) return <LoadingScreen />;
```

### With Custom Size

```tsx
if (loading) return <LoadingScreen size={100} />;
```

### With Message

```tsx
if (loading) return <LoadingScreen message="Loading quizzes..." />;
```

---

## 3. StyledTextField

**Replace:** TextField with repeated sx styling  
**Location:** `client/src/components/StyledTextField.tsx`

### Dark Mode (Default)

```tsx
import { StyledTextField } from "@/components";

<StyledTextField
  fullWidth
  label="Quiz Title"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>;
```

### Light Mode

```tsx
<StyledTextField
  fullWidth
  label="Email"
  type="email"
  darkMode={false}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Multiline

```tsx
<StyledTextField
  fullWidth
  multiline
  rows={4}
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

---

## 4. StyledCard

**Replace:** Paper with repeated styling  
**Location:** `client/src/components/StyledCard.tsx`

### Dark Variant (Default)

```tsx
import { StyledCard } from "@/components";

<StyledCard>
  <CardContent>Your content here</CardContent>
</StyledCard>;
```

### Light Variant

```tsx
<StyledCard cardVariant="light">
  <CardContent>Form content</CardContent>
</StyledCard>
```

### With Hover Effect

```tsx
<StyledCard hover onClick={handleClick}>
  <CardContent>Clickable card</CardContent>
</StyledCard>
```

### Transparent

```tsx
<StyledCard cardVariant="transparent">
  <Box p={2}>Subtle content</Box>
</StyledCard>
```

---

## 5. StyledAlert

**Replace:** Alert with custom styling  
**Location:** `client/src/components/StyledAlert.tsx`

### Error Alert (Dark Mode - Default)

```tsx
import { StyledAlert } from "@/components";

{
  error && <StyledAlert severity="error">{error}</StyledAlert>;
}
```

### Success Alert

```tsx
<StyledAlert severity="success">Quiz created successfully!</StyledAlert>
```

### Warning Alert

```tsx
<StyledAlert severity="warning">
  Please review your answers before submitting.
</StyledAlert>
```

### Info Alert

```tsx
<StyledAlert severity="info">This quiz has 20 questions.</StyledAlert>
```

### Light Mode

```tsx
<StyledAlert severity="error" alertVariant="light">
  Invalid credentials
</StyledAlert>
```

---

## 6. ConfirmDialog

**Replace:** `window.confirm()` calls  
**Location:** `client/src/components/ConfirmDialog.tsx`

### Basic Delete Confirmation

```tsx
import { ConfirmDialog } from '@/components'
import { useState } from 'react'

const [showConfirm, setShowConfirm] = useState(false)

// Trigger
<Button onClick={() => setShowConfirm(true)}>Delete</Button>

// Dialog
<ConfirmDialog
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Quiz"
  message="Are you sure you want to delete this quiz? This action cannot be undone."
  confirmText="Delete"
  confirmColor="error"
/>
```

### Custom Confirmation

```tsx
<ConfirmDialog
  open={showPublish}
  onClose={() => setShowPublish(false)}
  onConfirm={handlePublish}
  title="Publish Quiz"
  message="Are you ready to make this quiz available to users?"
  confirmText="Publish Now"
  cancelText="Not Yet"
  confirmColor="primary"
/>
```

---

## 7. EmptyState

**Replace:** Custom empty state markup  
**Location:** `client/src/components/EmptyState.tsx`

### Basic Empty State

```tsx
import { EmptyState } from "@/components";
import { Quiz } from "@mui/icons-material";

{
  items.length === 0 && (
    <EmptyState
      icon={<Quiz />}
      title="No Quizzes Yet"
      message="Create your first quiz to get started"
    />
  );
}
```

### With Action Button

```tsx
<EmptyState
  icon={<QuestionAnswer />}
  title="No Questions Yet"
  message="Add questions to make your quiz complete"
  action={
    <Button variant="contained" startIcon={<Add />} onClick={handleAddQuestion}>
      Add First Question
    </Button>
  }
/>
```

### Multiple Actions

```tsx
<EmptyState
  icon={<Assessment />}
  title="No Attempts Yet"
  message="Take a quiz to see your progress"
  action={
    <Box display="flex" gap={2}>
      <Button variant="outlined" onClick={handleBrowse}>
        Browse Quizzes
      </Button>
      <Button variant="contained" onClick={handleStart}>
        Start Quiz
      </Button>
    </Box>
  }
/>
```

---

## Migration Examples

### Before: AdminQuizzes.tsx Header

```tsx
// OLD - 20+ lines
<AppBar
  position="static"
  sx={{
    bgcolor: designSystem.colors.darkBg,
    boxShadow: "none",
    borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
  }}
>
  <Toolbar>
    <IconButton
      edge="start"
      color="inherit"
      onClick={() => navigate("/admin")}
      sx={{
        color: designSystem.colors.textLight,
        "&:hover": { bgcolor: `${designSystem.colors.brandPrimary}25` },
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
        fontFamily: designSystem.typography.fontFamily.display,
      }}
    >
      {isEditing ? `Edit Quiz: ${currentQuiz?.title}` : "Manage Quizzes"}
    </Typography>
  </Toolbar>
</AppBar>
```

### After: AdminQuizzes.tsx Header

```tsx
// NEW - 5 lines
<PageHeader
  title={isEditing ? `Edit Quiz: ${currentQuiz?.title}` : "Manage Quizzes"}
  showBackButton
  backPath="/admin"
/>
```

---

### Before: Loading State

```tsx
// OLD - 10 lines
if (loading) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ bgcolor: designSystem.colors.darkBg }}
    >
      <SandglassLoader size={80} color={designSystem.colors.brandPrimary} />
    </Box>
  );
}
```

### After: Loading State

```tsx
// NEW - 1 line
if (loading) return <LoadingScreen />;
```

---

### Before: Delete Confirmation

```tsx
// OLD - window.confirm (not styled, inconsistent UX)
const handleDelete = async (id: string) => {
  if (!window.confirm("Are you sure you want to delete this quiz?")) return;

  try {
    await axios.delete(`/admin/quizzes/${id}`);
    setQuizzes((prev) => prev.filter((q) => q._id !== id));
  } catch (err) {
    setError("Failed to delete quiz");
  }
};
```

### After: Delete Confirmation

```tsx
// NEW - Styled, accessible, consistent
const [deleteId, setDeleteId] = useState<string | null>(null)

const handleDelete = async () => {
  if (!deleteId) return

  try {
    await axios.delete(`/admin/quizzes/${deleteId}`)
    setQuizzes(prev => prev.filter(q => q._id !== deleteId))
  } catch (err) {
    setError('Failed to delete quiz')
  }
}

// In JSX:
<Button onClick={() => setDeleteId(quiz._id)}>Delete</Button>

<ConfirmDialog
  open={deleteId !== null}
  onClose={() => setDeleteId(null)}
  onConfirm={handleDelete}
  title="Delete Quiz"
  message="Are you sure you want to delete this quiz? This action cannot be undone."
  confirmText="Delete"
  confirmColor="error"
/>
```

---

## Import Patterns

### Individual Import

```tsx
import PageHeader from "@/components/PageHeader";
import LoadingScreen from "@/components/LoadingScreen";
```

### Bulk Import (Recommended)

```tsx
import {
  PageHeader,
  LoadingScreen,
  StyledTextField,
  StyledCard,
  StyledAlert,
  ConfirmDialog,
  EmptyState,
} from "@/components";
```

---

## TypeScript Support

All components are fully typed with TypeScript. Hover over component names in your IDE to see available props and their types.

### Example: PageHeader Props

```tsx
interface PageHeaderProps {
  title: string; // Required
  showBackButton?: boolean; // Optional, default: false
  backPath?: string; // Optional
  showLogoutButton?: boolean; // Optional, default: false
  onLogout?: () => void; // Optional
  rightActions?: React.ReactNode; // Optional
  userEmail?: string; // Optional
}
```

---

## Best Practices

1. **Use StyledTextField** instead of TextField with custom sx for consistency
2. **Use LoadingScreen** for all full-page loading states
3. **Use ConfirmDialog** instead of window.confirm for better UX
4. **Use EmptyState** for all "no data" scenarios
5. **Use PageHeader** for all pages with navigation
6. **Use StyledCard** for consistent card styling
7. **Use StyledAlert** for all alert/error messages

---

## Component Locations

All reusable components live in:

```
client/src/components/
├── index.ts                    # Central export
├── PageHeader.tsx
├── LoadingScreen.tsx
├── StyledTextField.tsx
├── StyledCard.tsx
├── StyledAlert.tsx
├── ConfirmDialog.tsx
├── EmptyState.tsx
└── ... (other components)
```

---

## Next Steps

1. Gradually replace old patterns with new components
2. Test each replacement thoroughly
3. Remove old boilerplate code
4. Enjoy cleaner, more maintainable code! 🎉
