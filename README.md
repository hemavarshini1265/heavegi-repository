# 🛍️ Heavegi Platforms — India's Marketplace & AI Assistant

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL--Mode-003B57.svg)](https://sqlite.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas--Ready-47A248.svg)](https://www.mongodb.com/)
[![Render](https://img.shields.io/badge/Render-Hosted-46E3B7.svg)](https://render.com/)

> **Software Development Final Assessment Project**  
> **Task Title:** Heavegi Platforms — Amazon-Inspired Indian E-Commerce Marketplace with Integrated AI Assistant, SQL Knowledge Retrieval, and Automated Support Ticketing  
> **Author / Student Name:** Hemavarshini  
> **Student Email:** hemavarshiniselvakumar@gmail.com  
> **Live Website (HTTPS):** [https://heavegi-platforms.onrender.com](https://heavegi-platforms.onrender.com)  
> **GitHub Repository:** [https://github.com/hemavarshini1265/heavegi-repository](https://github.com/hemavarshini1265/heavegi-repository)  

---

## 📑 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Deliverables & Assessment Requirements Checklist](#deliverables--assessment-requirements-checklist)
3. [System Architecture](#system-architecture)
4. [Indian E-Commerce & Amazon-Style Features](#indian-e-commerce--amazon-style-features)
5. [AI Assistant & SQL Ticketing Mechanism](#ai-assistant--sql-ticketing-mechanism)
6. [SQL Database Schema & Seed Data](#sql-database-schema--seed-data)
7. [Error Codes Directory (8 Codes)](#error-codes-directory-8-codes)
8. [Third-Party APIs with Time Limits & Fallbacks](#third-party-apis-with-time-limits--fallbacks)
9. [Custom 404 & 500 Error Pages with "Ask Assistant"](#custom-404--500-error-pages-with-ask-assistant)
10. [Health Check Dashboard & Request Logging](#health-check-dashboard--request-logging)
11. [Proposed Future Improvement](#proposed-future-improvement)
12. [Local Setup & Verification Guide](#local-setup--verification-guide)
13. [Hosting & Deployment on Render](#hosting--deployment-on-render)

---

## 1. Executive Summary

**Heavegi Platforms** is a fullstack, Amazon-inspired e-commerce marketplace tailored specifically for the Indian market. Built using **Node.js, Express, SQLite (WAL mode), and MongoDB**, it features 30 curated Indian products, prices formatted in Indian Rupees (₹), delivery address verification with 6-digit Indian PIN codes, and localized payment options (UPI, RuPay, Net Banking, Cash on Delivery).

A prominent capability of the platform is its **Integrated 24x7 AI Assistant**, embedded on every page. The assistant answers inquiries directly from the SQL database FAQs, explains 8 standard and site-specific HTTP error codes, and automatically generates support tickets in SQLite whenever an inquiry cannot be answered. Chat transcripts and customer feedback are persisted to MongoDB with zero-downtime resilient fallback caching.

---

## 2. Deliverables & Assessment Requirements Checklist

| Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| **Responsive Website with ≥ 3 Pages** | 10 Responsive HTML5/CSS3 pages: `index.html`, `products.html`, `product-detail.html`, `cart.html`, `checkout.html`, `faq.html`, `error-codes.html`, `health.html`, `404.html`, `500.html` | ✅ **Complete** |
| **Chat Widget on Every Page** | Floating Heavegi Assistant widget (`client/js/chat.js`, `client/css/chat.css`) active across all 10 pages | ✅ **Complete** |
| **≥ 10 FAQs in SQL & displayed on FAQ Page** | 10 categorized FAQs stored in SQLite `faqs` table, loaded dynamically at `/faq.html` with category filters and live search | ✅ **Complete** |
| **≥ 8 Error Codes (400, 401, 403, 404, 429, 500, 503, +1 custom)** | 8 codes stored in SQL `error_codes` table, displayed on `/error-codes.html` with title, cause, resolution, and interactive diagnostic triggers | ✅ **Complete** |
| **Custom 404 & 500 Pages with "Ask the Assistant"** | `/404.html` and `/500.html` custom styled with Amazon error motifs and direct 1-click "Ask the Assistant" buttons pre-filling diagnostic queries | ✅ **Complete** |
| **AI Assistant answering FAQ & explaining error codes** | `/api/chat` route matches error codes and FAQ queries against SQLite database, providing clear markdown explanations | ✅ **Complete** |
| **Auto-ticket creation in SQL on unknown query** | When queries fall outside knowledge base, assistant creates a row in SQLite `tickets` table and returns `#ticketId` | ✅ **Complete** |
| **Support tickets in SQL; Chat logs & Feedback in MongoDB** | Tickets in SQLite `tickets` table; Chat logs in `ChatLog` and feedback in `Feedback` MongoDB collections with in-memory resilient fallback | ✅ **Complete** |
| **API Keys in Environment Variables** | `.env` file utilized; `.env`, `*.db`, `node_modules/`, and `logs/` strictly excluded in `.gitignore` | ✅ **Complete** |
| **Request Logging & Health Check Page** | Custom logger writing to `logs/requests.log` + Morgan; Live telemetry dashboard at `/health.html` & `/api/health` | ✅ **Complete** |
| **Third-Party API with Time Limit & Fallback** | India Post Pincode API (`/api/pincode/:pincode`) with strict 3.5s timeout & offline postal cache fallback (+ OpenWeatherMap API) | ✅ **Complete** |
| **README with Live Link & Proposed Improvement** | Full documentation, architecture diagram, deployment guide, and Voice Shopping proposal | ✅ **Complete** |
| **Mobile & Custom 404 Verification** | Verified mobile viewport responsiveness and custom 404 rendering on invalid paths | ✅ **Complete** |

---

## 3. System Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                    HEAVEGI PLATFORMS ARCHITECTURE                                  |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    +------------------------------------------------------------------------------------------+    |
|    |                                CLIENT LAYER (Responsive HTML5/CSS3)                      |    |
|    |  [index.html]   [products.html]   [product-detail.html]   [cart.html]   [checkout.html]  |    |
|    |  [faq.html]     [error-codes.html]   [health.html]        [404.html]    [500.html]       |    |
|    |  --------------------------------------------------------------------------------------  |    |
|    |                    * Floating Heavegi Assistant Widget (client/js/chat.js) *             |    |
|    +----------------------------------------------+-------------------------------------------+    |
|                                                   | REST / JSON                                    |
|                                                   v                                                |
|    +------------------------------------------------------------------------------------------+    |
|    |                            APPLICATION BACKEND (Node.js & Express)                       |    |
|    |  - Express Static Middleware                                                             |    |
|    |  - Request Logger & Morgan HTTP Logging (logs/requests.log)                              |    |
|    |  - Helmet Security & Rate Limiting (300 req / 15 min)                                    |    |
|    |  - Routes: /api/products, /api/faq, /api/errorcodes, /api/tickets, /api/chat,            |    |
|    |           /api/feedback, /api/health, /api/pincode, /api/orders                          |    |
|    |  - Custom 404 Handler (serves client/404.html on web navigation)                         |    |
|    |  - Custom 500 Handler (serves client/500.html on unhandled exceptions)                    |    |
|    +----------------------+--------------------+---------------------+------------------------+    |
|                           |                    |                     |                             |
|                           v                    v                     v                             |
|       +-----------------------+  +-------------------+  +-------------------------------------+    |
|       |     SQL DATABASE      |  |    MONGODB STORE  |  |           THIRD-PARTY APIS           |    |
|       |  (SQLite 3, WAL Mode) |  | (Atlas / Fallback)|  |                                     |    |
|       |                       |  |                   |  | [India Post Pincode API]            |    |
|       | - products (30 items) |  | - ChatLog Model   |  |   * Timeout: 3,500ms                |    |
|       | - faqs (10 entries)   |  | - Feedback Model  |  |   * Fallback: Indian Metro Directory|    |
|       | - error_codes (8 rows)|  | - Fault-Tolerant  |  |                                     |    |
|       | - tickets (Auto-gen)  |  |   Memory Buffer   |  | [OpenWeatherMap API]                |    |
|       | - orders (Checkout)   |  |                   |  |   * Timeout: 5,000ms                |    |
|       | - users (Auth / Seed) |  |                   |  |   * Fallback: Weather Directory     |    |
|       +-----------------------+  +-------------------+  +-------------------------------------+    |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Indian E-Commerce & Amazon-Style Features

1. **Indian Currency & Pricing:** All 30 products are priced in Indian Rupees (`₹`), with M.R.P. strike-throughs and discount percentage tags (e.g. `25% off`).
2. **Indian Product Catalog:** Electronics (Samsung Galaxy, boAt Rockerz, Realme, Noise), Fashion (Raymond Linen, Fabindia Kurti, Biba Anarkali), Groceries (Tata Tea Gold, Aashirvaad Atta, Amul Butter, Haldiram's Bhujia), Books (Wings of Fire by Dr. A.P.J. Abdul Kalam, The Alchemist Hindi, NCERT Science), and Appliances (Prestige Cooker, Godrej Refrigerator, Bajaj Induction).
3. **Indian Delivery Address & Pincode Validation:** 6-digit Indian PIN code validation with real-time city and state resolution.
4. **Indian Payment Methods:**
   - ⚡ **UPI:** Google Pay, PhonePe, Paytm, BHIM with UPI ID input.
   - 💳 **Cards:** RuPay, Visa, Mastercard with RBI 2-Factor Authentication simulation.
   - 🏦 **Net Banking:** State Bank of India, HDFC Bank, ICICI Bank, Axis Bank, PNB, and 50+ banks.
   - 💵 **Cash on Delivery (COD):** Available for orders between ₹299 and ₹10,000 across serviceable pincodes.
5. **Amazon Theme & Look:** Dark navy header (`#131921`, `#232F3E`), Amazon orange accents (`#FF9900`, `#FEBD69`), Indian tricolor ribbon, search bar, cart badge, and order confirmation receipt.

---

## 5. AI Assistant & SQL Ticketing Mechanism

The **Heavegi Assistant** is an agentic customer support widget accessible on every page:
1. **Error Code Consultation:** When a user asks about any error code (e.g. `404`, `500`, `HEAVEGI-001`), the assistant fetches the exact explanation and actionable resolution from the SQL `error_codes` table.
2. **FAQ Knowledge Base:** Inquiries about payments, COD, refunds, order tracking, and selling are matched using SQL queries against the 10 seeded FAQs.
3. **Automated SQL Support Ticket Creation:** When a query cannot be answered from the FAQ or error code database (e.g., custom claims or damaged parcels), the assistant automatically creates a record in the SQLite `tickets` table and replies:
   > *"I couldn't find an exact answer in our FAQ or error documentation, so I have automatically raised a **Support Ticket (#1)** for you. Our Heavegi customer support team in India will review your query and assist you shortly."*
4. **MongoDB Chat Transcript & Feedback Logging:** Every user message, bot reply, session ID, ticket reference, and user feedback rating (👍 / 👎) is saved to MongoDB.

---

## 6. SQL Database Schema & Seed Data

The database schema is defined in `server/models/schema.sql` and initialized via `server/seed/seed.js`:

```sql
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  pincode_areas TEXT DEFAULT '400001,110001,600001',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS error_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resolution TEXT
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  items TEXT NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  shipping_address TEXT,
  pincode TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 7. Error Codes Directory (8 Codes)

| Code | Title | Description | Resolution |
| :--- | :--- | :--- | :--- |
| **400** | Bad Request | The server could not understand the request due to malformed syntax or missing parameters. | Check request body, query parameters, and pincode formatting. |
| **401** | Unauthorized | Authentication is required and has failed or token has expired. | Log in again or provide a valid Bearer token in Authorization header. |
| **403** | Forbidden | The server understood the request, but refuses to authorize access. | Contact support if you should have access; check user permissions. |
| **404** | Not Found | The requested resource (product, order, page) could not be found. | Verify URL or ID; use search bar to locate the active listing. |
| **429** | Too Many Requests | Rate limit threshold exceeded (300 requests per 15 minutes per IP). | Wait 15 minutes before retrying request; throttle client calls. |
| **500** | Internal Server Error | Unexpected error occurred on the Heavegi backend server. | Retry in a few minutes or click "Ask Assistant" to auto-create a support ticket. |
| **503** | Service Unavailable | The service is temporarily down for maintenance or overload. | Check `/health.html` for live service status; retry in 2–3 minutes. |
| **HEAVEGI-001** | Payment Gateway Timeout *(Site-Specific)* | The UPI/Net Banking payment gateway did not return confirmation within timeout window. | Check bank statement; refunds for unconfirmed orders are processed in 2–5 days. |

---

## 8. Third-Party APIs with Time Limits & Fallbacks

### India Post Postal Pincode API (`/api/pincode/:pincode`)
- **Third-Party Provider:** `https://api.postalpincode.in/pincode/{pincode}`
- **Time Limit / Timeout:** **3,500 ms** (enforced using `axios.get(url, { timeout: 3500 })`)
- **Fallback Strategy:** When the external government API exceeds 3.5s or fails, the server immediately activates the **Heavegi Indian Pincode Directory Cache** (covering Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad, Jaipur, etc.) and tags the response as `source: 'fallback_cache'`.

### OpenWeatherMap Weather API (`/api/weather?city=Mumbai`)
- **Third-Party Provider:** `https://api.openweathermap.org/data/2.5/weather`
- **Time Limit / Timeout:** **5,000 ms**
- **Fallback Strategy:** Instant local weather metrics for 8 Indian metropolitan zones when the external weather provider is unreachable.

---

## 9. Custom 404 & 500 Error Pages with "Ask Assistant"

- **Custom 404 (`client/404.html`):** Displayed whenever a user visits an incorrect or broken URL. Features Amazon-inspired illustration, product search bar, quick links, and a prominent button:
  `[💬 Ask the Heavegi Assistant]` — automatically opens the chat widget with the query: *"I reached a 404 Not Found error page on URL: [path]. Can you help me find what I need?"*
- **Custom 500 (`client/500.html`):** Triggered on server exceptions (testable via `/simulate-500`). Features incident details, retry button, and:
  `[💬 Ask the Assistant / Report Issue]` — automatically opens the assistant and files a support ticket in SQLite!

---

## 10. Health Check Dashboard & Request Logging

- **Health Check Page (`/health.html` & `/api/health`):** Real-time monitoring of Node.js server uptime, SQLite database status, MongoDB connection status, and third-party API latency. Includes an interactive live Pincode diagnostic tester.
- **Request Logging (`server/middleware/logger.js`):** Every HTTP request is appended to `logs/requests.log` with timestamp, HTTP method, route, status code, response time in ms, and client IP address.

---

## 11. Proposed Future Improvement

### 🎙️ AI-Powered Multilingual Voice Shopping Assistant in Regional Indian Languages
**Proposed Enhancement:** Integrate the **Web Speech Recognition API** and **Gemini Multimodal Live Voice API** into the Heavegi Assistant to enable end-to-end voice shopping in **Hindi, Tamil, Telugu, Bengali, Marathi, and Kannada**.

**Why it adds value to Heavegi:**
1. **Accessibility for Bharat Users:** Over 60% of new internet users in Tier 2 and Tier 3 Indian towns prefer speaking over typing. A shopper can speak in Tamil (*"1000 ரூபாய்க்குள் நல்ல புளூடூத் ஹெட்போன் காட்டு"*) or Hindi (*"₹2000 ke andar best smartphone dikhao"*).
2. **Zero-Friction Voice Checkout:** The assistant can transcribe voice input, parse price constraints, filter products from the SQLite database, and automatically add items to the cart.
3. **Voice-Driven Support:** Users experiencing delivery issues can speak their issue and receive spoken explanations of error codes.

---

## 12. Local Setup & Verification Guide

### Prerequisites
- Node.js v18 or higher (tested on Node v24.21.0)
- npm v9+

### 1. Clone or Open the Repository
```bash
git clone https://github.com/hemavarshini1265/heavegi-repository.git
cd heavegi-platforms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize & Seed Database
```bash
npm run seed
```
*Seeds 30 Indian products, 10 FAQs, 8 error codes, and demo user in SQLite `heavegi.db`.*

### 4. Start the Application
```bash
npm start
```
*Application runs at [http://localhost:3000](http://localhost:3000)*

### 5. Run Automated Verification Tests
```bash
node test-direct.js
```
*Validates all 10 assessment criteria (SQL data, FAQs, Error codes, AI ticket auto-generation, custom 404/500 pages, and Pincode fallback).*

---

## 13. Hosting & Deployment on Render

This repository includes a native **Render Blueprint (`render.yaml`)** for deployment:

1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/hemavarshini1265/heavegi-repository.git
   git push -u origin main
   ```
2. In [Render Dashboard](https://dashboard.render.com/):
   - Click **New +** → **Web Service**
   - Connect your `heavegi-repository` GitHub repository.
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
3. Click **Deploy Web Service**!
4. Render will deploy the application and provide your live HTTPS address:
   `https://heavegi-platforms.onrender.com`

---

## 14. Submission Summary Sheet Details

- **Task Sheet Title:** `[Software_Development]`
- **Individual Task Title:** `Heavegi Platforms — Indian E-Commerce Marketplace with Integrated AI Assistant & Error Code Diagnostics`
- **Live Website Link (HTTPS):** `https://heavegi-platforms.onrender.com`
- **GitHub Repository Link:** `https://github.com/hemavarshini1265/heavegi-repository`
- **Candidate Name:** `Hemavarshini`
- **Candidate Email:** `hemavarshiniselvakumar@gmail.com`

---
*Developed with ❤️ in India by Hemavarshini for Software Development Final Assessment.*

