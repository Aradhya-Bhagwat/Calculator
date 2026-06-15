# 🧮 Calculator Web Application

A modern, responsive calculator web application featuring secure JWT-based user authentication, calculation history persistence, and a highly flexible database adapter. This project is configured to run on either a **MySQL** (Relational) or **MongoDB** (NoSQL) database engine with a simple toggle in your environment variables.

---

## 🛠️ Tech Stack

*   **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6)
*   **Backend**: Node.js, Express, JSON Web Tokens (JWT), bcrypt
*   **Databases Supported**:
    *   **MySQL** (via `mysql2/promise` pool)
    *   **MongoDB** (via `mongoose` ODM)

---

## 📁 Project Structure

```text
Calculator/
├── client/                 # Frontend client-side files
│   ├── Assets/             # Visual icons and assets
│   ├── auth-login.js       # Login page scripts
│   ├── auth-signup.js      # Sign-up page scripts
│   ├── index.html          # Main calculator dashboard
│   ├── login.html          # Login interface
│   ├── signup.html         # Sign-up interface
│   ├── script.js           # Calculator math and UI logic
│   └── style.css           # Premium styles and layout rules
│
└── server/                 # Backend server-side files
    ├── models/             # Database Schemas (MongoDB)
    │   ├── User.js         # Mongoose User schema
    │   └── History.js      # Mongoose History schema
    ├── .env                # Environment configuration settings
    ├── db.js               # Dynamic database adapter and connections
    ├── server.js           # Express REST API and authentication routes
    ├── package.json        # Node.js dependencies
    └── package-lock.json   # Package locks
```

---

## 🚀 Getting Started

Follow these steps to configure your local databases, configure the backend server, and launch the application.

### 1. Clone the Project
```bash
git clone https://github.com/yourusername/Calculator.git
cd Calculator
```

### 2. Configure the Backend Server
Navigate to the `server/` directory and install the necessary dependencies:
```bash
cd server
npm install
```

Create a file named `.env` in the `server/` directory:
```env
PORT=5000
JWT_SECRET=your_super_secret_session_key

# Database Toggle (Choose: mysql | mongodb)
DB_TYPE=mysql

# MySQL Settings
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=calc_db

# MongoDB Settings
MONGODB_URI=mongodb://localhost:27017/calc_db
```

---

### 3. Database Initialization

#### Option A: MySQL Server Setup
1. Open your MySQL client (CLI or Workbench) and create the database:
   ```sql
   CREATE DATABASE calc_db;
   USE calc_db;
   ```
2. Create the necessary tables by executing the following queries:
   ```sql
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       surname VARCHAR(255) NOT NULL,
       email VARCHAR(255) NOT NULL UNIQUE,
       password VARCHAR(255) NOT NULL
   );

   CREATE TABLE history (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       expression VARCHAR(255) NOT NULL,
       result VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   ```
3. Set `DB_TYPE=mysql` in your `server/.env`.

#### Option B: MongoDB Local Server Setup
1. Ensure the MongoDB service is running on your computer:
   * **Windows**: Press `Win + R`, type `services.msc`, locate `MongoDB Server`, and verify that it is running.
2. MongoDB automatically creates databases and collections upon data insertion, so no manual table initialization is required. Mongoose will structure it automatically.
3. Set `DB_TYPE=mongodb` in your `server/.env`.

---

### 4. Start the Application

#### Run the Server
From the `server/` directory, launch the Node.js backend:
```bash
node server.js
```
*   If running MySQL, the console will output: `Connected to MySQL connection pool.`
*   If running MongoDB, the console will output: `Connected to MongoDB successfully.`

#### Open the Frontend
Since the frontend consists of static files:
1. Simply open [client/login.html] in any browser, OR
2. Right-click [client/login.html] and select **Open with Live Server** in VS Code.

---

## 📊 Database Schema Comparison

Here is how the data structures match across the SQL and NoSQL configurations:

### Users
| Field | MySQL Data Type | MongoDB / Mongoose Type | Description |
| :--- | :--- | :--- | :--- |
| **ID** | `INT AUTO_INCREMENT (PK)` | `ObjectId` (automatic `_id`) | Unique user identifier |
| **Name** | `VARCHAR(255)` | `String` | First name of the user |
| **Surname** | `VARCHAR(255)` | `String` | Last name of the user |
| **Email** | `VARCHAR(255) UNIQUE` | `String` (lowercase, unique index) | Unique login email |
| **Password**| `VARCHAR(255)` | `String` | Hashed bcrypt password |

### History
| Field | MySQL Data Type | MongoDB / Mongoose Type | Description |
| :--- | :--- | :--- | :--- |
| **ID** | `INT AUTO_INCREMENT (PK)` | `ObjectId` (automatic `_id`) | Unique calculation identifier |
| **User ID** | `INT (FK)` | `ObjectId` (reference to `User`) | Reference linking calculation to user |
| **Expression**| `VARCHAR(255)` | `String` | The math expression (e.g., `5 * 2`) |
| **Result** | `VARCHAR(255)` | `String` | Calculated output (e.g., `10`) |
| **Created At**| `TIMESTAMP` | `Date` (defaults to `Date.now`) | Time stamp of the calculation |

---

## 📄 License & Credits

Built for learning databases and full-stack web integration.

**Developed by Aradhya Bhagwat**