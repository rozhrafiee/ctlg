# API ↔ Frontend Coverage Matrix

Base URL: `/api` (Vite `VITE_API_BASE`).

Legend: **Used** = called from primary React app · **Intentional** = kept on purpose (alias, admin tooling, or documented dual path)

| Method | Endpoint | Frontend usage | Status |
|--------|----------|----------------|--------|
| POST | `/accounts/login/` | AuthContext | Used |
| POST | `/accounts/token/refresh/` | api/client interceptor | Used |
| POST | `/accounts/logout/` | AuthContext logout | Used |
| POST | `/accounts/register/` | AuthContext | Used |
| GET/PATCH | `/accounts/profile/` | AuthContext, ProfilePage | Used |
| GET | `/assessment/tests/` | useAssessment → TestListPage | Used |
| GET | `/assessment/tests/<id>/` | TestTaking | Used |
| POST | `/assessment/tests/<id>/start/` | TestTaking | Used |
| POST | `/assessment/sessions/<sid>/questions/<qid>/answer/` | TestTaking | Used |
| POST | `/assessment/sessions/<sid>/finish/` | TestTaking | Used |
| GET | `/assessment/student/results/<pk>/` | TestResultPage | Used |
| GET | `/assessment/results/<pk>/` | — | **Intentional** alias of student result detail (API clients / docs) |
| GET | `/assessment/my-history/` | History | Used |
| GET | `/assessment/teacher/tests/all/` | TeacherTestList | Used |
| POST | `/assessment/teacher/tests/create/` | CreateTestPage | Used |
| POST | `/assessment/teacher/tests/placement/create/` | useAssessment.createPlacementTest | Used (hook) |
| GET/PUT/PATCH | `/assessment/teacher/tests/update/<pk>/` | EditTest / getTestDetail | Used |
| DELETE | `/assessment/teacher/tests/delete/<pk>/` | TeacherTestList | Used |
| POST | `/assessment/content/<id>/test/create/` | CreateContent flow | Used |
| GET | `/assessment/teacher/tests/<id>/questions/list/` | TestQuestionsPage | Used |
| POST | `/assessment/teacher/tests/<id>/questions/` | TestQuestionsPage | Used |
| PATCH | `/assessment/teacher/questions/<id>/update/` | QuestionFormModal | Used |
| DELETE | `/assessment/teacher/questions/<id>/delete/` | TestQuestionsPage | Used |
| GET | `/assessment/teacher/reviews/pending/` | GradingPage | Used |
| GET | `/assessment/teacher/sessions/<id>/` | GradingPage | Used |
| POST | `/assessment/teacher/sessions/<id>/grade/` | GradingPage | Used |
| GET | `/adaptive-learning/recommended/` | RecommendedPage | Used |
| GET | `/adaptive-learning/recommendations/` | RecommendationsPage | Used |
| POST | `/adaptive-learning/recommendations/<id>/click/` | StudentDashboard | Used |
| GET | `/adaptive-learning/learning-path/` | LearningPathPage | Used |
| POST | `/adaptive-learning/learning-path/reset/` | LearningPathPage | Used |
| GET | `/adaptive-learning/learning-roadmap/` | LearningPath / Adaptive | Used |
| GET | `/adaptive-learning/progress/` | ProgressPage | Used |
| POST | `/adaptive-learning/content/<id>/progress/` | ContentDetailPage | Used |
| GET | `/adaptive-learning/content/<pk>/` | ContentDetail / EditContent | Used |
| GET | `/adaptive-learning/dashboard/` | AdaptiveDashboardPage | Used |
| GET/POST | `/adaptive-learning/teacher/contents/` | TeacherContentList (GET); POST = **Intentional** alternate create | Used GET / Intentional POST |
| POST | `/adaptive-learning/teacher/content/create/` | CreateContentPage | Used |
| PUT/PATCH | `/adaptive-learning/teacher/content/<pk>/update/` | EditContentPage | Used |
| DELETE | `/adaptive-learning/teacher/content/<pk>/delete/` | TeacherContentList | Used |
| GET | `/analytics/my-stats/` | ProfilePage (citizen) | Used |
| GET | `/analytics/student-dashboard/` | StudentDashboard | Used |
| GET | `/analytics/teacher-dashboard/` | TeacherDashboard | Used |
| GET | `/analytics/student-report/<id>/` | TeacherDashboard | Used |
| GET | `/analytics/system-report/` | ManagerDashboard | Used |
| GET | `/analytics/engagement-metrics/` | AdminEngagementPage | Used |
| GET | `/ml/churn/` | RetentionBanner / useMl | Used |
| GET | `/ml/notifications/` | RetentionBanner | Used |
| POST | `/ml/notifications/<id>/dismiss/` | RetentionBanner | Used |

## React routes

| Route | Role guard | Status |
|-------|------------|--------|
| `/`, `/login`, `/register` | public | Used |
| `/student/*` | student (+ placement where noted) | Used |
| `/teacher/*` | teacher/admin | Used |
| `/manager/dashboard` | admin | Used |
| `/manager/engagement` | admin | Used |
| `/profile` | authenticated | Used |
| `/student/adaptive-dashboard` | student | Used (sidebar linked) |

## Management commands (not HTTP)

| Command | Purpose |
|---------|---------|
| `train_churn_model` | Train live churn artifact |
| `seed_sample_data` | Demo fixtures |
| `seed_abandonment_dataset` | Offline ML CSV samples |
| `seed_peer_users` | Peer cohort demo users |
