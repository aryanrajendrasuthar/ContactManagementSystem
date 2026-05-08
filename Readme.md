# Contact Management System

A full-stack CRM-style contact manager with authentication, rich contact profiles, groups, CSV import/export, and a polished React UI.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)

---

## Features

- **JWT Authentication** — Register, login, and protected routes with 7-day tokens
- **Contact CRUD** — Create, read, update, and delete contacts with avatar photo upload
- **Rich Profiles** — Email, phone, company, address, social links (LinkedIn, Twitter, GitHub, website), tags, and notes
- **Full-text Search** — MongoDB text index with weighted scoring; falls back to regex for short terms
- **Groups / Labels** — Color-coded groups with contact counts; assign contacts to groups
- **Favorites** — Toggle favorites; pinned favorites strip at the top of the contact list
- **Grid & List Views** — Toggle between card grid and compact list view
- **CSV Export** — Download all contacts as a CSV file
- **CSV Import** — Drag-and-drop CSV import with browser-side preview before committing
- **Detail Panel** — Slide-in right panel with full contact info and quick actions
- **Responsive UI** — Mobile-friendly layout with collapsing sidebar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router v6 |
| Styling | Pure CSS with custom properties (no CSS framework) |
| State | React Context + hooks |
| HTTP Client | Axios with request/response interceptors |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File Upload | Multer (disk storage) |
| CSV Export | csv-stringify |
| CSV Import | csv-parse |
| Validation | express-validator |
| Icons | lucide-react |
| Toasts | react-hot-toast |

---

## Project Structure

```
contact-management-system/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register, login, getMe
│   │   ├── contactController.js # CRUD, search, export, import
│   │   └── groupController.js  # Group CRUD with contact counts
│   ├── middleware/
│   │   ├── auth.js             # JWT protect middleware
│   │   └── upload.js           # Multer (avatar + CSV configs)
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt hooks
│   │   ├── Contact.js          # Contact schema with text index
│   │   └── Group.js            # Group schema with color validation
│   ├── routes/
│   │   ├── auth.js
│   │   ├── contacts.js
│   │   └── groups.js
│   ├── uploads/                # Uploaded avatars (gitignored)
│   ├── .env.example
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── Avatar.tsx
        │   ├── ContactCard.tsx  # Grid card
        │   ├── ContactForm.tsx  # Create/edit modal
        │   ├── ContactRow.tsx   # List row
        │   ├── ConfirmDialog.tsx
        │   ├── DetailPanel.tsx  # Slide-in detail view
        │   ├── GroupModal.tsx
        │   ├── ImportModal.tsx  # CSV drag-and-drop import
        │   └── Sidebar.tsx
        ├── hooks/
        │   ├── AuthProvider.tsx
        │   ├── useAuth.ts
        │   └── useDebounce.ts
        ├── pages/
        │   ├── ContactsPage.tsx # Main page
        │   ├── LoginPage.tsx
        │   └── RegisterPage.tsx
        ├── services/
        │   └── api.ts           # Axios instance + API calls
        ├── types/
        │   └── index.ts
        ├── App.tsx              # Router + protected routes
        └── main.tsx
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Clone the repository

```bash
git clone <repo-url>
cd contact-management-system
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET
npm run dev
```

The API server starts on **http://localhost:5001**.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The React app starts on **http://localhost:5173**.

---

## Environment Variables

Create `backend/.env` (see `.env.example`):

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/contact-management
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> **Note for macOS users:** Port 5000 is occupied by AirPlay Receiver on macOS Ventura and later. This project uses port 5001 by default to avoid that conflict. To use port 5000 instead, disable AirPlay Receiver in **System Settings → General → AirDrop & Handoff**.

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Contacts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/contacts` | List contacts (search, filter, paginate) |
| POST | `/api/contacts` | Create contact (multipart/form-data) |
| GET | `/api/contacts/:id` | Get single contact |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |
| PATCH | `/api/contacts/:id/favorite` | Toggle favorite |
| GET | `/api/contacts/export` | Download contacts as CSV |
| POST | `/api/contacts/import` | Import contacts from CSV |

#### Query parameters for `GET /api/contacts`

| Param | Description |
|---|---|
| `search` | Full-text search (≥3 chars) or regex (<3 chars) |
| `group` | Filter by group ID |
| `favorite` | `true` to show favorites only |
| `page` | Page number (default: 1) |
| `limit` | Results per page (default: 20, max: 100) |
| `sort` | Sort field: `firstName`, `lastName`, `email`, `company`, `createdAt` |
| `order` | `asc` or `desc` (default: `desc`) |

### Groups

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/groups` | List groups with contact counts |
| POST | `/api/groups` | Create group |
| PUT | `/api/groups/:id` | Update group |
| DELETE | `/api/groups/:id` | Delete group (unassigns contacts) |

---

## CSV Import Format

The import endpoint and UI accept CSV files with any of these column names (case-insensitive):

```
firstName, lastName, email, phone, company, tags, notes,
street, city, state, country, zip,
linkedin, twitter, github, website, isFavorite
```

Tags should be semicolon or comma separated within the cell. Rows missing `firstName` are skipped.

---

## Key Design Decisions

- **Text search fallback** — MongoDB `$text` requires ≥3 characters. Shorter queries use a `$or` regex across 5 fields to avoid silent empty results.
- **Route ordering** — `/contacts/export` is declared before `/:id` so Express doesn't interpret "export" as a contact ID.
- **Group deletion** — Deleting a group sets `groupId: null` on all its contacts rather than cascading deletes, preserving contact data.
- **Separate upload configs** — Avatar uploads (images only, 5 MB) and CSV imports use separate Multer instances to enforce correct MIME type validation per endpoint.
- **FormData for contacts** — Because avatar upload uses `multipart/form-data`, nested objects (address, socialLinks) are sent as JSON strings and parsed on the server.
- **CORS allows any localhost port** — The dev CORS policy accepts any `http://localhost:*` origin so the frontend works regardless of which port Vite assigns (5173, 5174, etc.).
