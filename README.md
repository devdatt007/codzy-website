# Codzy — Premium Web Development Agency

Codzy is a modern, high-performance web development agency website built with Node.js and Express. It features a sleek, glassmorphic design, custom authentication, and advanced SEO-optimized routing.

## 🚀 Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Backend:** [Express.js](https://expressjs.com/) for server-side logic and routing.
- **Database:** [SQLite](https://www.sqlite.org/) (via `better-sqlite3`) for user management and orders.
- **Email:** [Brevo (Sendinblue)](https://www.brevo.com/) API for transactional emails and contact forms.
- **Security:** `bcryptjs` for password hashing and `express-session` for secure user sessions.
- **Deployment:** Optimized for [Render](https://render.com/).

## ✨ Key Features

- **Clean URL Routing:** SEO-friendly paths (e.g., `/home`, `/about`, `/services`) instead of file-based extensions.
- **Dynamic UI:** Smooth scroll-reveal animations and real-time statistic counters.
- **Authentication:** Custom signup/login flow with additional Google OAuth support.
- **Admin Dashboard:** Secure panel for managing templates and tracking orders.
- **Branded Emails:** Fully configured transactional email utility using the Brevo API.
- **Responsive Design:** Premium mobile-first experience with custom-built components.

## 🛠️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd codzy-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Run the application:**
   - **Development:** `npm run dev` (with hot reloading)
   - **Production:** `npm start`

## 📦 Environment Variables

To run this project, you will need to add the following variables to your `.env` file:

| Variable | Description |
| :--- | :--- |
| `PORT` | The port the server should run on (default 3000) |
| `SESSION_SECRET` | Secret key for express-session |
| `BREVO_API_KEY` | Your Brevo API v3 key |
| `GOOGLE_CLIENT_ID` | Client ID for Google OAuth login |
| `EMAIL_USER` | The sender email configured in Brevo |
| `ADMIN_PASSWORD` | Optional: Hardcoded admin password for testing |

## 🚢 Deployment

This project is configured for automatic deployment on **Render**. Simply connect your GitHub repository, and Render will handle the builds and environment variable injections natively.

---
*Created with ❤️ by the Codzy Team.*
