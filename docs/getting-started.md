---
layout: default
title: Getting Started
---

# Getting Started

[← Back to Home](./)

## Installation

```bash
npm install react-auth-gate
```

## Your First Permission Check

### 1. Define Your Rules

Create a rules object that defines your permission logic:

```tsx
import { PermissionRulesMap } from 'react-auth-gate';

const rules: PermissionRulesMap = {
  // Simple role check
  'admin.access': ({ roles }) => roles.includes('admin'),
  
  // Resource-based check
  'post.edit': ({ user, resource }) => {
    if (roles.includes('admin')) return true;
    return resource.authorId === user.id;
  },
  
  // Async check
  'feature.premium': async ({ user }) => {
    const subscription = await checkSubscription(user.id);
    return subscription.tier === 'premium';
  },
};
```

### 2. Wrap Your App

Use `PermissionsRoot` to provide permissions to your app:

```tsx
import { PermissionsRoot } from 'react-auth-gate';

function App() {
  const currentUser = { id: '1', name: 'Alice' };
  const userRoles = ['editor', 'user'];

  return (
    <PermissionsRoot
      user={currentUser}
      roles={userRoles}
      rules={rules}
    >
      <YourApp />
    </PermissionsRoot>
  );
}
```

### 3. Use Permission Checks

#### With Components

```tsx
import { PermissionsGate } from 'react-auth-gate';

function PostActions({ post }) {
  return (
    <div>
      <PermissionsGate allow="post.edit" resource={post}>
        <button>Edit</button>
      </PermissionsGate>
      
      <PermissionsGate allow="post.delete" resource={post}>
        <button>Delete</button>
      </PermissionsGate>
    </div>
  );
}
```

#### With Hooks

```tsx
import { usePermission } from 'react-auth-gate';

function EditButton({ post }) {
  const { allowed, loading } = usePermission('post.edit', post);
  
  if (loading) return <Spinner />;
  
  return (
    <button disabled={!allowed}>
      Edit Post
    </button>
  );
}
```

## Advanced Features

### Multiple Permission Checks

Check if ANY or ALL permissions are allowed:

```tsx
// ANY (OR logic)
<PermissionsGate allow={['admin.access', 'moderator.access']} mode="any">
  <ModTools />
</PermissionsGate>

// ALL (AND logic)
<PermissionsGate allow={['user.verified', 'feature.premium']} mode="all">
  <PremiumContent />
</PermissionsGate>
```

### Feature Flags

```tsx
<PermissionsRoot
  user={user}
  roles={roles}
  rules={rules}
  flags={{ newUI: true, betaFeatures: false }}
>
  <App />
</PermissionsRoot>

// Check feature flag
<PermissionsGate allow="flag:newUI">
  <NewDashboard />
</PermissionsGate>
```

### Fallback UI

```tsx
<PermissionsGate
  allow="admin.access"
  fallback={<p>Access Denied</p>}
>
  <AdminPanel />
</PermissionsGate>
```

### Disable Elements

```tsx
<PermissionsGate allow="post.edit" resource={post} disable>
  <button>Edit</button>
</PermissionsGate>
```

## Dev Tools

The dev panel is **automatically enabled in development mode**. It allows you to:

- View all permission checks in real-time
- Override roles, permissions, and feature flags
- Debug authorization logic
- See evaluation history

Press the floating button in the bottom-right corner to open it!

### Preview

![Dev Panel](./assets/devpanel-evaluations.png)

The dev panel has three tabs:
1. **Evaluations** - Real-time permission checks
2. **Overrides** - Test different roles/permissions
3. **Context** - Current user and configuration

---

[← Back to Home](./) | [API Reference →](./api.html)
