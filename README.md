# **Invoicing App**

A modern, full-featured invoicing and item-management web application built using **Next.js 16 (App Router), TypeScript, Material UI, Zustand, and React Query**.
This app includes company registration, authentication, item catalog management, invoice creation, PDF export, dashboards, and analytics.

---

# **Features**

## Authentication

* **Signup** – Register a company and its first user.
* **Login** – Secure login using email & password.
* JWT-based session management using **Zustand** + interceptor-based token handling.

---

## **Item Master Management**

* Item list with search, sorting, and pagination.
* Create/update items:
  * Name, description, rate, discount, image upload.
* Mobile-friendly card view.
* Delete confirmation dialog.
* Column visibility management.
* Fetch item pictures via API.

---

## **Invoice Management**

### List View

* Filter by date range: Today, Week, Month, Year, Custom.
* Search by invoice no., customer name, or amount.
* Inline mini-dashboard (metrics, trends, top items).
* Export invoices as CSV.

### Editor

* Create and edit customer + item lines.
* Realtime calculation (subtotal, tax, total).
* Add/remove invoice lines.

### Print / PDF

* Auto-fetch invoice details.
* One-click PDF generation using `jsPDF`.
* One-click all invoices csv file.

---

## **Dashboard**

Interactive charts built using **Recharts**:

* Invoice Trend (Last 12 Months)
* Monthly Invoice Count
* Top Selling Items
* Total Invoice Metrics
* Responsive with fixed chart heights (mobile-friendly)

---

# **Tech Stack**

### **Frontend**

* **Next.js 16 (App Router)**
* **React 19**
* **TypeScript**
* **Material UI (MUI 7)**
* **Recharts**
* **Zustand** – state management
* **React Query v5** – server state caching + auto refetch
* **Axios** – API client

### **Utilities**

* **jsPDF** – Invoice PDF generation
* **date-fns** – date handling
* **jwt-decode** – JWT parsing

---

# **Project Structure**

```
src/
├── app/
│   ├── (protected)/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   ├── items/
│   │   └── layout.tsx
│   ├── login/
│   ├── signup/
│   └── layout.tsx
│
├── components/
│   ├── common/
│   ├── dialog/
│   ├── InvoicePage/
│   ├── itemsPage/
│   └── protected/
│
├── hooks/
│   ├── useDashboardMetrics.ts
│   ├── useInvoicesLogic.ts
│   ├── useItemsLogic.ts
│   ├── useAuthRedirect.ts
│   └── ...
│
├── lib/
│   ├── axiosClient.ts
│   ├── authGuard.ts
│   ├── queryClient.ts
│   └── tokens.ts
│
├── providers/
│   └── AppProviders.tsx
│
├── services/
│   ├── invoice.service.ts
│   ├── item.service.ts
│   └── ...
│
├── store/
│   └── auth.store.ts
│
├── utils/
│   ├── invoicePDF.ts
│   ├── itemsSortAndFilter.ts
│   └── FormatMoney.ts
│
└── constants/
    ├── item.constant.ts

```

---

# **Scripts**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start --p 3001",
  "lint": "eslint"
}
```

---

# **Environment Variables**

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=your-backend-api-url
```

---

# **Installation & Setup**

### 1. Clone the repo

```bash
git clone https://github.com/your-repo/invoicing-app.git
cd invoicing-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup env variables

```bash
NEXT_PUBLIC_API_URL=https://test.com
```

### 4. Start development

```bash
npm run dev
```

### 5. Production build

```bash
npm run build
npm start
```

---

# **Key Hooks Overview**

### **useInvoicesLogic.jsx**

* Handles date filtering
* Search
* CRUD operations
* PDF generation
* React Query data fetching
* Top items, trend, metrics

### **useItemsLogic.jsx**

* Item CRUD
* Uploading item picture
* Sorting & filtering

### **useDashboardMetrics.jsx**

* Trend
* Metrics
* Top items
* Ready for charts

---

# **Invoice PDF Function**

* Auto-fetch invoice detail
* Generate PDF with company info
* Works on **single click**

---

# **Authentication**

* Zustand store handles user + tokens
* Protected routes using middleware-like system
* Redirect based on login state

