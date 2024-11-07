Here's a `README.md` file for your Healthcare Appointment System project:

---

# Healthcare Appointment System

## Overview
The Healthcare Appointment System is a comprehensive platform that allows patients to schedule appointments with doctors, view their upcoming and past appointments, and manage their healthcare interactions efficiently. Doctors can access their appointment schedules and patient details through a dedicated dashboard.

## Features
- **User Authentication**: Secure login and registration for both patients and doctors.
- **Appointment Management**: Patients can book, view, and cancel appointments. Doctors can view their appointment schedules and patient details.
- **Responsive Web Design**: Optimized for both desktop and mobile use.
- **JWT Authentication**: Secure user sessions with JSON Web Tokens.
- **User Dashboards**: Separate dashboards for patients and doctors to manage their respective information.
- **Dynamic Data Interaction**: Frontend pages dynamically interact with the server to fetch and display data.

## Project Structure
- **Frontend**:
  - `index.html` - Welcome page with navigation to login and registration pages.
  - `login.html` - Login page for user authentication.
  - `register.html` - Registration page for new patient sign-ups.
  - `book_appointment.html` - Page for patients to book new appointments.
  - `patient_dashboard.html` - Dashboard for patients to view and manage their appointments.
  - `doctor_dashboard.html` - Dashboard for doctors to view their appointment schedules.
  - `styles.css` - Shared stylesheet for consistent design and layout.
- **Backend**:
  - `server.js` - Node.js server with Express handling routing, JWT authentication, and database operations.

## Setup Instructions
1. **Database Setup**:
   - Import `Dump20241107.sql` into your MySQL database to create the necessary tables and data.

2. **Environment Configuration**:
   - Create a `.env` file in the root directory and add the following environment variables:
     ```
     DB_HOST=your_database_host
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     DB_NAME=your_database_name
     JWT_SECRET=your_jwt_secret_key
     PORT=3000
     ```

3. **Install Dependencies**:
   - Run `npm install` to install the required Node.js packages (e.g., `express`, `mysql2`, `jsonwebtoken`, `dotenv`, `morgan`).

4. **Run the Server**:
   - Start the server with `node server.js`. The server will run on `http://localhost:3000`.

5. **Access the Application**:
   - Visit `http://localhost:3000` in your browser to use the application.

## How to Use
- **Registration**:
  - New patients can register via the `register.html` page, filling in personal details and account credentials.
- **Login**:
  - Users log in through `login.html`. Based on the user type (patient or doctor), they are redirected to their respective dashboards.
- **Book Appointments**:
  - Patients can use `book_appointment.html` to book appointments with available doctors.
- **View Appointments**:
  - Patients and doctors can view appointments through their respective dashboards (`patient_dashboard.html` and `doctor_dashboard.html`).
- **Cancel Appointments**:
  - Patients can select and cancel appointments via their dashboard.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **Styling**: Custom CSS (`styles.css`)

## License
This project is licensed under the MIT License.

## Author
Developed by [NoobRanger69].
