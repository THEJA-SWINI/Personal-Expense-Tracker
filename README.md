# 💰 Personal Expense Tracker

A full-stack web application that helps users record, manage, search, and track their daily expenses.

## 🚀 Features

* Add new expenses
* View all recorded expenses
* Delete expenses
* Search expenses by title
* Filter expenses by category, payment method, and date
* View total expenses, highest expense, average expense, and expense count
* View expense summaries by category
* Store expense data in a MySQL database

## 🛠️ Technologies Used

**Frontend**

* HTML
* CSS
* JavaScript

**Backend**

* Node.js
* Express.js
* REST API

**Database**

* MySQL

## 📁 Project Structure

```text
personal-expense-tracker/
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .gitignore
└── README.md
```

## ⚙️ Setup and Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd personal-expense-tracker
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure the database

Create a MySQL database named `expense_tracker_db` and create the required `expenses` table.

Configure your local database credentials in the backend `.env` file. Never upload `.env` to GitHub.

### 4. Start the backend server

From the `backend` folder, run:

```bash
node server.js
```

The backend server runs at:

`http://localhost:5000`

### 5. Open the frontend

Open `frontend/index.html` in your browser. Make sure the backend server and MySQL are running.

## 🔗 API Endpoints

| Method | Endpoint                     | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| GET    | `/expenses`                  | Retrieve expenses             |
| POST   | `/expenses`                  | Add an expense                |
| DELETE | `/expenses/:id`              | Delete an expense             |
| GET    | `/expenses/summary`          | Retrieve expense statistics   |
| GET    | `/expenses/category-summary` | Retrieve category-wise totals |

## 🎯 Project Objective

The objective of this project is to build a full-stack expense management application that connects a user-friendly frontend with a Node.js backend and a MySQL database.

## 👩‍💻 Author

Developed as a full-stack development project.
