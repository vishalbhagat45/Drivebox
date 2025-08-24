# DriveBox

DriveBox is a cloud-based file management system similar to Google Drive, designed to allow users to upload, view, and manage files and folders with a modern, responsive interface. The application is built with **React.js** for the frontend, **Node.js + Express.js** for the backend, **PostgreSQL** for database management, and **Firebase Storage** for storing files securely. Authentication is handled using **JWT**, and passwords are securely stored using **bcrypt**.

---

## Features

- User registration and login with JWT-based authentication and secure password storage.
- "Remember Me" functionality to keep users logged in.
- Upload files and folders with drag-and-drop support.
- Folder navigation with breadcrumbs.
- Preview files such as images, PDFs, and text documents directly in the browser.
- Upload progress and success/error notifications.
- Search and filter functionality for files and folders.
- Responsive UI with dark/light mode support.

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Axios, react-router-dom  
- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL  
- **File Storage:** Firebase Storage  
- **Authentication:** JWT, bcrypt  
- **Others:** react-toastify, dotenv, CORS

---

## Installation & Setup

### Backend

1. Clone the repository:  
   ```bash
   git clone <repository_url>
   cd backend
2. Install dependencies:
   ```bash
   npm install
3. Create a .env file in the backend root directory:
   ```bash
   PORT=5000
DATABASE_URL=postgres://<username>:<password>@localhost:5432/drivebox
JWT_SECRET=<your_jwt_secret>
FIREBASE_PROJECT_ID=<firebase_project_id>
FIREBASE_CLIENT_EMAIL=<firebase_client_email>
FIREBASE_PRIVATE_KEY=<firebase_private_key>

4. Run migrations or create tables in PostgreSQL if required.
5. Start the backend server:
   ```bash
   npm run dev




