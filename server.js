require('dotenv').config(); // Load environment variables
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const path = require('path');
const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(morgan('dev')); // Log HTTP requests

// Create a MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('/', (_, res) => {
  res.send('Welcome to the Healthcare Appointment System API');
});
const updateStatusQuery = `
UPDATE appointments
SET Status = 'Completed'
WHERE Status = 'Scheduled' AND AppointmentDate < CURDATE()
`;
db.execute(updateStatusQuery, (err) => {
if (err) {
  console.error('Error updating appointment statuses:', err);
} else {
  console.log('Appointment statuses updated successfully');
}
});
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Serve add doctor form
app.get('/patient-doctors', authenticateToken, (req, res) => {
  const patientID = req.user.id; // Retrieve patient ID from the token

  const query = `
    SELECT DISTINCT d.DoctorID, d.FirstName, d.LastName
    FROM Appointments a
    JOIN Doctors d ON a.DoctorID = d.DoctorID
    WHERE a.PatientID = ?
  `;

  db.execute(query, [patientID], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});
// doctor-appointments endpoint
app.get('/doctor-appointments/:doctorID', authenticateToken, (req, res) => {
  const patientID = req.user.id; // Retrieve patient ID from the token
  const doctorID = req.params.doctorID;

  const query = `
    SELECT a.AppointmentID, a.AppointmentDate, a.AppointmentTime, a.Status
    FROM Appointments a
    WHERE a.PatientID = ? AND a.DoctorID = ? AND a.AppointmentDate >= CURDATE()
    ORDER BY a.AppointmentDate, a.AppointmentTime
  `;

  db.execute(query, [patientID, doctorID], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});
// Serve patient dashboard
app.get('/appointments', authenticateToken, (req, res) => {
  const patientID = req.user.id; // Retrieve patient ID from the token

  const queryUpcoming = `
    SELECT a.AppointmentID, d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName, a.AppointmentDate, a.AppointmentTime, a.Status
    FROM Appointments a
    JOIN Doctors d ON a.DoctorID = d.DoctorID
    WHERE a.PatientID = ? AND a.AppointmentDate >= CURDATE()
    ORDER BY a.AppointmentDate, a.AppointmentTime
  `;

  const queryPast = `
    SELECT a.AppointmentID, d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName, a.AppointmentDate, a.AppointmentTime, a.Status
    FROM Appointments a
    JOIN Doctors d ON a.DoctorID = d.DoctorID
    WHERE a.PatientID = ? AND a.AppointmentDate < CURDATE()
    ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
  `;

  db.execute(queryUpcoming, [patientID], (err, upcomingResults) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    db.execute(queryPast, [patientID], (err, pastResults) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      res.json({
        upcomingAppointments: upcomingResults,
        pastAppointments: pastResults
      });
    });
  });
});
// Serve book appointment form
app.get('/book-appointment', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'book_appointment.html'));
});
// Serve cancel appointment form
app.get('/cancel', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cancel_appointment.html'));
});
// User login form
app.get('/login', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
//patient dashboard
app.get('/patient-dashboard', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'patient_dashboard.html'));
});
// User registration form
app.get('/register', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
// Serve reschedule appointment form
app.get('/reschedule', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reschedule.html'));
});
// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
app.get('/doctors', authenticateToken, (_, res) => {
  const query = 'SELECT DoctorID, FirstName, LastName FROM Doctors';
  db.execute(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});
// logout endpoint
app.get('/logout', authenticateToken, (req, res) => {
  // Invalidate the token (this can be done by various means, such as maintaining a blacklist)
  res.json({ message: 'Logout successful' });
});
// User login endpoint
app.post('/login', (req, res) => {
  const { username, password, userType } = req.body;

  const query = 'SELECT * FROM UserAuth WHERE Username = ? AND UserType = ?';
  db.execute(query, [username, userType], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length > 0) {
      const user = results[0];
      if (password === user.Password) { // Use hashed passwords in production
        const token = jwt.sign(
          { id: user.LinkedID, username: user.Username, userType: user.UserType },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        res.json({ message: 'Login successful', token });
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});
// Register a new user
app.post('/register', (req, res) => {
  const { firstName, lastName, phoneNumber, email, age, gender, address, username, password, userType } = req.body;
  if (!firstName || !lastName || !phoneNumber || !email || !age || !gender || !address || !username || !password || !userType) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const checkUserQuery = 'SELECT * FROM UserAuth WHERE Username = ?';
  db.execute(checkUserQuery, [username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const insertPatientQuery = 'INSERT INTO Patients (FirstName, LastName, PhoneNumber, Email, Age, Gender, Address) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.execute(insertPatientQuery, [firstName, lastName, phoneNumber, email, age, gender, address], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const patientID = result.insertId;
      const insertUserQuery = 'INSERT INTO UserAuth (Username, Password, UserType, LinkedID) VALUES (?, ?, ?, ?)';
      db.execute(insertUserQuery, [username, password, userType, patientID], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'User registered successfully' });
      });
    });
  });
});

