/**
 * PermissionsRoot
 * 
 * Enhanced wrapper around PermissionsProvider that automatically
 * integrates the Dev Panel in development mode.
 */

import React, { ReactNode, useMemo } from 'react';
import { PermissionsProvider } from '../react/PermissionsProvider';
import { DevPanel } from './DevPanel';
import { useDevRegister, useDevToolsState } from './useDevRegister';
import type { PermissionsConfig } from '../core/types';

interface PermissionsRootProps<TUser = any> extends PermissionsConfig<TUser> {
  children: ReactNode;
}

/**
 * PermissionsRoot Component
 * 
 * Use this instead of PermissionsProvider to get automatic Dev Panel integration.
 * In production, this behaves exactly like PermissionsProvider.
 * 
 * @example
 * ```tsx
 * import { PermissionsRoot } from 'react-permissions-gate';
 * 
 * <PermissionsRoot
 *   user={currentUser}
 *   roles={['admin']}
 *   rules={rules}
 * >
 *   <App />
 * </PermissionsRoot>
 * ```
 */
export function PermissionsRoot<TUser = any>(props: PermissionsRootProps<TUser>) {
  const registerEvaluation = useDevRegister();
  const devState = useDevToolsState();
  
  // Apply dev tools overrides if they exist
  const effectiveProps = useMemo(() => {
    const hasOverrides = devState.overrideRoles !== undefined ||
                        devState.overridePermissions !== undefined ||
                        devState.overrideFlags !== undefined;
    
    if (!hasOverrides) {
      return props;
    }
    
    return {
      ...props,
      roles: devState.overrideRoles ?? props.roles,
      permissions: devState.overridePermissions ?? props.permissions,
      flags: devState.overrideFlags ?? props.flags,
    };
  }, [props, devState.overrideRoles, devState.overridePermissions, devState.overrideFlags]);
  
  return (
    <PermissionsProvider {...effectiveProps} onEvaluationRegister={registerEvaluation}>
      {props.children}
      <DevPanel />
    </PermissionsProvider>
  );
}
