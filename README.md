# Backend Deployment

The API is an independent Node.js service in this directory. Deploy this folder as its own web service; keep the frontend deployment separate.

## Local run

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and a private `JWT_SECRET`.
2. Run `npm install`.
3. Run `npm start`.
4. Check `http://localhost:5000/health`.

## Host configuration

Configure the hosting service with this directory as its root, `npm install` as the install/build command, and `npm start` as the start command. The host supplies `PORT`.

Set these backend environment variables in the host dashboard:

- `NODE_ENV=production`
- `MONGODB_URI` to the production MongoDB connection string
- `JWT_SECRET` to a long, random private value
- `MASTER_ADMIN_SETUP_KEY` to a private key for initial master-admin registration
- `CORS_ORIGINS` to the exact frontend origin(s), comma-separated, without trailing slashes
- `FIREBASE_SERVICE_ACCOUNT_PATH` to a securely mounted Firebase service-account file

In production the service exits during startup if the database, JWT, CORS, or Firebase configuration is missing or invalid. Do not commit `.env`, database credentials, JWT secrets, or Firebase service-account files.

Register the first master admin with `POST /api/v1/masteradmin/register` and the `x-master-admin-setup-key` header. After creation, the registration endpoint refuses further registrations. Use the master-admin account to create normal admins. Admin login does not create accounts from public default credentials.

## Frontend configuration

Set `VITE_API_BASE_URL` in the frontend host to the public API URL ending in `/api/v1`, for example:

```text
https://your-api-host.example/api/v1
```

Set this variable for whichever React frontend you deploy. Rebuild/redeploy the frontend after changing it. For Flutter builds, pass the same base URL with `--dart-define=API_BASE_URL=https://your-api-host.example/api/v1`.

The backend health endpoint is `GET /health`. The API routes are under `/api/v1`.