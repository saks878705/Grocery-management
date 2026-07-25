# Order Management Backend

This is a backend system built with Node.js and Express for managing users, products, stock, and orders. It uses PostgreSQL (Sequelize) for core data and MongoDB for notifications.

## Features

- User/Admin authentication (JWT + OAuth with Google & GitHub)
- Category & Product CRUD
- Stock management
- Order placement with transaction (ACID safe)
- Order updates (status change, cancel, reschedule, modify items)
- Notifications stored in MongoDB
- Cron job for low stock alerts (email + notification)

## Tech Stack

- Node.js
- Express.js
- PostgreSQL (Sequelize ORM)
- MongoDB (Mongoose)
- JWT Authentication
- OAuth 2.0 (Google, GitHub)
- Nodemailer (email service)
- node-cron

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd project
   npm install
2. Create a .env file in root directory and add the following:
PORT=5000

DB_NAME=your_db
DB_USER=postgres
DB_PASS=password
DB_HOST=localhost

MONGO_URI=mongodb://127.0.0.1:27017/notifications

JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
ADMIN_EMAIL=admin@email.com

3. Run the project:
    npm run dev