# 🧪 VERIFICATION TEST SCRIPT

## 📋 **PRE-TEST SETUP**

### 1. **Database Migration**
```bash
# Connect to PostgreSQL and run the migration
psql -U postgres -d kartavya_pms -f server/scripts/add-default-assignee.sql
```

### 2. **Regenerate Prisma Client**
```bash
cd server
npx prisma generate
```

### 3. **Restart Backend Server**
```bash
cd server
npm run dev
```

---

## ✅ **TEST CASES**

### **Test 1: Workflow Management - Database Integration**

#### **Steps:**
1. Navigate to `http://localhost:3001/workflow`
2. Click "Create Workflow"
3. Fill in:
   - Name: "Test Workflow"
   - Description: "Testing database integration"
   - Select a project
4. Click "Create"

#### **Expected Results:**
- ✅ Workflow should be created in database
- ✅ Should appear in workflow list
- ✅ No console errors
- ✅ Success toast message

#### **Verification:**
```sql
-- Check if workflow was created
SELECT * FROM workflows ORDER BY created_at DESC LIMIT 1;
SELECT * FROM workflow_transitions WHERE workflow_id = (SELECT id FROM workflows ORDER BY created_at DESC LIMIT 1);
```

---

### **Test 2: Default Assignee Management**

#### **Steps:**
1. Go to `http://localhost:3001/workflow`
2. Click "Default Assignees" tab
3. Click "Set Default Assignee"
4. Fill in:
   - Project: Select any project
   - Issue Type: "Bug"
   - Assignee: Select a user
5. Click "Set Default"

#### **Expected Results:**
- ✅ Default assignee should be saved to database
- ✅ Should appear in default assignees list
- ✅ No console errors

#### **Verification:**
```sql
-- Check if default assignee was created
SELECT * FROM default_assignees ORDER BY created_at DESC LIMIT 1;
```

---

### **Test 3: Dashboard Management - Backend Integration**

#### **Steps:**
1. Navigate to `http://localhost:3001/dashboard/manage`
2. Click "Create Dashboard"
3. Fill in:
   - Name: "Test Dashboard"
   - Description: "Testing backend integration"
4. Click "Create"
5. Click "Add Gadget"
6. Select "Sprint Health"
7. Click "Add Gadget"

#### **Expected Results:**
- ✅ Dashboard should be created via API
- ✅ Gadget should be added via API
- ✅ Should see dashboard in list
- ✅ No console errors

#### **Verification:**
```sql
-- Check if dashboard was created
SELECT * FROM dashboards ORDER BY created_at DESC LIMIT 1;
SELECT * FROM gadgets WHERE dashboard_id = (SELECT id FROM dashboards ORDER BY created_at DESC LIMIT 1);
```

---

### **Test 4: Reports - Backend Integration**

#### **Steps:**
1. Navigate to `http://localhost:3001/reports/enhanced`
2. Select a project
3. Select a sprint (if available)
4. Click on "Burndown Chart" under Sprint Reports
5. Try "Velocity Chart"
6. Try "Time Tracking" under Project Reports

#### **Expected Results:**
- ✅ Reports should generate with real data when available
- ✅ Should fallback to mock data gracefully
- ✅ Success message should appear
- ✅ Charts should display

---

### **Test 5: Integrations - Backend Integration**

#### **Steps:**
1. Navigate to `http://localhost:3001/integrations`
2. Check if integrations load
3. Try "Run Build" button
4. Fill in build form and submit
5. Check "Repository" tab
6. Try "Create Branch" and "Create Commit"

#### **Expected Results:**
- ✅ Integrations should load from backend
- ✅ Build should be triggered successfully
- ✅ Branch/commit creation should work
- ✅ No console errors

---

## 🔍 **DEBUGGING CHECKLIST**

### **If Tests Fail:**

#### **1. Check Backend Logs**
```bash
# In server directory
npm run dev
# Look for any error messages
```

#### **2. Check Database Connection**
```bash
# Test database connection
psql -U postgres -d kartavya_pms -c "SELECT COUNT(*) FROM users;"
```

#### **3. Check Prisma Client**
```bash
# Regenerate Prisma client
cd server
npx prisma generate
npx prisma db push
```

#### **4. Check Frontend Console**
- Open browser DevTools
- Look for any JavaScript errors
- Check Network tab for failed API calls

#### **5. Verify Environment Variables**
```bash
# Check server/.env file
cat server/.env
# Ensure DATABASE_URL is correct
```

---

## 📊 **SUCCESS CRITERIA**

### **All Tests Must Pass:**
- ✅ Workflow Management: Database integration working
- ✅ Default Assignees: CRUD operations working
- ✅ Dashboard Management: API integration working
- ✅ Reports: Backend integration with fallback
- ✅ Integrations: API connection established

### **No Critical Errors:**
- ✅ No console errors in browser
- ✅ No backend server errors
- ✅ No database connection issues
- ✅ All API endpoints responding

### **Data Persistence:**
- ✅ Workflows saved to database
- ✅ Default assignees saved to database
- ✅ Dashboards saved to database
- ✅ All data survives server restart

---

## 🚀 **POST-TEST VERIFICATION**

### **1. Restart Everything**
```bash
# Stop backend server (Ctrl+C)
# Stop frontend (Ctrl+C)
# Restart backend
cd server && npm run dev
# Restart frontend
npm run dev
```

### **2. Verify Data Persistence**
- Check if created workflows still exist
- Check if default assignees are still there
- Check if dashboards are still available

### **3. Performance Check**
- All pages should load within 2 seconds
- No memory leaks in browser
- Database queries should be efficient

---

## ✅ **COMPLETION CHECKLIST**

- [ ] Database migration completed successfully
- [ ] All 5 test cases passed
- [ ] No critical errors found
- [ ] Data persistence verified
- [ ] Performance is acceptable
- [ ] All static data issues resolved
- [ ] Backend connectivity confirmed

---

*Test Script Version: 1.0*  
*Last Updated: January 2025*