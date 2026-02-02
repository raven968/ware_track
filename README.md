# WareTrack 📦

WareTrack is a modern Inventory and Order Management System featuring a Laravel 12 API backend and a React (Vite) frontend.

## 🚀 Technology Stack

### Backend
- **Framework:** Laravel 12
- **Authentication:** Laravel Sanctum (Token-based)
- **Database:** PostgreSQL
- **Key Patterns:** Service Layer, Form Requests, DTOs (via Request validation), Route Attributes.
- **Localization:** `en` and `es` support via `lang/` files.

### Frontend (`/client`)
- **Framework:** React 19 + Vite
- **Language:** JavaScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn UI (Radix Primitives)
- **State/Data:** Axios (Centralized instance), React Router DOM.
- **Localization:** `react-i18next` (`en` / `es`).

---

## 🛠️ Installation

### Prerequisites
- PHP 8.2+
- Composer
- Node.js v18+ (Recommended v20)
- pnpm (Preferred) or npm
- PostgreSQL

### 1. Backend Setup

```bash
# Clone the repository
git clone <repo-url>
cd ware_track

# Install PHP dependencies
composer install

# Environment Setup
cp .env.example .env
# Configure your database credentials in .env

# Generate Key
php artisan key:generate

# Run Migrations
php artisan migrate

# Start Server
php artisan serve
# Runs on http://localhost:8000
```

### 2. Frontend Setup

```bash
cd client

# Install dependencies (using pnpm is recommended)
pnpm install

# Start Development Server
pnpm dev
# Runs on http://localhost:5173
```

> **Note:** The frontend is configured to proxy API requests to `http://localhost:8000`. Ensure the backend is running.

---

## 🌍 Localization

Both Backend and Frontend support English (default) and Spanish.

- **Backend:** Send `Accept-Language: es` header or use `SetUserLocale` middleware based on user preference.
- **Frontend:** Use the Language Switcher in the UI. Translations stored in `client/src/locales/`.

## 🔑 Authentication

- **Login:** `/login` (Frontend) -> `/api/v1/auth/login` (Backend).
- **Register:** `/api/v1/auth/register`.
- **Protected Routes:** All API endpoints under `/api/v1/*` (except auth) generally require a Bearer Token.

## 📦 Key Features

- **Product Management:** Create, Update, Delete products with Price Lists.
- **Stock Control:** Real-time inventory tracking per Warehouse.
- **Orders:** Atomic order creation with stock validation and deduction.
- **Price Lists:** Dynamic pricing based on assigned lists (Retail, Wholesale, etc.).
- **Customers:** Customer management linked to users.

---

## 🤝 Contribution

1. Create a feature branch (`git checkout -b feature/amazing-feature`).
2. Commit your changes (`git commit -m 'Add some amazing feature'`).
3. Push to the branch (`git push origin feature/amazing-feature`).
4. Open a Pull Request.

## 📄 License

[MIT](https://opensource.org/licenses/MIT)
