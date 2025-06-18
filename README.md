# Codeforces Tracker 📊

A full-stack application to manage and monitor Codeforces profiles for students. This tool allows administrators to add, update, sync, and view student statistics from Codeforces, making it ideal for educators, mentors, or institutions tracking competitive programming progress.

🌐 [GitHub Repository](https://github.com/himanshu01010/codeforces_tracker)

## 📺 Demo Video

[Watch the demo on Google Drive](https://drive.google.com/file/d/1eDFHABKNQ6hTVWdmIXXs1zu0BW0AzutK/view?usp=sharing)

## 🚀 Features

- 🔍 View a searchable, sortable table of all students.
- ➕ Add, edit, or delete student records.
- ⚙️ Sync individual or all student data with Codeforces API.
- 📈 View individual student profiles and rating history.
- 📤 Export all data to CSV.
- 🌙 Toggle between light/dark mode (persists via `localStorage`).
- ⚙️ Manage global app settings via a simple interface.

---

## 🛠️ Tech Stack

### Backend (Node.js + Express)
- RESTful API design
- Controllers for Students, Syncing, and Settings
- CSV download support
- Codeforces API integration for real-time stats

### Frontend (React.js + Tailwind CSS)
- React Router for navigation
- Lucide icons and hot-toast for UI feedback
- Component-based architecture
- Pagination, debounced search, and sorting
- Dark mode toggle support


---

## 🧪 API Endpoints

### Students
- `GET /api/students` - Fetch all students
- `GET /api/students/:id` - Get a single student
- `POST /api/students` - Create a new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/:id/profile` - Get student Codeforces profile
- `GET /api/students/:id/stats` - Get student Codeforces rating history
- `GET /api/students/download/csv` - Export all students to CSV

### Sync
- `POST /api/sync/student/:id` - Sync a single student
- `POST /api/sync/all` - Sync all students
- `GET /api/sync/status` - Get last sync status

### Settings
- `GET /api/settings` - Retrieve app settings
- `PUT /api/settings` - Update app settings

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm start

```bash
cd frontend
npm install
npm run dev


