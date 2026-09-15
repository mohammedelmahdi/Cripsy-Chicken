# Cripsy Chicken POS

Commercial-grade, offline-capable, and multi-restaurant-ready Restaurant POS (Point of Sale) system built for **Cripsy Chicken**. Designed to run on a Windows touchscreen terminal with receipt printer peripherals, and eventually deployable to Hostinger using a Laravel/PHP backend and MySQL/MariaDB database.

---

## 🎨 Visual Source of Truth (Branding Tokens)

Directly modeled from the brand guidelines:
- **Cream White (`#FFF7EE`)**: Primary workspace background to deliver a warm, clean, glare-free aesthetic suitable for long cashier shifts.
- **Crispy Orange (`#E54B2A`)**: Brand logo, primary CTA buttons, important headings, and key brand visual triggers.
- **Golden Crunch (`#F2B21B`)**: Accent highlights, warning/alert notifications, and the iconic branding crown details.
- **Dark Cocoa (`#3E2A22`)**: Maximum contrast typography, secondary details, tabular headings, and receipt outlines.

---

## 🚀 Approved Architecture

### Frontend (React SPA)
- **Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS with custom branding color presets.
- **Routing**: `react-router-dom` with role-aware protection guards.
- **Persistence**: IndexedDB database (`cripsy_pos_local`) with an outbound synchronization queue pattern.
- **Localization**: Native Arabic (RTL) and English (LTR) switching without magic strings or hard-coded UI variables.

### Backend (Future Phase 1+)
- **Engine**: Laravel (PHP REST API).
- **Relational Database**: MySQL / MariaDB (targeted for Hostinger hosting environment).
- **Sync Integrity**: Outbound queues mapping UUIDs to prevent primary key collisions when transitioning back from offline states.

---

## 🛠️ Current Development Stage: Phase 0

Phase 0 sets up a secure, strict, and fully typed foundation for future expansions.

### Implemented Foundational Modules
1. **Centralized Types (`src/types/index.ts`)**: Defines role mappings (`ADMIN`, `MANAGER`, `CASHIER`, `KITCHEN`), payment mechanisms, product categories, and receipt configurations.
2. **Branding Configurations (`src/constants/config.ts`)**: Tailors brand colors, paper tape specifications (e.g., 80mm), and localization dictionaries.
3. **Arabic/English Localization Context (`src/i18n/LanguageContext.tsx`)**: Controls HTML layout direction attributes dynamically (`dir="rtl"` vs `dir="ltr"`).
4. **REST API Client Wrapper (`src/api/client.ts`)**: Provides error interceptors, offline network-loss detection, and pre-wired service boundaries.
5. **IndexedDB Engine (`src/db/localDb.ts`)**: Provisions local browser object stores for products, categories, offline orders, and sync queues with full transactional promise wraps.
6. **Role Guard Routes (`src/App.tsx`)**: Custom security layer restricting views based on active staff roles.
7. **Premium Application Layouts & Screens**:
   - Touchscreen PIN Entry Login Pad.
   - Interactive POS Screen with DA (Algerian Dinar) menus, cart adjustments, and real-time black-and-white thermal printer simulations.
   - Live Tables Map grid with dirty/clean/occupied indicators.
   - Historical sales lists with receipt reprint commands.
   - Online Orders accept/reject drawer (linked to active badges).
   - Structured inventories, expense registers, and security audits.

---

## 🗝️ Local PIN codes for Testing

Punches correspond to designated security profiles during Phase 0 local review:
- **`1234`** - Cashier (Karim)
- **`9999`** - Restaurant Manager (Amine)
- **`0000`** - System Administrator (Sofia)
- **`5555`** - Kitchen Chef (Yacine)

---

## ⚙️ Environment Variables

A `.env` template is provided in `.env.example`. Set the following inside your local environment:
```env
# URL for the hosted web applet
APP_URL="http://localhost:3000"

# Target REST endpoint for the Laravel server
VITE_API_URL="http://my-hostinger-laravel-backend.com/api"
```

---

## 🚀 Recommended Next Phase: Phase 1 (Database & API integration)

1. Review and deploy the Laravel schema structure on MySQL (tables: `orders`, `users`, `products`, `modifier_groups`, etc.).
2. Hook up the API client services directly to the Hostinger Laravel backend.
3. Implement local sync triggers to automatically dispatch pending IndexedDB queues (`sync_queue`) upon reconnection.
