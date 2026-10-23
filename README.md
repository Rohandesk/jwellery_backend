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

Register the first master admin with `POST /api/v1/masteradmin/register` and the `x-master-admin-setup-key` header. The registration endpoint refuses further registrations while a master-admin account exists. If the account is deleted, setup-key-authorized registration can create a replacement.

Master admins must use a verified active master-admin bearer token for these account endpoints:

- `GET /api/v1/masteradmin/masteradmins/:id` retrieves the authenticated master admin's own account.
- `PATCH /api/v1/masteradmin/masteradmins/:id` updates the authenticated master admin's own email, name, mobile, or password.
- `DELETE /api/v1/masteradmin/masteradmins/:id` deletes the authenticated master admin's own account.

Master admins are not exposed through a list endpoint. The `:id` must match the authenticated master admin. Inactive or suspended master admins cannot use these endpoints.

Master admins can manage normal admins using a master-admin bearer token:

- `POST /api/v1/masteradmin/admins` creates an admin (`email`, `password`, and `mobile` are required).
- `GET /api/v1/masteradmin/admins` lists admins; `GET /api/v1/masteradmin/admins/:id` retrieves one.
- `PATCH /api/v1/masteradmin/admins/:id` updates admin fields, including `status` (`ACTIVE` or `INACTIVE`).
- `DELETE /api/v1/masteradmin/admins/:id` deletes an admin.

Normal admins default to `ACTIVE`; inactive admins cannot log in or access protected admin actions.

Each store is a Jeweller record. Master admins manage stores at `GET/POST /api/v1/masteradmin/stores` and `GET/PATCH/DELETE /api/v1/masteradmin/stores/:id`. Store creation requires `businessName`, `slug`, `gstin`, `ownerName`, `contactEmail`, and `contactMobile`; new stores start as `PENDING` and must be set to `ACTIVE` before customers or their admin can use them. Stores with assigned admins or related data cannot be deleted; suspend them instead. The public `GET /api/v1/stores` endpoint lists active stores for customers to select.

Store-specific customer endpoints and public carousel/gold/settings endpoints require `x-jeweller-id` with the selected store ID. Customers keep one login but each store has a separate cash/gold wallet and transaction history. `/api/v1/user/profile` returns the wallet for the selected store; login no longer returns one ambiguous wallet balance.

Customer sign-in requires a Firebase ID token whose verified phone number matches `mobile`. Refreshing a customer token requires that customer's current Bearer token; a client-supplied user ID cannot be used to obtain another account's token. Suspended customers cannot use protected customer endpoints.

Wallet deposits and gateway gold purchases are disabled until a payment gateway verification flow is implemented. The API must not credit wallet cash or gold based only on a client request.

Notification read state is tracked per customer so marking a broadcast notification read does not change its status for other customers.

Store admins and active master admins can activate/deactivate a customer's access to the selected store with `PATCH /api/v1/admin/users/:id/status` and body `{ "status": "ACTIVE" }` or `{ "status": "INACTIVE" }`. This only affects that customer's access to that store; access and balances at other stores are unchanged.

When creating an admin at `POST /api/v1/masteradmin/admins`, master admins must provide `jewellerId`; each store can have only one admin. A normal admin is always restricted to their assigned active store, regardless of any store ID sent by the client. An active master admin can act on any store by providing that store's ID in `x-jeweller-id` to admin operations. This includes dashboard stats, gold price and theme updates, notifications, customer listing, and carousel management. `GET /api/v1/carousels/manage` returns all carousel items, including disabled ones, for the selected store; public carousel reads return active items only.

Before deploying these schema changes, set `MONGODB_URI` and run `node scripts/migrateStoreIndexes.js`. This updates wallet/settings indexes, enforces one admin per store, and enforces one customer membership per store. It does not assign existing records to stores; legacy records without a store ID remain unassigned and are not returned by store-scoped APIs. Existing admins need a store assignment before they can log in.

## Frontend configuration

Set `VITE_API_BASE_URL` in the frontend host to the public API URL ending in `/api/v1`, for example:

```text
https://your-api-host.example/api/v1
```

Set this variable for whichever React frontend you deploy. Rebuild/redeploy the frontend after changing it. For Flutter builds, pass the same base URL with `--dart-define=API_BASE_URL=https://your-api-host.example/api/v1`.

The backend health endpoint is `GET /health`. The API routes are under `/api/v1`.