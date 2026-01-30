/**
 * usePermission Hook
 * 
 * Check permissions programmatically in your components.
 * Supports async rules and automatically re-evaluates when dependencies change.
 */

import { useEffect, useState } from 'react';
import { usePermissionsContext } from './PermissionsProvider';
import type { PermissionCheck } from '../core/types';

/**
 * Hook to check if a permission is allowed
 * 
 * @param check - Permission check (string, array, or function)
 * @param resource - Optional resource to check against
 * @param mode - Evaluation mode for arrays: 'any' (OR) or 'all' (AND)
 * @returns Object with loading state and permission result
 * 
 * @example
 * ```tsx
 * function EditButton({ user }) {
 *   const { allowed, loading } = usePermission('user.edit', user);
 *   
 *   if (loading) return <Spinner />;
 *   
 *   return (
 *     <button disabled={!allowed}>
 *       Edit User
 *     </button>
 *   );
 * }
 * ```
 */
export function usePermission<TUser = any, TResource = any>(
  check: PermissionCheck<TUser, TResource>,
  resource?: TResource,
  mode: 'any' | 'all' = 'any'
): {
  allowed: boolean;
  loading: boolean;
} {
  const context = usePermissionsContext<TUser>();
  const [state, setState] = useState<{ allowed: boolean; loading: boolean }>({
    allowed: false,
    loading: true,
  });
  
  useEffect(() => {
    let cancelled = false;
    
    // Start evaluation
    setState({ allowed: false, loading: true });
    
    context.evaluatePermission(check, resource, mode).then((allowed) => {
      if (!cancelled) {
        setState({ allowed, loading: false });
      }
    });
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true;
    };
  }, [context.evaluatePermission, check, resource, mode]);
  
  return state;
}

/**
 * Simpler hook that only returns the boolean result
 * Use when you don't need loading state
 * 
 * @param check - Permission check
 * @param resource - Optional resource
 * @param mode - Evaluation mode
 * @returns Boolean indicating if permission is allowed
 * 
 * @example
 * ```tsx
 * const canEdit = usePermissionValue('user.edit', user);
 * ```
 */
export function usePermissionValue<TUser = any, TResource = any>(
  check: PermissionCheck<TUser, TResource>,
  resource?: TResource,
  mode: 'any' | 'all' = 'any'
): boolean {
  const { allowed } = usePermission(check, resource, mode);
  return allowed;
}
