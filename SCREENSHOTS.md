# 📸 Screenshots & UI Preview

Deskripsi visual dari setiap halaman aplikasi Student Productivity Hub.

## 🎨 Design System

### Color Palette:
- **Primary**: Purple (#8b5cf6) - Sidebar active, buttons
- **Secondary**: Indigo (#667eea) - Gradients, accents
- **Success**: Green (#10b981) - Completed items
- **Warning**: Orange (#f59e0b) - Medium priority
- **Danger**: Red (#ef4444) - Urgent items
- **Info**: Blue (#3b82f6) - Information

### Typography:
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, 24-32px
- **Body**: Regular, 14-16px
- **Small**: 12-14px

### Effects:
- **Glassmorphism**: backdrop-blur with transparency
- **Gradients**: Smooth color transitions
- **Shadows**: Soft, layered shadows
- **Animations**: Smooth transitions and hover effects

---

## 📱 Pages Overview

### 1. Dashboard
**Layout**: Grid layout dengan cards dan charts

**Sections**:
- **Header**: 
  - Title "Dashboard"
  - Current date
  - Productivity score card (large, right side)

- **Stats Grid** (4 cards):
  - Tugas Hari Ini: Green gradient, checkmark icon
  - Pomodoro: Blue gradient, clock icon
  - Tidur Terakhir: Purple gradient, moon icon
  - Kebiasaan: Yellow gradient, zap icon

- **Charts Row** (2 charts):
  - Left: Bar chart "Aktivitas 7 Hari Terakhir"
  - Right: Pie chart "Tugas per Kategori"

- **Bottom Row** (2 sections):
  - Left: "Tugas Mendesak" - List with priority badges
  - Right: "Target Aktif" - Progress bars

**Colors**: 
- Background: Purple-indigo gradient
- Cards: White/10 with blur
- Charts: Colorful bars and lines

---

### 2. Manajemen Tugas
**Layout**: List view dengan filters

**Sections**:
- **Header**:
  - Title "Manajemen Tugas"
  - "Tambah Tugas" button (white, right side)

- **Stats Row** (4 mini cards):
  - Total Tugas
  - Aktif (blue)
  - Selesai (green)
  - Mendesak (red)

- **Filters Bar**:
  - Search input with icon
  - Category dropdown
  - Priority dropdown
  - Status dropdown

- **Task List**:
  - Each task card shows:
    - Checkbox (circle/check)
    - Title (bold)
    - Description
    - Category badge (colored)
    - Priority badge (colored)
    - Due date with calendar icon
    - Estimated time
    - Edit & Delete buttons

**Modal**:
- Large centered modal
- Form with all task fields
- Two buttons: Cancel (transparent) & Save (white)

---

### 3. Pelacak Tidur
**Layout**: Stats + Charts + List

**Sections**:
- **Header**:
  - Title "Pelacak Tidur"
  - "Catat Tidur" button

- **Stats Row** (4 gradient cards):
  - Rata-rata Durasi (purple)
  - Kualitas Rata-rata (blue)
  - Target Tercapai (green)
  - Total Malam (orange)

- **Charts Row**:
  - Left: Line chart durasi 14 hari
  - Right: Bar chart distribusi kualitas

- **Sleep Records**:
  - List of sleep entries
  - Each shows: date, time range, duration, quality, interruptions
  - Color-coded quality text

**Modal**:
- Form with date, times, quality, interruptions, notes
- Time inputs for bed/wake time

---

### 4. Pomodoro Timer
**Layout**: 2 columns (timer + stats)

**Sections**:
- **Left Column** (larger):
  - Type selector (3 buttons): Fokus, Istirahat Pendek, Panjang
  - Circular timer:
    - SVG circle progress
    - Large time display (center)
    - Type label
  - Control buttons: Start/Pause (large white) & Reset
  - Session dots indicator

- **Right Column** (stats cards):
  - Sesi Hari Ini (green)
  - Waktu Fokus (blue)
  - Streak (purple)
  - Tips box (white/10)

- **Bottom**:
  - Recent sessions grid (3 columns)
  - Each shows: type badge, status, time, duration

**Colors**:
- Active timer: White circle progress
- Fokus mode: Purple accent
- Break mode: Blue accent

---

### 5. Target & Tujuan
**Layout**: Stats + Active goals + Completed

**Sections**:
- **Header**:
  - Title "Target & Tujuan"
  - "Tambah Target" button

- **Stats Row** (3 cards):
  - Total Target (blue)
  - Aktif (green)
  - Tercapai (purple)

- **Active Goals**:
  - Large cards per goal
  - Title & description
  - Category badge
  - Target date
  - Progress bar (0-100%)
  - Milestones list with checkboxes
  - Delete button

- **Completed Goals** (if any):
  - Grid layout (2 columns)
  - Green-tinted cards
  - Checkmark indicator

**Modal**:
- Form with title, description, category, date
- Milestone input with add button
- List of added milestones

---

### 6. Pelacak Kebiasaan
**Layout**: Stats + Habit cards with calendar

**Sections**:
- **Header**:
  - Title "Pelacak Kebiasaan"
  - "Tambah Kebiasaan" button

- **Stats Row** (3 cards):
  - Total Kebiasaan (orange)
  - Selesai Hari Ini (yellow)
  - Total Streak (red)

- **Habit Cards**:
  - Color dot indicator
  - Habit name & description
  - Streak info with flame icon
  - Longest streak
  - Week calendar (7 days):
    - Each day: clickable square
    - Completed: Green
    - Today: White border
    - Future: Gray
  - Delete button

**Modal**:
- Name, description, frequency
- Color picker (10 colors grid)

---

### 7. Analitik & Insights
**Layout**: Stats + Insights + Charts + Summary

**Sections**:
- **Header**: Title "Analitik & Insights"

- **Monthly Stats** (4 cards):
  - Tingkat Penyelesaian (blue)
  - Total Pomodoro (purple)
  - Rata-rata Tidur (green)
  - Target Aktif (orange)

- **Insights Box**:
  - Gradient background (indigo-purple)
  - AI-generated insights
  - Multiple insight cards

- **Charts Row**:
  - Left: Line chart produktivitas mingguan
  - Right: Bar chart performa per kategori

- **Summary Box**:
  - 4 columns with numbers
  - Total tugas, selesai, pomodoro, streak

---

### 8. Kalender
**Layout**: Calendar grid + Legend

**Sections**:
- **Header**:
  - Title "Kalender"

- **Calendar Card**:
  - Month/Year title
  - Navigation: Prev, Today, Next buttons
  - Weekday headers (Sen-Min)
  - Calendar grid (7x5/6):
    - Each cell shows:
      - Day number
      - Sleep icon (if recorded)
      - Task count badge (blue)
      - Pomodoro count badge (purple)
    - Today: White border
    - Other month: Faded

- **Legend Box**:
  - Color explanations
  - Icons meaning

---

### 9. Pengaturan
**Layout**: Form sections

**Sections**:
- **Header**: Title "Pengaturan"

- **Pomodoro Settings Card**:
  - Clock icon
  - 4 number inputs (2x2 grid)
  - Work, short break, long break, sessions

- **Sleep Settings Card**:
  - Moon icon
  - 3 inputs: target hours, bed time, wake time

- **General Settings Card**:
  - Target icon
  - Toggle switches:
    - Notifications (with bell icon)
    - Dark Mode (with moon icon)

- **Save Button**:
  - Large, right-aligned
  - White background
  - Changes to green when saved

- **Tips Box**:
  - Blue tinted
  - Bullet list of tips

---

## 🎭 UI Elements

### Buttons:
- **Primary**: White bg, purple text, shadow
- **Secondary**: White/10 bg, white text
- **Danger**: Red tinted
- **Icon**: Transparent with icon only

### Cards:
- **Glass Effect**: White/10 with backdrop-blur
- **Gradient**: Colored gradients for stats
- **Border**: White/20 subtle border
- **Shadow**: Soft layered shadows

### Inputs:
- **Text**: White/10 bg, white text, white/20 border
- **Select**: Same as text input
- **Checkbox**: Custom styled
- **Toggle**: iOS-style switch

### Badges:
- **Category**: Colored bg, white text, rounded-full
- **Priority**: Colored bg, white text, rounded-full
- **Status**: Small, colored

### Charts:
- **Colors**: Vibrant, consistent palette
- **Tooltips**: Dark bg, white text
- **Grid**: Subtle white/10
- **Animations**: Smooth transitions

---

## 📐 Responsive Design

### Desktop (1920px+):
- Full sidebar (256px)
- 3-4 columns for grids
- Large charts
- Spacious layout

### Laptop (1366px):
- Full sidebar
- 2-3 columns
- Medium charts
- Comfortable spacing

### Tablet (768px):
- Collapsible sidebar
- 2 columns
- Stacked charts
- Touch-friendly

### Mobile (375px):
- Bottom navigation
- 1 column
- Vertical charts
- Mobile-optimized

---

## ✨ Animations

### Page Transitions:
- Fade in: 0.5s ease
- Slide up: 0.5s ease-out

### Hover Effects:
- Scale: 1.05
- Opacity: 0.8-1.0
- Background: Lighten

### Loading:
- Skeleton screens
- Pulse animation
- Smooth transitions

### Interactions:
- Button press: Scale 0.95
- Card hover: Lift with shadow
- Toggle: Slide animation

---

## 🎨 Theme

### Current: Purple Gradient
- Background: Linear gradient purple to indigo
- Cards: Glassmorphism white/10
- Text: White with varying opacity
- Accents: Colorful gradients

### Future: Dark Mode
- Background: Dark gray/black
- Cards: Dark with subtle borders
- Text: White/gray
- Accents: Same colorful gradients

---

## 📱 Accessibility

- **Contrast**: WCAG AA compliant
- **Font Size**: Readable (14-16px base)
- **Touch Targets**: 44x44px minimum
- **Keyboard**: Full keyboard navigation
- **Screen Readers**: Semantic HTML

---

Aplikasi ini dirancang dengan prinsip modern UI/UX untuk pengalaman pengguna yang optimal! 🎨✨
