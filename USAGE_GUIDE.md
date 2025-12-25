# 📚 Cognitive Learning Platform - Complete Usage Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (for backend)
- Node.js 16+ (for frontend)
- SQLite (included with Django)

### Running the Application

**Terminal 1 - Backend:**
```bash
cd C:\ctlg\backend
python manage.py migrate
python manage.py runserver
```
Backend runs on: `http://127.0.0.1:8000`

**Terminal 2 - Frontend:**
```bash
cd C:\ctlg\frontend
npm install  # First time only
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 👤 USER ROLES

### 1. **Student** (دانش‌آموز)
- Can take tests
- Has cognitive level (1-10)
- Can view learning content
- Can track progress

### 2. **Teacher** (استاد)
- Can create tests and content
- Cannot take tests
- No cognitive level

### 3. **Admin** (مدیر)
- All teacher features
- Analytics dashboard
- User management
- Alert management

---

## 🔐 AUTHENTICATION

### Registration (ثبت‌نام)

1. Go to `http://localhost:5173/signup`
2. Fill in the form:
   - **Username**: Choose a unique username
   - **Email**: (Optional)
   - **Password**: Enter password
   - **Confirm Password**: Re-enter password
   - **Account Type**: Select "دانش‌آموز" (Student) or "استاد" (Teacher)
3. Click **"ثبت‌نام"** (Register)
4. You'll be automatically logged in

### Login (ورود)

1. Go to `http://localhost:5173/login`
2. Enter your **Username** and **Password**
3. Click **"ورود"** (Login)
4. You'll be redirected to the home page

### Logout (خروج)

- Click **"خروج"** button in the top navigation bar

---

## 🎓 STUDENT FEATURES

### Taking Tests (آزمون دادن)

#### Step 1: View Available Tests
1. After login, click **"آزمون‌ها"** (Tests) in the navigation
2. You'll see all tests matching your cognitive level
3. Each test card shows:
   - Test title
   - Description
   - Level range (min to max)

#### Step 2: Start a Test
1. Click **"شروع آزمون"** (Start Test) on any test card
2. The test session starts automatically
3. Read each question carefully
4. Select your answer (radio button for multiple choice)
5. Answer all questions

#### Step 3: Submit Test
1. After answering all questions, click **"ثبت و پایان آزمون"** (Submit and Finish)
2. You'll be redirected to the results page

#### Step 4: View Results
- **Score**: Your total score
- **New Level**: Your updated cognitive level
- **Level Up**: If you leveled up, you'll see a congratulations message
- **Success Percentage**: Percentage of correct answers
- **Completion Date**: When you finished the test

**Note**: Your cognitive level updates automatically based on your score!

### Viewing Learning Content (مشاهده محتوای آموزشی)

#### Step 1: Access Content
1. Click **"آموزش‌ها"** (Learning) in the navigation
2. Or go to home page (`/`)
3. You'll see content matching your cognitive level

#### Step 2: View Content Types
- **Text Content**: Read articles/text
- **Image Content**: View images
- **Video Content**: Watch videos (with controls)
- **Scenario Content**: Interactive scenarios

#### Step 3: Track Progress
For each content item, you can:
- Click **"25% تکمیل شد"** - Mark 25% complete
- Click **"50% تکمیل شد"** - Mark 50% complete
- Click **"75% تکمیل شد"** - Mark 75% complete
- Click **"✓ تکمیل شد"** - Mark as completed (100%)

**Progress Bar**: Shows your completion percentage visually

### Viewing Alerts (مشاهده هشدارها)

1. Click **"هشدارها"** (Alerts) in the navigation
2. You'll see a red badge with unread count (if any)
3. View all alerts:
   - **Info** (اطلاعیه) - Blue badge
   - **Warning** (هشدار) - Yellow badge
   - **Critical** (مهم) - Red badge
4. Click **"خوانده شد"** (Mark as Read) on unread alerts
5. Click **"علامت‌گذاری همه به عنوان خوانده شده"** to mark all as read

---

## 👨‍🏫 TEACHER FEATURES

### Creating Tests (ساخت آزمون)

#### Step 1: Access Teacher Dashboard
1. Login as Teacher
2. Click **"پنل استاد"** (Teacher Panel) in navigation
3. Make sure you're on the **"آزمون‌ها"** (Tests) tab

#### Step 2: Create New Test
1. Click **"ساخت آزمون جدید"** (Create New Test)
2. Fill in test information:
   - **Title**: Test name
   - **Description**: Test description (optional)
   - **Min Level**: Minimum cognitive level (1-10)
   - **Max Level**: Maximum cognitive level (1-10)
   - **Active**: Checkbox to activate/deactivate

#### Step 3: Add Questions
1. Click **"+ افزودن سوال"** (Add Question)
2. Fill in question form:
   - **Question Text**: Enter the question
   - **Question Type**: 
     - **"چندگزینه‌ای"** (Multiple Choice) - MCQ
     - **"متنی"** (Text) - Text answer
   - **Order**: Question order number

