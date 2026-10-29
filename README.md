# Car Invoicing

Car Invoicing is a full-stack web application for creating, managing, and
sharing professional vehicle invoices. Users can enter invoice details,
extract data from an uploaded ticket with OCR, customize reusable invoice
templates, preview the result, and export or send the finished invoice.

## What it includes

- Email/password authentication and Google sign-in
- Guided car-invoice creation and invoice history
- OCR analysis for uploaded ticket images or documents
- Reusable invoice templates with a rich-text editor
- Invoice preview and PDF generation in the browser
- Customer/CRM management
- Light, dark, and system theme modes
- Cloudinary uploads for invoice assets

## Application flow

1. Register or sign in at `/register` or `/login`.
2. Open **Upload invoice** from the dashboard and enter or upload the
   vehicle/customer information.
3. Choose an existing template or create a new one.
4. Edit and preview the invoice.
5. Save it, then download or send it from the **Send** screen.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, React Router, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Authentication | JWT, bcrypt, Google OAuth |
| Documents | `@react-pdf/renderer`, `jspdf`, `pdf-lib` |
| OCR | Tesseract.js, Mindee, Google Document AI |
| Storage and email | Cloudinary, Nodemailer |
| Deployment | Vercel-compatible client and API |

## Repository structure

```text
.
├── client/                 # React application
│   ├── public/             # Static assets and PDF worker files
│   └── src/
│       ├── components/     # Auth, dashboard, invoice, CRM, and template UI
│       └── utils/          # API and Axios helpers
├── server/                 # Express API
│   ├── api/server.js       # API entry point and route registration
│   ├── controllers/        # Request handlers
│   ├── models/             # Mongoose models
│   ├── routes/             # Auth, user, invoice, template, and OCR routes
│   └── services/           # External OCR and Google integrations
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB database (local or MongoDB Atlas)
- Cloudinary credentials for image uploads
- Google OAuth credentials if Google sign-in is enabled

## Local setup

### 1. Install dependencies

```bash
git clone https://github.com/thisaldil/Car-Invoicing.git
cd Car-Invoicing

cd server
npm install

cd ../client
npm install
```

### 2. Configure environment variables

Create `server/.env` and `client/.env`. Do not commit either file.

The client uses:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

The server uses the same client-facing integration keys and any credentials
required by the database, authentication, OCR, email, and storage services.
Use the names read by the server source and keep private keys, API secrets,
database URLs, and OAuth secrets on the server only.

### 3. Start the API

```bash
cd server
npm start
```

The API is served on the port configured by the server environment. The
default local frontend proxy targets `http://localhost:5000`, so configure the
API to use port `5000` for the standard local setup.

Useful checks:

```text
GET /
GET /health
```

`/health` returns `{ "ok": true }` when the API is available.

### 4. Start the client

In a second terminal:

```bash
cd client
npm start
```

Open [http://localhost:3000](http://localhost:3000). The client development
server proxies API requests to the local server.

## API route groups

The API is mounted from `server/api/server.js`:

| Prefix | Purpose |
| --- | --- |
| `/auth` | Google token and Google registration flows |
| `/user` | Registration, login, current-user, and user details |
| `/template` | Create, list, update, and delete invoice templates |
| `/invoice` | Create, read, list, recent, and delete invoices |
| `/ocr` | Authenticated ticket analysis via `POST /ocr/analyze` |
| `/health` | Service health check |

Most invoice, template, OCR, and current-user operations require the
authentication token produced during sign-in. See the route files in
[`server/routes`](./server/routes) for request bodies and authorization
requirements.

## Available scripts

### Client

```bash
npm start       # Start the React development server
npm run build   # Create a production build
npm test        # Run the React test runner
```

### Server

```bash
npm start       # Start the API with nodemon
```

## Deployment

### Client

Build the client with `npm run build` from `client/` and deploy the resulting
`client/build` directory to a static host such as Vercel. Add the
`REACT_APP_*` variables in the hosting provider's environment settings.

### API

Deploy `server/` using the included [`vercel.json`](./server/vercel.json), or
run the Express API on a Node.js host. Configure MongoDB and all private
integration credentials in the host's server-side environment settings.

For production, update the API CORS allow-list in
[`server/api/server.js`](./server/api/server.js) if the client is served from a
new domain.

## Security notes

- Never commit `.env` files, Google credentials, Cloudinary secrets, or
  service-account JSON files.
- Keep private API credentials in the server environment only.
- Restrict MongoDB and Cloudinary access to the deployed services where
  possible.
- Use HTTPS for deployed client and API URLs.

## Contributing

1. Create a focused branch.
2. Make the smallest change that addresses the issue.
3. Run the relevant client build or tests.
4. Open a pull request with reproduction steps and validation details.

## License

No license file is currently included in this repository. Add a license before
redistributing the project.
