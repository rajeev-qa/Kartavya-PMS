# Permission System Testing Guide

## 🔐 Permission System Verification

This guide helps you test the comprehensive permission system implemented in Kartavya PMS.

## 📋 Test Accounts Created

### 1. Admin User (Full Access)
- **Email**: admin@kartavya.com
- **Password**: admin123
- **Permissions**: All 80+ permissions
- **Expected**: Full access to all features

### 2. Developer User (Standard Access)
- **Email**: john@example.com
- **Password**: john123
- **Permissions**: 25+ development-focused permissions
- **Expected**: Project and issue management, limited admin access

### 3. Viewer User (Read-Only)
- **Email**: viewer@kartavya.com
- **Password**: viewer123
- **Permissions**: Only 4 view permissions
- **Expected**: Read-only access, no create/edit/delete buttons

### 4. Limited Developer
- **Email**: limiteddev@kartavya.com
- **Password**: viewer123
- **Permissions**: 8 limited permissions
- **Expected**: Basic development tasks, no admin access

## 🧪 Testing Scenarios

### 1. Menu Visibility Test
**What to Test**: Different users see different menu items

**Steps**:
1. Login as each test user
2. Check sidebar navigation
3. Verify only permitted menu items are visible

**Expected Results**:
- **Admin**: All menu items visible
- **Developer**: No admin menu items except Users (view only)
- **Viewer**: Only Dashboard, Projects, Search, Reports
- **Limited Dev**: Basic menus + Test Cases

### 2. Button/Action Visibility Test
**What to Test**: Action buttons appear based on permissions

**Steps**:
1. Go to Projects page
2. Check for "New Project" button
3. Click project dropdown menu
4. Verify available actions

**Expected Results**:
- **Admin**: All buttons (Create, Edit, Delete, Settings)
- **Developer**: Create, Edit buttons (no Delete)
- **Viewer**: Only View actions, no Create/Edit/Delete
- **Limited Dev**: View and basic Edit actions

### 3. Page Access Test
**What to Test**: Direct URL access is blocked without permissions

**Steps**:
1. Login as Viewer user
2. Try to access `/admin/users` directly
3. Try to access `/admin/roles` directly
4. Try to access `/issues/new` directly

**Expected Results**:
- Should redirect or show access denied
- Only permitted pages should load

### 4. API Permission Test
**What to Test**: Backend API enforces permissions

**Steps**:
1. Login as Viewer user
2. Open browser dev tools
3. Try to make POST request to create issue
4. Try to access admin endpoints

**Expected Results**:
- API should return 403 Forbidden
- Only permitted API calls should succeed

## 🔍 Permission Testing Page

Visit `/admin/permission-test` to see a comprehensive permission testing interface that shows:

- Current user's role and permissions
- Permission test results by category
- Menu access testing
- Real-time permission validation

## 📊 Permission Categories Tested

### Project Management (9 permissions)
- project.create, project.edit, project.delete, project.view
- project.archive, project.lead, project.components, project.versions, project.settings

### Issue Management (14 permissions)
- issue.create, issue.edit, issue.delete, issue.assign, issue.comment
- issue.transition, issue.link, issue.watch, issue.vote, issue.attachments
- issue.worklog, issue.clone, issue.move, issue.bulk_edit

### User Management (11 permissions)
- user.create, user.edit, user.delete, user.view, user.deactivate
- user.reset_password, user.assign_roles, user.manage_groups
- user.impersonate, user.view_activity, user.manage_permissions

### Team Management (6 permissions)
- team.create, team.edit, team.delete, team.add_members
- team.remove_members, team.assign_lead

### Administration (8 permissions)
- admin.settings, admin.roles, admin.permissions, admin.audit_logs
- admin.backup, admin.maintenance, admin.integrations, admin.notifications

### Reporting & Analytics (6 permissions)
- report.view, report.create, report.export, report.share
- report.schedule, report.dashboard

### Board Management (6 permissions)
- board.create, board.edit, board.delete, board.configure
- board.filters, board.swimlanes

### Sprint Management (6 permissions)
- sprint.create, sprint.edit, sprint.start, sprint.complete
- sprint.delete, sprint.plan

### Workflow Management (4 permissions)
- workflow.create, workflow.edit, workflow.delete, workflow.assign

### Search & Filters (3 permissions)
- search.advanced, search.save_filters, search.share_filters

### Test Management (4 permissions)
- test.create, test.execute, test.manage, test.report

## ✅ Verification Checklist

### Frontend Permission Enforcement
- [ ] Sidebar menu items filtered by permissions
- [ ] Action buttons hidden without permissions
- [ ] Dropdown menus show only permitted actions
- [ ] Page components check permissions before rendering
- [ ] Forms disable fields based on permissions

### Backend Permission Enforcement
- [ ] API endpoints protected with permission middleware
- [ ] Database operations validate user permissions
- [ ] Role-based access control working
- [ ] Permission inheritance from roles
- [ ] Proper error messages for denied access

### Database Consistency
- [ ] Roles table populated with system roles
- [ ] RolePermission table has correct mappings
- [ ] Users assigned to appropriate roles
- [ ] Permission strings match frontend checks
- [ ] No orphaned permissions or roles

### Authentication Integration
- [ ] Login returns user with permissions array
- [ ] JWT tokens include necessary user data
- [ ] Session management preserves permissions
- [ ] Logout clears permission cache
- [ ] Permission changes reflect immediately

## 🚨 Common Issues to Check

1. **Permission String Mismatch**: Frontend checks 'project.create' but backend has 'project_create'
2. **Missing Permission Checks**: New features added without permission validation
3. **Role Assignment**: Users not properly assigned to roles
4. **Cache Issues**: Permission changes not reflected until logout/login
5. **API Inconsistency**: Frontend allows action but API denies it

## 🔧 Debugging Tools

1. **Permission Test Page**: `/admin/permission-test`
2. **Browser Console**: Check for permission denial logs
3. **Network Tab**: Verify API responses for 403 errors
4. **Database Query**: Check role_permissions table directly
5. **User Object**: Log user.permissions array in console

## 📝 Test Results Documentation

After testing, document:
- Which permissions work correctly
- Any bypassed restrictions
- Missing permission checks
- UI/UX issues with hidden elements
- Performance impact of permission checks

## 🎯 Success Criteria

The permission system is working correctly when:
- Users only see features they have permission for
- All actions are properly restricted
- No unauthorized API access possible
- Permission changes take effect immediately
- System remains performant with permission checks
- Error messages are user-friendly
- Admin can manage permissions easily

## 🔄 Continuous Testing

Set up automated tests for:
- Permission middleware on all API endpoints
- Frontend component permission checks
- Role assignment and inheritance
- Permission string consistency
- Database constraint validation