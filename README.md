# 🔐 react-auth-gate

A production-grade React authorization framework that centralizes **RBAC**, **PBAC**, **ABAC**, feature flags, and async permission checks into a clean, declarative API.

**Permission logic never lives inside components again.**

[![npm version](https://img.shields.io/npm/v/react-auth-gate.svg)](https://www.npmjs.com/package/react-auth-gate)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

📚 **[Documentation](https://klejdi94.github.io/react-auth-gate/)** • 🎮 **[Live Demo](https://github.com/klejdi94/demo-react-auth-gate)**

---

## ✨ Features

- **🎯 Declarative API** - Gate components with simple props
- **🔄 RBAC + PBAC + ABAC** - Role, Permission, and Attribute-based access control
- **⚡ Async Support** - Check permissions against APIs in real-time
- **🚩 Feature Flags** - Built-in feature flag support
- **🎨 Framework Agnostic** - Works with any React app (Next.js, CRA, Vite, etc.)
- **📦 Tree-shakeable** - Zero runtime overhead for unused features
- **🔍 TypeScript First** - Fully typed with excellent IntelliSense
- **🛠️ Dev Tools Panel** - **Killer feature**: Automatic permission debugging panel in development
- **🪶 Lightweight** - No heavy dependencies

---

## 🚀 Quick Start

### Installation

```bash
npm install react-auth-gate
```

### Basic Usage

```tsx
import { PermissionsRoot, PermissionsGate } from 'react-auth-gate';

// 1. Define your permission rules
const rules = {
  'user.edit': ({ user, resource }) =>
    user.role === 'admin' || user.id === resource.id,
  'post.delete': ({ user, resource }) =>
    user.id === resource.authorId,
};

// 2. Wrap your app
function App() {
  return (
    <PermissionsRoot
      user={currentUser}
      roles={['editor']}
      permissions={['post.create', 'post.edit']}
      rules={rules}
      flags={{ newUI: true }}
    >
      <YourApp />
    </PermissionsRoot>
  );
}

// 3. Use permission gates anywhere
function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <PermissionsGate allow="user.edit" resource={user}>
        <EditButton />
      </PermissionsGate>
    </div>
  );
}
```

**That's it!** Your permissions are centralized, testable, and declarative.

---

## 📚 Core Concepts

### Permission Rules

Rules are functions that determine access. They receive a context object and return a boolean (or Promise<boolean>).

```tsx
type PermissionRule = (ctx: {
  user: any;            // Current user
  resource?: any;       // Resource being accessed
  roles: string[];      // User's roles
  permissions: string[]; // User's permissions
  flags: Record<string, boolean>; // Feature flags
}) => boolean | Promise<boolean>;
```

### Rule Types

#### 1. **Role-Based (RBAC)**
```tsx
const rules = {
  'admin.access': ({ roles }) => roles.includes('admin'),
};
```

#### 2. **Permission-Based (PBAC)**
```tsx
const rules = {
  'post.create': ({ permissions }) => permissions.includes('post.create'),
};
```

#### 3. **Attribute-Based (ABAC)**
```tsx
const rules = {
  'user.edit': ({ user, resource }) =>
    user.role === 'admin' || user.id === resource.id,
};
```

#### 4. **Async Rules**
```tsx
const rules = {
  'subscription.premium': async ({ user }) => {
    const subscription = await checkSubscriptionAPI(user.id);
    return subscription.isPremium;
  },
};
```

---

## 🎯 API Reference

### `<PermissionsRoot>`

The root provider component. Use this to wrap your app with automatic dev tools integration.

```tsx
<PermissionsRoot
  user={currentUser}
  roles={['admin', 'editor']}
  permissions={['post.edit', 'post.delete']}
  rules={rulesMap}
  flags={{ newUI: true }}
  enableDevTools={true} // default: auto-enabled in development
>
  <App />
</PermissionsRoot>
```

**Props:**
- `user` - Current authenticated user
- `roles?` - Array of role strings
- `permissions?` - Array of permission strings
- `rules?` - Map of named permission rules
- `flags?` - Feature flags object
- `enableDevTools?` - Enable/disable dev panel (default: auto in dev mode)

---

### `<PermissionsGate>`

Declarative permission boundary component.

```tsx
<PermissionsGate
  allow="user.edit"
  resource={user}
  mode="hide"
  fallback={<div>Access Denied</div>}
>
  <EditButton />
</PermissionsGate>
```

**Props:**
- `allow?` - Permission check (string, array, or function)
- `any?` - Array of permissions (OR logic)
- `all?` - Array of permissions (AND logic)
- `resource?` - Resource to check against
- `mode?` - `"hide"` (default) or `"disable"`
- `fallback?` - React node to show when denied
- `children` - Protected content

**Examples:**

```tsx
// Single permission
<PermissionsGate allow="admin.access">
  <AdminPanel />
</PermissionsGate>

// Multiple permissions (any)
<PermissionsGate any={['admin', 'moderator']}>
  <ModPanel />
</PermissionsGate>

// Multiple permissions (all)
<PermissionsGate all={['post.edit', 'post.publish']}>
  <PublishButton />
</PermissionsGate>

// Disable mode
<PermissionsGate allow="post.delete" resource={post} mode="disable">
  <DeleteButton />
</PermissionsGate>

// Inline rule
<PermissionsGate allow={({ user }) => user.verified}>
  <VerifiedBadge />
</PermissionsGate>

// With fallback
<PermissionsGate allow="premium.feature" fallback={<UpgradePrompt />}>
  <PremiumContent />
</PermissionsGate>
```

---

### `usePermission()`

Hook for programmatic permission checks.

```tsx
const { allowed, loading } = usePermission('user.edit', user);

return (
  <button disabled={!allowed || loading}>
    {loading ? 'Checking...' : 'Edit'}
  </button>
);
```

**Returns:**
- `allowed` - Boolean indicating if permission is granted
- `loading` - Boolean indicating if check is in progress

**Simpler version (no loading state):**

```tsx
const canEdit = usePermissionValue('user.edit', user);
```

---

### `<Permissioned>`

Render-prop version for maximum control.

```tsx
<Permissioned allow="post.edit" resource={post}>
  {(allowed, loading) => (
    <button disabled={!allowed || loading}>
      {loading ? 'Checking...' : allowed ? 'Edit' : 'View Only'}
    </button>
  )}
</Permissioned>
```

---

### `<ProtectedRoute>`

Route protection component (framework-agnostic).

```tsx
// React Router
<Route
  path="/admin"
  element={
    <ProtectedRoute
      allow="admin.access"
      fallback={<Navigate to="/login" />}
    >
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

// Next.js
function AdminPage() {
  const router = useRouter();
  
  return (
    <ProtectedRoute
      allow="admin"
      onAccessDenied={() => router.push('/login')}
    >
      <AdminPanel />
    </ProtectedRoute>
  );
}
```

**Props:**
- `allow` - Permission check
- `resource?` - Resource to check
- `fallback?` - Content when denied (default: unauthorized message)
- `onAccessDenied?` - Callback when access denied
- `children` - Protected content

---

## 🛠️ Dev Tools Panel (The Killer Feature)

In development mode, **react-auth-gate** automatically renders a floating permission debugger.

### Features

✅ **Live Permission Tracking** - See every permission check as it happens  
✅ **Pass/Fail Details** - Understand why checks succeed or fail  
✅ **Rule Inspection** - See which rules evaluated and their results  
✅ **Context Override** - Test different roles, permissions, and flags  
✅ **Real-time Simulation** - Toggle permissions without code changes  
✅ **Zero Configuration** - Appears automatically when using `PermissionsRoot`

### How to Use

1. Use `PermissionsRoot` instead of `PermissionsProvider`
2. Run your app in development mode
3. Click the 🔐 icon in the bottom-right corner

### Panel Tabs

**1. Evaluations**
- Shows all permission checks in real-time
- Pass/fail status with rule details
- Timestamps and evaluation duration
- Resource information

**2. Overrides**
- Toggle roles on/off
- Add/remove permissions
- Enable/disable feature flags
- Test different scenarios instantly

**3. Context**
- View current user object
- See active roles and permissions
- Inspect feature flags
- Debug context values



## 🎓 Common Patterns

### Resource Ownership

```tsx
const rules = {
  'resource.edit': ({ user, resource }) =>
    user.role === 'admin' || user.id === resource.ownerId,
};
```

### Time-Based Access

```tsx
const rules = {
  'event.register': ({ resource }) => {
    const now = Date.now();
    return now >= resource.registrationStart && now <= resource.registrationEnd;
  },
};
```

### Hierarchical Permissions

```tsx
const rules = {
  'content.view': ({ permissions }) =>
    permissions.includes('content.view') ||
    permissions.includes('content.edit') ||
    permissions.includes('content.admin'),
};
```

### Complex Business Logic

```tsx
const rules = {
  'order.cancel': ({ user, resource }) => {
    // Can't cancel shipped orders
    if (resource.status === 'shipped') return false;
    
    // Customer can cancel within 24h
    if (user.id === resource.customerId) {
      const hoursSinceOrder = (Date.now() - resource.createdAt) / (1000 * 60 * 60);
      return hoursSinceOrder < 24;
    }
    
    // Admin can always cancel
    return user.role === 'admin';
  },
};
```

---

## 🧪 Testing

Permission rules are pure functions, making them easy to test.

```tsx
import { rules } from './permissions';

describe('user.edit permission', () => {
  it('allows admin to edit any user', () => {
    const result = rules['user.edit']({
      user: { id: '1', role: 'admin' },
      resource: { id: '2' },
      roles: ['admin'],
      permissions: [],
      flags: {},
    });
    
    expect(result).toBe(true);
  });
  
  it('allows user to edit themselves', () => {
    const result = rules['user.edit']({
      user: { id: '1', role: 'user' },
      resource: { id: '1' },
      roles: ['user'],
      permissions: [],
      flags: {},
    });
    
    expect(result).toBe(true);
  });
  
  it('denies user from editing others', () => {
    const result = rules['user.edit']({
      user: { id: '1', role: 'user' },
      resource: { id: '2' },
      roles: ['user'],
      permissions: [],
      flags: {},
    });
    
    expect(result).toBe(false);
  });
});
```

---

## 📦 Advanced Usage

### Custom Permission Provider

If you need custom integration without dev tools:

```tsx
import { PermissionsProvider } from 'react-auth-gate';

<PermissionsProvider {...config}>
  <App />
</PermissionsProvider>
```

### Manual Dev Tools Integration

```tsx
import { PermissionsProvider, DevPanel, useDevRegister } from 'react-auth-gate';

function Root() {
  const registerEvaluation = useDevRegister();
  
  return (
    <PermissionsProvider {...config} onEvaluationRegister={registerEvaluation}>
      <App />
      <DevPanel />
    </PermissionsProvider>
  );
}
```

### Direct Rule Engine Access

```tsx
import { evaluatePermission, createPermissionContext } from 'react-auth-gate';

const context = createPermissionContext(user, resource, roles, permissions, flags);
const result = await evaluatePermission(check, context, rulesMap);
```

---

## 🎨 TypeScript Support

Fully typed with generics for your custom types:

```tsx
interface User {
  id: string;
  role: 'admin' | 'user';
}

interface Post {
  id: string;
  authorId: string;
}

const rules: PermissionRulesMap<User, Post> = {
  'post.edit': ({ user, resource }) => {
    // Full type safety!
    return user.role === 'admin' || user.id === resource?.authorId;
  },
};
```

---

## 🔧 Framework Integration

### React Router

```tsx
import { ProtectedRoute } from 'react-auth-gate';
import { Navigate } from 'react-router-dom';

<Route
  path="/admin"
  element={
    <ProtectedRoute allow="admin" fallback={<Navigate to="/" />}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### Next.js

```tsx
// pages/admin.tsx
import { ProtectedRoute } from 'react-auth-gate';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();
  
  return (
    <ProtectedRoute
      allow="admin"
      onAccessDenied={() => router.push('/login')}
    >
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

### Remix

```tsx
import { ProtectedRoute } from 'react-auth-gate';
import { useNavigate } from '@remix-run/react';

export default function Route() {
  const navigate = useNavigate();
  
  return (
    <ProtectedRoute
      allow="admin"
      onAccessDenied={() => navigate('/login')}
    >
      <Content />
    </ProtectedRoute>
  );
}
```

---

## 🤔 FAQ

**Q: How is this different from checking permissions in components?**  
A: All permission logic is centralized in the rules map. Components don't contain authorization logic, making them easier to maintain and test.

**Q: Can I use this with server-side auth?**  
A: Yes! This library handles UI-level authorization. Your server should still validate permissions. This prevents unnecessary API calls and provides better UX.

**Q: Does this work with Next.js App Router?**  
A: Yes! Use `"use client"` for components using the library. Server Components can check permissions differently.

**Q: What about bundle size?**  
A: ~5KB gzipped. Tree-shakeable, so you only pay for what you use.

**Q: Can I use this without TypeScript?**  
A: Yes, but TypeScript is recommended for the best experience.

**Q: How do I disable the dev panel in production?**  
A: It's automatically disabled when `process.env.NODE_ENV === 'production'`.

---

## 🎯 Best Practices

1. ✅ **Centralize rules** - Define all rules in one place
2. ✅ **Keep rules pure** - No side effects in rule functions
3. ✅ **Test rules independently** - Rules are just functions
4. ✅ **Use TypeScript** - Get type safety for users and resources
5. ✅ **Async sparingly** - Async rules add latency
6. ✅ **Server-side validation** - Never trust client-side checks alone
7. ✅ **Use the dev panel** - Debug permissions visually
8. ✅ **Resource-based when possible** - More secure than role-only checks
9. ✅ **Fallback content** - Provide good UX when access is denied
10. ✅ **Name rules clearly** - Use dot notation: `resource.action`

---

## 📄 License

MIT © 2024

---

## 🙌 Contributing

Contributions are welcome! Please open an issue or PR.

---

## 🔗 Links

- [GitHub Repository](https://github.com/klejdi94/react-auth-gate)
- [npm Package](https://www.npmjs.com/package/react-auth-gate)
- [Report Issues](https://github.com/klejdi94/react-auth-gate/issues)

---

**Built with ❤️ for developers who value clean, maintainable code.**