app.get('/doctor-appointments', authenticateToken, (req, res) => {
  const doctorID = req.user.id; // Retrieve doctor ID from the token

  const queryUpcoming = `
    SELECT a.AppointmentID, p.FirstName AS PatientFirstName, p.LastName AS PatientLastName, a.AppointmentDate, a.AppointmentTime, a.Status
    FROM Appointments a
    JOIN Patients p ON a.PatientID = p.PatientID
    WHERE a.DoctorID = ? AND a.AppointmentDate >= CURDATE()
    ORDER BY a.AppointmentDate, a.AppointmentTime
  `;

  const queryPast = `
    SELECT a.AppointmentID, p.FirstName AS PatientFirstName, p.LastName AS PatientLastName, a.AppointmentDate, a.AppointmentTime, a.Status
    FROM Appointments a
    JOIN Patients p ON a.PatientID = p.PatientID
    WHERE a.DoctorID = ? AND a.AppointmentDate < CURDATE()
    ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
  `;

  db.execute(queryUpcoming, [doctorID], (err, upcomingResults) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    db.execute(queryPast, [doctorID], (err, pastResults) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      res.json({
        upcomingAppointments: upcomingResults,
        pastAppointments: pastResults
      });
    });
  });
});
// cancel appointments
app.post('/cancel-appointments', authenticateToken, (req, res) => {
  const { appointmentIDs } = req.body;
  console.log('Received appointment IDs:', appointmentIDs); // Log the received appointment IDs
  if (!appointmentIDs || !Array.isArray(appointmentIDs) || appointmentIDs.length === 0) {
    return res.status(400).json({ error: 'Appointment IDs are required' });
  }

  // Convert the array of appointment IDs to a comma-separated string
  const appointmentIDsString = appointmentIDs.map(id => parseInt(id, 10)).join(',');

  const cancelAppointmentQuery = `UPDATE Appointments SET Status = "Cancelled" WHERE AppointmentID IN (${appointmentIDsString})`;
  db.execute(cancelAppointmentQuery, (err) => {
    if (err) {
      console.error('Database error:', err); // Log the database error
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Appointments cancelled successfully' });
  });
});

app.get('/doctor-dashboard', authenticateToken, (req, res) => {
  const doctorID = req.user.id; // Retrieve doctor ID from the token

  // Fetch doctor's name
  const queryDoctorName = "SELECT FirstName, LastName FROM Doctors WHERE DoctorID = ?";
  db.execute(queryDoctorName, [doctorID], (err, doctorResults) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (doctorResults.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctorName = doctorResults[0];

    // Fetch all appointments for the doctor
    const queryAppointments = `
      SELECT a.AppointmentID, p.FirstName, p.LastName, a.AppointmentDate, a.AppointmentTime, a.Status
      FROM Appointments a
      JOIN Patients p ON a.PatientID = p.PatientID
      WHERE a.DoctorID = ?
      ORDER BY a.AppointmentDate, a.AppointmentTime
    `;
    db.execute(queryAppointments, [doctorID], (err, appointmentResults) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      res.json({
        doctorName: `${doctorName.FirstName} ${doctorName.LastName}`,
        appointments: appointmentResults
      });
    });
  });
});
// Book an appointment
app.post('/book-appointment', authenticateToken, (req, res) => {
  const { doctorID, appointmentDate, appointmentTime } = req.body;
  const patientID = req.user.id; // Retrieve patient ID from the token

  if (!patientID || !doctorID || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const checkAvailabilityQuery = `
    SELECT * FROM Appointments
    WHERE DoctorID = ? AND AppointmentDate = ? AND AppointmentTime = ?
  `;
  db.execute(checkAvailabilityQuery, [doctorID, appointmentDate, appointmentTime], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length > 0) {
      return res.status(409).json({ error: 'The selected doctor is not available at the chosen time' });
    }

    const bookAppointmentQuery = `
      INSERT INTO Appointments (PatientID, DoctorID, AppointmentDate, AppointmentTime, Status)
      VALUES (?, ?, ?, ?, 'Scheduled')
    `;
    db.execute(bookAppointmentQuery, [patientID, doctorID, appointmentDate, appointmentTime], (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Appointment booked successfully' });
    });
  });
});
// Cancel an appointment
app.post('/cancel-appointment', authenticateToken, (req, res) => {
  const { appointmentID } = req.body;
  if (!appointmentID) {
    return res.status(400).json({ error: 'Appointment ID is required' });
  }

  const cancelAppointmentQuery = 'UPDATE Appointments SET Status = "Cancelled" WHERE AppointmentID = ?';
  db.execute(cancelAppointmentQuery, [appointmentID], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Appointment cancelled successfully' });
  });
});
// Add an appointment
app.post('/appointments', authenticateToken, (req, res) => {
  const { patientID, doctorID, appointmentDate, appointmentTime } = req.body;

  if (!patientID || !doctorID || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const checkAvailabilityQuery = `
    SELECT * FROM Appointments
    WHERE DoctorID = ? AND AppointmentDate = ? AND AppointmentTime = ?
  `;
  db.execute(checkAvailabilityQuery, [doctorID, appointmentDate, appointmentTime], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length > 0) {
      return res.status(409).json({ error: 'The selected doctor is not available at the chosen time' });
    }

    const bookAppointmentQuery = `
      INSERT INTO Appointments (PatientID, DoctorID, AppointmentDate, AppointmentTime, Status)
      VALUES (?, ?, ?, ?, 'Scheduled')
    `;
    db.execute(bookAppointmentQuery, [patientID, doctorID, appointmentDate, appointmentTime], (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Appointment booked successfully' });
    });
  });
});
// Error handling middleware
app.use((err, _, res, __) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});