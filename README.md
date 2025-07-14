# 📚 Library Management System (Frontend)

A full-featured web frontend built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Redux Toolkit**, and **RTK Query**. It integrates with a [Frappe](https://frappeframework.com/) backend API to manage library operations including user authentication, books, members, loans, and reservations.

---

## 🚀 Tech Stack

- **React** + **Vite** — Fast modern web app scaffold
- **TypeScript** — Type safety across the codebase
- **Tailwind CSS** — Utility-first styling
- **Redux Toolkit (RTK)** — State management
- **RTK Query** — Data fetching & caching
- **Lucide React** — Icon set
- **Frappe** — Backend RESTful API provider

---

## 📁 Project Structure
src/
├── components/ # Reusable UI components (cards, inputs, loaders, etc.)
├── pages/ # Feature-specific pages (MyLoans, Reservations, etc.)
├── store/ # Redux Toolkit store & API services
├── types/ # Shared TypeScript types
├── assets/ # Images, icons, and other static assets
└── App.tsx # Main application shell

---

##  Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/library-management.git
cd library-management

```

## 2. Install Dependencies

```bash
npm install 
```
## 3. Configure Environment

## 4. Run the Dev Server

```bash
npm run dev
```

## Features Implemented

###  Authentication
- Login, logout, register  
- Token-based auth (access + refresh tokens)

### 📚 Book Management
- View available books  
- Create, update, delete (admin)

### 👤 Member Management
- Register members  
- View and manage members (admin)

### 📘 Loans
- Request loan (members)  
- Admin loan issuing & returning  
- Overdue tracking

### 🔄 Renewals
- Renew active loans before due

### 📌 Reservations
- Reserve books when unavailable  
- Cancel reservations  
- Queue with priority support

### 📊 Reports
- Books on loan  
- Overdue books  
- Loan history

## 🧪 Testing

Currently, no automated testing is configured.

You can test manually by:
- Logging in with valid credentials  
- Making loan/reservation requests  
- Checking status updates on the UI  

---

##  Architectural Decisions

- **Redux Toolkit & RTK Query**: Centralized store, standardized API layer, and caching  
- **Tailwind CSS**: Rapid and consistent styling with responsive design  
- **Lucide React**: Clean and lightweight icons  
- **Frappe as Backend**: Leveraged Frappe REST API endpoints to speed up development  

---

##  Shortcuts & Trade-offs

- Error messages are basic — needs better UX  
- Validation is minimal on some forms  
- No unit/integration tests (yet)  
- Auth tokens are stored in `localStorage` — could be enhanced with `httpOnly` cookies  

---

##  Production Build

```bash
npm build
```

## 👤 Author

**Ephrem.H**  
- Full-Stack Developer 
---

## 🔗 GitHub

[https://github.com/EphriamHab](https://github.com/EphriamHab/library-management.git)

---

## 🧾 License

This project is open source and available under the **MIT License**.