#### Step 4: Add Choices (for MCQ)
1. For each choice:
   - Enter **"متن گزینه"** (Choice Text)
   - Check **"پاسخ صحیح"** (Correct Answer) if it's the right answer
   - Enter **"امتیاز"** (Score) - Points for this choice
2. Click **"+ افزودن گزینه"** (Add Choice) to add more choices
3. Minimum 2 choices required for MCQ

#### Step 5: Save Question
1. Click **"ذخیره سوال"** (Save Question)
2. Question appears in the list
3. Repeat to add more questions

#### Step 6: Create Test
1. After adding all questions, click **"ساخت آزمون"** (Create Test)
2. Test is created with all questions and choices

### Managing Tests

#### View Created Tests
- All your tests appear in the grid below the form
- Each card shows:
  - Test title
  - Description
  - Level range
  - Status (Active/Inactive)

#### Add More Questions to Existing Test
1. Click **"مشاهده و افزودن سوال"** (View and Add Questions) on any test
2. Click **"افزودن سوال جدید"** (Add New Question)
3. Fill in question form (same as above)
4. Click **"افزودن سوال"** (Add Question)

### Creating Learning Content (ساخت محتوای آموزشی)

#### Step 1: Switch to Content Tab
1. In Teacher Dashboard, click **"محتواهای آموزشی"** (Learning Content) tab

#### Step 2: Create Content
1. Click **"ساخت محتوای جدید"** (Create New Content)
2. Fill in the form:
   - **Title**: Content title
   - **Description**: Content description
   - **Content Type**: 
     - **"متن"** (Text) - For HTML/text content
     - **"تصویر"** (Image) - For image URLs
     - **"ویدیو"** (Video) - For video URLs
     - **"سناریو"** (Scenario) - For JSON scenarios
   - **Content**: 
     - For Text: HTML or plain text
     - For Image/Video: URL
     - For Scenario: JSON structure
   - **Min Level**: Minimum cognitive level (1-10)
   - **Max Level**: Maximum cognitive level (1-10)
   - **Active**: Checkbox to activate/deactivate

#### Step 3: Save Content
1. Click **"ساخت محتوا"** (Create Content)
2. Content appears in the list

---

## 👑 ADMIN FEATURES

### Accessing Admin Dashboard
1. Login as Admin
2. Click **"داشبورد"** (Dashboard) in navigation

### Viewing Analytics

The dashboard shows:
- **Total Users**: Number of registered users
- **Total Test Sessions**: Number of completed tests
- **Average Test Score**: Average score across all tests
- **Completed Content**: Number of completed learning contents
- **Cognitive Level Distribution**: Breakdown of users by level

### Managing Alerts

#### Send Alert to User
1. In Admin Dashboard, scroll to **"مدیریت هشدارها"** (Alert Management)
2. Click **"ارسال هشدار جدید"** (Send New Alert)
3. Fill in the form:
   - **User**: Select user from dropdown
   - **Severity**: 
     - **"اطلاعیه"** (Info) - General information
     - **"هشدار"** (Warning) - Warning message
     - **"مهم"** (Critical) - Critical alert
   - **Message**: Enter alert message
4. Click **"ارسال هشدار"** (Send Alert)

#### View Sent Alerts
- All sent alerts appear below the form
- Shows:
  - Target user
  - Severity badge
  - Message
  - Read/Unread status
  - Creation date

### Viewing All Users
- User list is loaded automatically when sending alerts
- Shows all registered users with their roles

---

## 🎯 KEY FEATURES SUMMARY

### ✅ Implemented Features

#### Authentication
- ✅ User registration (Student/Teacher)
- ✅ Login/Logout
- ✅ JWT token authentication
- ✅ Role-based access control

#### Student Features
- ✅ View available tests (filtered by level)
- ✅ Take tests (multiple choice)
- ✅ View test results with score
- ✅ Automatic cognitive level update
- ✅ Level up notifications
- ✅ View learning content (text/image/video/scenario)
- ✅ Track learning progress (25%, 50%, 75%, 100%)
- ✅ View progress bar
- ✅ View alerts with severity levels
- ✅ Mark alerts as read
- ✅ Unread alert count badge

#### Teacher Features
- ✅ Create tests with questions
- ✅ Add multiple choice questions with choices
- ✅ Set correct answers and scores
- ✅ Create learning content (text/image/video/scenario)
- ✅ Set content level ranges
- ✅ View created tests and content
- ✅ Add questions to existing tests
- ✅ Edit tests and content

#### Admin Features
- ✅ View analytics dashboard
- ✅ See user statistics
- ✅ View test session statistics
- ✅ See cognitive level distribution
- ✅ Send alerts to users
- ✅ View all sent alerts
- ✅ View all users
- ✅ Manage alert system

---

## 🔧 TECHNICAL DETAILS

### API Endpoints

#### Authentication
- `POST /api/accounts/register/` - Register new user
- `POST /api/accounts/token/` - Login (get JWT tokens)
- `GET /api/accounts/me/` - Get current user info
- `GET /api/accounts/users/` - List all users (Admin only)

