// This file is kept for conceptual separation, but its content is now directly in AuthContext.tsx
// For simplicity and to avoid circular dependencies if any, direct export from context is fine.
// If more logic was needed around the hook, this file would be more useful.

export { useAuth } from '@/contexts/AuthContext';