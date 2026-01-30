/**
 * Tests for the core rule engine
 */

import { describe, it, expect } from '@jest/globals';
import {
  evaluateRule,
  evaluatePermission,
  resolveStringRule,
  createPermissionContext,
} from '../src/core/ruleEngine';
import type { PermissionRule, PermissionContext } from '../src/core/types';

describe('Rule Engine', () => {
  describe('createPermissionContext', () => {
    it('should create a valid permission context', () => {
      const user = { id: '1', name: 'Test' };
      const resource = { id: '2' };
      const roles = ['admin'];
      const permissions = ['read'];
      const flags = { feature: true };

      const ctx = createPermissionContext(user, resource, roles, permissions, flags);

      expect(ctx.user).toBe(user);
      expect(ctx.resource).toBe(resource);
      expect(ctx.roles).toEqual(roles);
      expect(ctx.permissions).toEqual(permissions);
      expect(ctx.flags).toEqual(flags);
    });
  });

  describe('evaluateRule', () => {
    it('should evaluate a sync rule that returns true', async () => {
      const rule: PermissionRule = () => true;
      const ctx = createPermissionContext({}, undefined, [], [], {});

      const result = await evaluateRule(rule, ctx);

      expect(result.result).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeUndefined();
    });

    it('should evaluate a sync rule that returns false', async () => {
      const rule: PermissionRule = () => false;
      const ctx = createPermissionContext({}, undefined, [], [], {});

      const result = await evaluateRule(rule, ctx);

      expect(result.result).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should evaluate an async rule', async () => {
      const rule: PermissionRule = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return true;
      };
      const ctx = createPermissionContext({}, undefined, [], [], {});

      const result = await evaluateRule(rule, ctx);

      expect(result.result).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(5); // Allow for timing variance
    });

    it('should handle rule errors gracefully', async () => {
      const rule: PermissionRule = () => {
        throw new Error('Test error');
      };
      const ctx = createPermissionContext({}, undefined, [], [], {});

      const result = await evaluateRule(rule, ctx);

      expect(result.result).toBe(false);
      expect(result.error).toBe('Test error');
    });
  });

  describe('resolveStringRule', () => {
    it('should return custom rule if exists', () => {
      const customRule: PermissionRule = () => true;
      const rulesMap = { 'test.rule': customRule };
      const ctx = createPermissionContext({}, undefined, [], [], {});

      const resolved = resolveStringRule('test.rule', rulesMap, ctx);

      expect(resolved).toBe(customRule);
    });

    it('should check permissions array if no custom rule', () => {
      const rulesMap = {};
      const ctx = createPermissionContext({}, undefined, [], ['test.permission'], {});

      const resolved = resolveStringRule('test.permission', rulesMap, ctx);
      const result = resolved(ctx);

      expect(result).toBe(true);
    });

    it('should check roles array if no custom rule', () => {
      const rulesMap = {};
      const ctx = createPermissionContext({}, undefined, ['admin'], [], {});

      const resolved = resolveStringRule('admin', rulesMap, ctx);
      const result = resolved(ctx);

      expect(result).toBe(true);
    });

    it('should return false if not found anywhere', () => {
      const rulesMap = {};
      const ctx = createPermissionContext({}, undefined, [], [], {});

      const resolved = resolveStringRule('not.exists', rulesMap, ctx);
      const result = resolved(ctx);

      expect(result).toBe(false);
    });
  });

  describe('evaluatePermission', () => {
    describe('with inline function', () => {
      it('should evaluate inline function', async () => {
        const check: PermissionRule = ({ user }) => user.id === '1';
        const ctx = createPermissionContext({ id: '1' }, undefined, [], [], {});

        const result = await evaluatePermission(check, ctx, {});

        expect(result.allowed).toBe(true);
        expect(result.ruleResults).toHaveLength(1);
        expect(result.ruleResults[0].rule).toBe('inline');
      });
    });

    describe('with string permission', () => {
      it('should evaluate string permission', async () => {
        const rulesMap = {
          'user.edit': ({ user }) => user.role === 'admin',
        };
        const ctx = createPermissionContext({ role: 'admin' }, undefined, [], [], {});

        const result = await evaluatePermission('user.edit', ctx, rulesMap);

        expect(result.allowed).toBe(true);
        expect(result.ruleResults[0].rule).toBe('user.edit');
      });
    });

    describe('with array of permissions (any mode)', () => {
      it('should pass if any permission is granted', async () => {
        const ctx = createPermissionContext(
          {},
          undefined,
          ['admin', 'user'],
          [],
          {}
        );

        const result = await evaluatePermission(['admin', 'moderator'], ctx, {}, 'any');

        expect(result.allowed).toBe(true);
      });

      it('should fail if no permissions are granted', async () => {
        const ctx = createPermissionContext({}, undefined, ['user'], [], {});

        const result = await evaluatePermission(['admin', 'moderator'], ctx, {}, 'any');

        expect(result.allowed).toBe(false);
      });
    });

    describe('with array of permissions (all mode)', () => {
      it('should pass if all permissions are granted', async () => {
        const ctx = createPermissionContext(
          {},
          undefined,
          ['admin', 'moderator'],
          [],
          {}
        );

        const result = await evaluatePermission(
          ['admin', 'moderator'],
          ctx,
          {},
          'all'
        );

        expect(result.allowed).toBe(true);
      });

      it('should fail if not all permissions are granted', async () => {
        const ctx = createPermissionContext({}, undefined, ['admin'], [], {});

        const result = await evaluatePermission(
          ['admin', 'moderator'],
          ctx,
          {},
          'all'
        );

        expect(result.allowed).toBe(false);
      });
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle resource-based permission (PBAC)', async () => {
      const rule: PermissionRule = ({ user, resource }) =>
        user.role === 'admin' || user.id === resource?.ownerId;

      const rulesMap = { 'resource.edit': rule };

      // Owner can edit
      const ownerCtx = createPermissionContext(
        { id: '1', role: 'user' },
        { ownerId: '1' },
        [],
        [],
        {}
      );
      const ownerResult = await evaluatePermission('resource.edit', ownerCtx, rulesMap);
      expect(ownerResult.allowed).toBe(true);

      // Admin can edit
      const adminCtx = createPermissionContext(
        { id: '2', role: 'admin' },
        { ownerId: '1' },
        [],
        [],
        {}
      );
      const adminResult = await evaluatePermission('resource.edit', adminCtx, rulesMap);
      expect(adminResult.allowed).toBe(true);

      // Other user cannot edit
      const otherCtx = createPermissionContext(
        { id: '3', role: 'user' },
        { ownerId: '1' },
        [],
        [],
        {}
      );
      const otherResult = await evaluatePermission('resource.edit', otherCtx, rulesMap);
      expect(otherResult.allowed).toBe(false);
    });

    it('should handle async permission check', async () => {
      const rule: PermissionRule = async ({ user }) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 5));
        return user.subscription === 'premium';
      };

      const rulesMap = { 'premium.feature': rule };

      const ctx = createPermissionContext(
        { subscription: 'premium' },
        undefined,
        [],
        [],
        {}
      );

      const result = await evaluatePermission('premium.feature', ctx, rulesMap);

      expect(result.allowed).toBe(true);
      expect(result.ruleResults[0].duration).toBeGreaterThanOrEqual(5);
    });

    it('should handle complex ABAC rule', async () => {
      const rule: PermissionRule = ({ user, resource, flags }) => {
        if (!resource) return false;

        // Feature must be enabled
        if (!flags.advancedFeatures) return false;

        // User must be verified
        if (!user.verified) return false;

        // Resource must not be locked
        if (resource.locked) return false;

        // User must have sufficient level
        return user.level >= resource.requiredLevel;
      };

      const rulesMap = { 'advanced.action': rule };

      const ctx = createPermissionContext(
        { verified: true, level: 5 },
        { locked: false, requiredLevel: 3 },
        [],
        [],
        { advancedFeatures: true }
      );

      const result = await evaluatePermission('advanced.action', ctx, rulesMap);

      expect(result.allowed).toBe(true);
    });
  });
});
