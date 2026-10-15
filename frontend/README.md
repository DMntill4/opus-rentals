# OPUS RENTALS — FRONTEND CLIENT DOCUMENTATION

Modern, reactive, and decoupled user interface engineered with **Vite 8.3**, **Vanilla JavaScript (ES6 Modules)**, and **Tailwind CSS 3.4**.

---

## 1. ARCHITECTURE & DESIGN FOUNDATIONS

- **Zero Framework Footprint**: Built with standard ECMAScript modules and native browser APIs without heavy runtime overhead from React or Vue, guaranteeing sub-100ms load times and low memory consumption.
- **Enterprise Industrial Aesthetic**: Tailored color palette using Deep Navy (`#132e4f`), Construction Amber (`#f59e0b`), and Emerald Financial Green, complemented by clean glassmorphism accents and micro-animations.
- **Modern Typography**: Inter and Outfit loaded via Google Fonts for maximum legibility in complex technical datasheets.
- **Stateless JWT Security**: Automated token persistence in browser `localStorage`, with transparent `Authorization: Bearer <token>` header injection on all API requests.
- **Role-Based Views (RBAC)**:
  - **Client (`ROLE_CLIENT`, `ROLE_CLIENTE`)**: Live tool catalog with real-time search, price range filtering, category selection, rental modal with date validation, instant checkout gateway, clean PDF/HTML printable invoice viewer, and transaction history.
  - **Provider (`ROLE_PROVIDER`, `ROLE_PROVEEDOR`)**: Operational dashboard featuring 4 business KPIs (Monthly Revenue, Active Fleet Utilization, Pending Confirmations, Fleet Maintenance), inventory management with technical specification cards, and return inspection workflow with damage reports.
  - **Administrator (`ROLE_ADMIN`)**: System-wide oversight, provider corporate verification, account status controls, and global rental logs.

---

## 2. TECHNICAL SPECIFICATIONS & DEPENDENCIES

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `vite` | ^8.3.0 | Next-generation frontend tooling and ESM dev server |
| `tailwindcss` | ^3.4.17 | Utility-first CSS framework |
| `postcss` | ^8.5.30 | Tool for transforming styles with JS plugins |
| `autoprefixer` | ^10.6.1 | PostCSS plugin to parse CSS and add vendor prefixes |
| `lucide` | ^1.56.0 | Modern SVG icon library |
| `preline` | ^2.7.0 | Component library for Tailwind CSS |

---

## 3. LOCAL DEVELOPMENT INSTRUCTIONS

### Prerequisites
- Node.js 18.x or 20.x LTS
- npm 9.x or 10.x

### Installation
```bash
cd frontend
npm install
```

### Launch Development Server
```bash
npm run dev
```
The application will be accessible at:
`http://localhost:5173/`

### Build for Production
```bash
npm run build
```
Generates a minified and optimized production build in the `dist/` directory.

---

## 4. DEMO CREDENTIALS

The login modal contains one-click demo access buttons configured for system exploration:

| Profile | Username | Password | Role Key |
| :--- | :--- | :--- | :--- |
| Administrator | `admin_principal` | `Password123*` | `ROLE_ADMIN` |
| Machinery Provider | `prov_maquinaria_bog` | `Password123*` | `ROLE_PROVIDER` |
| Client / Contractor | `cli_constructora_col` | `Password123*` | `ROLE_CLIENT` |