#### Assessment
- `GET /api/assessment/tests/` - List available tests (Student only)
- `GET /api/assessment/tests/<id>/` - Get test details
- `POST /api/assessment/tests/create/` - Create test (Teacher/Admin)
- `POST /api/assessment/tests/<id>/questions/` - Add question (Teacher/Admin)
- `POST /api/assessment/tests/<id>/start/` - Start test session (Student only)
- `POST /api/assessment/sessions/<id>/submit/` - Submit test (Student only)
- `GET /api/assessment/sessions/<id>/` - Get session result

#### Learning
- `GET /api/learning/recommended/` - Get recommended content
- `GET /api/learning/content/<id>/` - Get content details
- `POST /api/learning/content/` - Create content (Teacher/Admin)
- `POST /api/learning/content/<id>/progress/` - Update progress
- `GET /api/learning/progress/` - Get user progress

#### Analytics
- `GET /api/analytics/overview/` - Get analytics (Admin only)
- `GET /api/analytics/my-alerts/` - Get user alerts
- `GET /api/analytics/alerts/` - List all alerts (Admin only)
- `POST /api/analytics/alerts/` - Send alert (Admin only)
- `PATCH /api/analytics/alerts/<id>/` - Update alert (mark as read)

---

## 📝 NOTES

### Cognitive Level System
- Students start at level 1
- Level increases based on test scores:
  - Score < 20: Level 1
  - Score < 40: Level 2
  - Score < 60: Level 3
  - Score < 80: Level 4
  - Score ≥ 80: Level 5
- Content and tests are filtered by cognitive level
- Teachers and Admins don't have cognitive levels

### Test Scoring
- Each choice has a score value
- Total score = sum of all choice scores
- Only correct answers contribute to score

### Content Filtering
- Content is shown based on user's cognitive level
- Only content where: min_level ≤ user_level ≤ max_level

### Alert System
- Alerts are sent by Admins
- Alerts have severity levels (Info, Warning, Critical)
- Unread alerts show a badge count
- Alerts auto-refresh every 30 seconds

---

## 🐛 TROUBLESHOOTING

### Backend Issues
- **Migration errors**: Run `python manage.py migrate`
- **Port 8000 in use**: Change port with `python manage.py runserver 8001`
- **Database errors**: Delete `db.sqlite3` and run migrations again

### Frontend Issues
- If you see build/lint/script errors:
  1. From repo root run: `node tools/fix_frontend_common.js`
  2. Then:
     ```bash
     cd frontend
     npm ci
     npm run lint
     npm run build
     ```
  3. If API requests fail in the browser, create `frontend/.env.local` with:
     ```
     VITE_API_URL=http://127.0.0.1:8000
     ```
  4. Re-run the app and check browser console / network tab for CORS or JS errors.
- Use the CI workflow "Frontend checks" to catch issues automatically.
### Common Issues
- **Can't see tests**: Make sure you're logged in as Student
- **Can't create tests**: Make sure you're logged in as Teacher/Admin
- **No content shown**: Your cognitive level might not match any content
- **Alerts not showing**: Check if backend is running and API is accessible

---

## 📞 SUPPORT

If you encounter any issues:
1. Check browser console for errors
2. Check backend terminal for error messages
3. Verify both servers are running
4. Check user role permissions
5. Verify database migrations are applied

---

## ✅ Automated service checks (new)

You can run a quick automated check for backend/frontend APIs.

1. Edit `tools/services.example.json` and set your base URLs and optional login credentials (or export env vars).
2. Run locally:
```bash
python tools/check_services.py --config tools/services.example.json
```
Environment (optional):
- CHECK_LOGIN_URL (overrides config.login.url)
- CHECK_USERNAME
- CHECK_PASSWORD

3. In CI: use the included GitHub Actions workflow ".github/workflows/check-services.yml" (workflow_dispatch), and set secrets CHECK_LOGIN_URL, CHECK_USERNAME and CHECK_PASSWORD if auth is needed.

---

## ✅ Run full local checks (backend + frontend + APIs)

From repo root:

- Linux / macOS:
```bash
chmod +x tools/run_all_checks.sh
./tools/run_all_checks.sh
```

- Windows (PowerShell):
```powershell
.\tools\run_all_checks.ps1
```

What it does:
- runs Django migrations and starts the backend
- builds frontend and serves the built site
- waits for endpoints and runs tools/check_services.py
- prints logs and exits non-zero on failures

CI:
- Trigger the workflow "Integration - start servers & run checks" (manual dispatch or on push/PR)

---

**Last Updated**: December 2025
**Version**: 1.0.0

## Frontend dev proxy (fixes CORS during development)

If you're running the frontend with Vite, dev requests to /api/* are proxied to the backend at http://127.0.0.1:8000 automatically (see `frontend/vite.config.js`). Start backend then run the frontend dev server as usual.

## Running smoke tests locally

From the repo root:
```bash
# ensure backend is running (http://127.0.0.1:8000)
# ensure frontend dev or preview is running (http://localhost:5173)
node tools/smoke_all.js --config tools/services.example.json
```

## CI

The "Frontend checks" workflow now serves the built frontend and runs the smoke tests (see .github/workflows/frontend-checks.yml).

