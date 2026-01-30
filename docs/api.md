---
layout: default
title: API Reference
---

# API Reference

[← Back to Home](./)

## Components

### `<PermissionsRoot>`

Enhanced wrapper around `PermissionsProvider` with automatic dev tools integration.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `user` | `TUser` | Current user object |
| `roles` | `string[]` | Array of user roles |
| `permissions` | `string[]` | Array of permission strings |
| `rules` | `PermissionRulesMap` | Custom rule definitions |
| `flags` | `Record<string, any>` | Feature flags |
| `enableDevTools` | `boolean` | Override auto dev tools detection |

**Example:**

```tsx
<PermissionsRoot
  user={currentUser}
  roles={['admin', 'editor']}
  permissions={['post.edit']}
  rules={customRules}
  flags={{ newUI: true }}
>
  <App />
</PermissionsRoot>
```

---

### `<PermissionsGate>`

Conditional rendering based on permissions.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `allow` | `PermissionCheck` | Permission(s) to check |
| `resource` | `TResource` | Optional resource for context |
| `mode` | `'any' \| 'all'` | Evaluation mode for arrays (default: `'any'`) |
| `fallback` | `ReactNode` | Render when not allowed |
| `disable` | `boolean` | Disable children instead of hiding |
| `loading` | `ReactNode` | Show while evaluating async rules |

**Example:**

```tsx
<PermissionsGate
  allow="post.edit"
  resource={post}
  fallback={<AccessDenied />}
  loading={<Spinner />}
>
  <EditForm />
</PermissionsGate>
```

---

### `<Permissioned>`

Render-prop component for more control.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `check` | `PermissionCheck` | Permission(s) to check |
| `resource` | `TResource` | Optional resource for context |
| `mode` | `'any' \| 'all'` | Evaluation mode |
| `children` | `function` | Render function receiving `{ allowed, loading }` |

**Example:**

```tsx
<Permissioned check="post.edit" resource={post}>
  {({ allowed, loading }) => (
    loading ? <Spinner /> :
    allowed ? <EditButton /> : <ViewButton />
  )}
</Permissioned>
```

---

### `<ProtectedRoute>`

Guard routes or sections (framework-agnostic).

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `allow` | `PermissionCheck` | Permission(s) required |
| `resource` | `TResource` | Optional resource |
| `fallback` | `ReactNode` | Show when access denied |

**Example:**

```tsx
<ProtectedRoute allow="admin.access" fallback={<Redirect to="/login" />}>
  <AdminDashboard />
</ProtectedRoute>
```

---

## Hooks

### `usePermission()`

Check permissions programmatically.

**Signature:**

```tsx
function usePermission<TUser, TResource>(
  check: PermissionCheck<TUser, TResource>,
  resource?: TResource,
  mode?: 'any' | 'all'
): {
  allowed: boolean;
  loading: boolean;
}
```

**Example:**

```tsx
const { allowed, loading } = usePermission('post.edit', post);

if (loading) return <Spinner />;

return <button disabled={!allowed}>Edit</button>;
```

---

### `usePermissionValue()`

Simpler hook that only returns boolean (no loading state).

**Signature:**

```tsx
function usePermissionValue<TUser, TResource>(
  check: PermissionCheck<TUser, TResource>,
  resource?: TResource,
  mode?: 'any' | 'all'
): boolean
```

**Example:**

```tsx
const canEdit = usePermissionValue('post.edit', post);

return <button disabled={!canEdit}>Edit</button>;
```

---

### `usePermissionsContext()`

Access the full permissions context.

**Returns:**

```tsx
{
  user: TUser;
  roles: string[];
  permissions: string[];
  rules: PermissionRulesMap;
  flags: Record<string, any>;
  evaluatePermission: (check, resource?, mode?) => Promise<boolean>;
  enableDevTools: boolean;
}
```

---

## Types

### `PermissionRulesMap`

```tsx
type PermissionRulesMap<TUser = any, TResource = any> = {
  [key: string]: PermissionRule<TUser, TResource>;
};
```

### `PermissionRule`

```tsx
type PermissionRule<TUser = any, TResource = any> =
  | ((context: PermissionContext<TUser, TResource>) => boolean | Promise<boolean>);
```

### `PermissionContext`

```tsx
interface PermissionContext<TUser = any, TResource = any> {
  user: TUser;
  resource?: TResource;
  roles: string[];
  permissions: string[];
  flags: Record<string, any>;
}
```

### `PermissionCheck`

```tsx
type PermissionCheck<TUser = any, TResource = any> =
  | string
  | string[]
  | PermissionRule<TUser, TResource>;
```

---

[← Getting Started](./getting-started.html) | [Back to Home](./)
