# ExpenseWise - AI Receipt Scanner & Calendar Expense Tracker

A modern full-stack expense tracking application featuring multimodal OCR receipt scanning via Google Gemini 2.5, automated deterministic category classification, SQLite storage with Prisma ORM, and an interactive calendar-first view.

---

## Features

### 1. Multimodal OCR Receipt Scanner & AI Pipeline
- **Drag & Drop / Camera Capture**: Upload receipt photos (PNG, JPG, WEBP, or PDF).
- **Gemini 2.5 Multimodal Parsing**: Extracts store name, transaction date, line items, quantities, and prices using structured JSON output (`@google/genai` SDK).
- **Automated Categorization**: Deterministically classifies items into 7 predefined categories:
  - `Alcohol`
  - `Drinks`
  - `Food Ingredients`
  - `Sweets`
  - `Prepared Meals`
  - `Household`
  - `Other`
- **Interactive Verification Screen**:
  - Review and edit merchant name, date, and line items side-by-side with receipt preview.
  - Add/remove items and edit prices/categories.
  - Automatic total reconciliation indicator with 1-click mismatch resolution.

### 2. Interactive Calendar-First Dashboard (Main Screen)
- **Monthly Grid**:
  - Daily expenditure totals with color-coded spending tiers.
  - Category badges indicating top active spending categories that day.
  - Compact preview list of purchased items.
  - Today highlight ring.
- **Day-Detail Slide-Over Drawer**:
  - Click any date to slide open the comprehensive day breakdown.
  - View individual receipts, itemized breakdown with category chips and quantities.
  - Delete or edit receipts, or quickly add manual expenses directly for that date.

### 3. Analytics & Category Filtering
- **Category Filter Pills**: Click any category (e.g. `Alcohol` or `Sweets`) to isolate spending across the calendar.
- **Monthly Budget Progress Bar**: Set a custom monthly budget limit to track remaining balance and over-budget warnings.
- **Category Spend Distribution**: Proportional stacked bar and itemized category breakdown with dollar amounts and percentages.
- **Peak Spending Day & Daily Average**: Key spending metrics calculated dynamically.

---

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, date-fns.
- **Backend**: Next.js Route Handlers (`/api/receipts`, `/api/parse-receipt`, `/api/analytics`, `/api/seed`).
- **Database & ORM**: SQLite (`dev.db`) via Prisma ORM (`prisma/schema.prisma`).
- **AI Integration**: Google AI Studio Gemini API (`gemini-2.5-flash` / `gemini-2.5-flash-lite`) via `@google/genai`.

---

## Getting Started

### 1. Install Dependencies & Generate Database
```bash
npm install
npx prisma db push
```

### 2. Configure Google Gemini API Key
Either:
- Set `GEMINI_API_KEY="AIzaSy..."` in `.env.local`, **OR**
- Click **"Set API Key"** in the top navigation bar of the application and paste your key.

Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Demo Data
Click the **"Demo Data"** button in the top navbar to instantly seed realistic receipts for the current month!
