```markdown
# Invoice Management System

A full-stack invoice management application with a REST API backend and React Native mobile client.

## Stack

- **Backend**: Node.js + TypeScript + Express
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Mobile client**: React Native + TypeScript (Expo)
- **Auth**: JWT (email/password)
- **Containerization**: Docker & docker-compose
- **License**: MIT

## Features

- ✅ User authentication (register/login)
- ✅ Invoice CRUD operations with line items
- ✅ Tax calculations (SGST, CGST, IGST)
- ✅ Customer management
- ✅ Role-based access control (user/admin)
- ✅ Ownership-based authorization
- ✅ React Native mobile client

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (or Docker)
- For mobile: Expo CLI and Expo Go app

### Option 1: Docker Compose (Recommended)

1. Clone the repository
2. Copy environment file:
   ```bash
   cp api/.env.example api/.env
   ```
3. Edit `api/.env` and set your JWT_SECRET (generate a strong random string)
4. Start all services:
   ```bash
   docker-compose up --build
   ```
5. The API will be available at http://localhost:4000

### Option 2: Local Development

#### Backend Setup

1. Navigate to the API directory:
   ```bash
   cd api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy and configure the environment file:
   ```bash
   cp .env.example .env
   ```
   
4. Edit `.env` and update the values:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/invoices_db
   PORT=4000
   JWT_SECRET=your-very-secure-secret-key-here
   CORS_ALLOWED_ORIGINS=http://localhost:19006
   ```

5. Ensure PostgreSQL is running and create the database:
   ```bash
   psql -U postgres -c "CREATE DATABASE invoices_db;"
   ```

6. Run migrations:
   ```bash
   npm run typeorm:run
   ```

7. (Optional) Seed default users:
   ```bash
   npm run seed
   ```
   This creates a default admin user:
   - Email: `admin@example.com`
   - Password: `admin@123`

8. Start the development server:
   ```bash
   npm run dev
   ```

9. The API will be available at http://localhost:4000

#### Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API URL in `src/config.ts`:
   ```typescript
   export const API_URL = "http://localhost:4000"; // or your backend URL
   ```

4. Start the Expo development server:
   ```bash
   npm start
   ```

5. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## Project Structure

```
.
├── api/                    # Backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── dto/            # Data transfer objects
│   │   ├── entities/       # TypeORM entities
│   │   ├── middleware/     # Express middleware
│   │   ├── migration/      # Database migrations
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript type definitions
│   ├── API.md              # API documentation
│   └── package.json
├── mobile/                 # React Native app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── navigation/     # Navigation setup
│   │   ├── screens/        # App screens
│   │   ├── services/       # API client
│   │   └── styles/         # Shared styles
│   └── package.json
├── scripts/                # Utility scripts
├── .env.example            # Environment variables template
├── docker-compose.yml      # Docker Compose configuration
└── README.md
```

## Available Scripts

### Backend (api/)

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typeorm:run` - Run migrations
- `npm run typeorm:revert` - Revert last migration

### Mobile (mobile/)

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in browser

## API Documentation

See [API.md](./api/API.md) for detailed API endpoint documentation.

Quick overview:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /invoices` - List invoices
- `POST /invoices` - Create invoice
- `GET /invoices/:id` - Get invoice
- `PUT /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice (admin only)

## Testing

```bash
# Backend
cd api
npm run lint
npm run build

# Mobile
cd mobile
npm start
```

## Security Notes

⚠️ **Important**: 
- Always set a strong, unique `JWT_SECRET` in production
- Never commit `.env` files to version control
- Use HTTPS in production
- Review and update CORS_ALLOWED_ORIGINS for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linter and build
5. Submit a pull request

## License

MIT License - see LICENSE file for details
```