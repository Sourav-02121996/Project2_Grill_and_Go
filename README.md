# Grill & Go

Grill & Go is a full‑stack web application for a sandwich shop. The project pairs a modern static frontend with an Express backend that exposes APIs for menu data, order management, promotions, employee administration, and customer authentication backed by MongoDB.

## Features
- Responsive marketing site with menu, beverages, and customizable sandwich builder.
- Employee portal with admin and staff dashboards, roster management, and announcements.
- Customer accounts stored in MongoDB with secure password hashing.
- Auth‑aware cart: only signed-in customers can add items and check out.
- REST API endpoints for listings, menu, orders, employees, promotions, and customers.

## Prerequisites
- Node.js 18+ (project tested with Node 24)
- npm 9+
- MongoDB running locally (defaults to `mongodb://localhost:37017/grillandgo`)

If your database runs elsewhere, set:

```bash
export MONGODB_URI="your-mongodb-uri"
export MONGODB_DB="grillandgo"
```

These can also be placed in a `.env` file (dotenv is available if you decide to load it).

## Installation
```bash
git clone https://github.com/Sourav-02121996/Project2_Grill_and_Go.git
cd Project2_Grill_and_Go
npm install
```

## Development
Start the backend with hot reload via Nodemon:

```bash
npm run dev
```

The server listens on `http://127.0.0.1:5000` by default and serves the static frontend from the `frontend` directory. Adjust `PORT` or `HOST` in your environment if necessary (`PORT=5001 npm run dev`).

### Customer Accounts
1. Navigate to `/login`.
2. Use the **Create Account** tab to register. Successful signups are inserted into the `Customers` collection.
3. Sign in using the **Login** tab. Once authenticated, the navigation button switches to **Logout**, and cart interactions become available.

### Employee/Admin Access
Existing employee records are stored in MongoDB (`Employees` collection). Admin users are redirected to `frontend/admin/AdminDashboard.html`; other employees land on the staff dashboard.

## Production
To run the backend without Nodemon:

```bash
npm start
```

Serve the `frontend` folder through the Express static middleware (already configured) or deploy it separately with any static hosting solution while keeping the API server accessible.

## Project Structure
```
backend/
  controller/        # Route-specific controller helpers
  db/                # MongoDB client setup
  routes/            # Express routers (API + page routing)
  server.js          # Express app bootstrap
frontend/
  admin/             # Admin/staff dashboard pages
  css/, js/, images/ # Frontend assets
LICENSE
README.md
```

## Testing & Linting
- `npm run lint` – run ESLint across the project.
- `npm run lint:fix` – attempt auto-fixes.
- `npm run test:jest` – placeholder for Jest tests (add suites as needed).

## Contributing
1. Create a feature branch.
2. Commit changes with clear messages.
3. Open a pull request against `main`.

## License
Released under the [MIT License](./LICENSE).
