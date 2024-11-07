CREATE DATABASE HEALTHCARE;
USE HEALTHCARE;
CREATE TABLE `appointments` (
  `AppointmentID` int NOT NULL AUTO_INCREMENT,
  `PatientID` int DEFAULT NULL,
  `DoctorID` int DEFAULT NULL,
  `AppointmentDate` date DEFAULT NULL,
  `AppointmentTime` time DEFAULT NULL,
  `Status` enum('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',
  `DateCreated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AppointmentID`),
  KEY `PatientID` (`PatientID`),
  KEY `DoctorID` (`DoctorID`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`PatientID`) REFERENCES `patients` (`PatientID`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `doctors` (`DoctorID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `change_log` (
  `LogID` int NOT NULL AUTO_INCREMENT,
  `TableName` varchar(50) DEFAULT NULL,
  `OperationType` varchar(10) DEFAULT NULL,
  `RecordID` int DEFAULT NULL,
  `ChangeDetails` text,
  `DateChanged` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LogID`)
) ENGINE=InnoDB AUTO_INCREMENT=1  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `doctors` (
  `DoctorID` int NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Specialty` varchar(100) NOT NULL,
  `PhoneNumber` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `WorkingHours` varchar(50) DEFAULT NULL,
  `DaysAvailable` varchar(100) DEFAULT NULL,
  `DateCreated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`DoctorID`),
  UNIQUE KEY `PhoneNumber` (`PhoneNumber`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `doctors` VALUES (1,'Dr. Arjun','Pandey','Cardiology','9887654321','arjun.pandey@example.com','9 AM - 1 PM','Monday, Wednesday, Friday','2024-10-31 14:20:07'),(2,'Dr. Seema','Gupta','Pediatrics','9821345678','seema.gupta@example.com','10 AM - 3 PM','Tuesday, Thursday, Saturday','2024-10-31 14:20:07'),(3,'Dr. Rajesh','Kapoor','Orthopedics','9845671234','rajesh.kapoor@example.com','11 AM - 4 PM','Monday, Wednesday, Friday','2024-10-31 14:20:07'),(4,'Dr. Nisha','Deshmukh','Dermatology','9812341122','nisha.deshmukh@example.com','8 AM - 12 PM','Tuesday, Thursday, Saturday','2024-10-31 14:20:07'),(5,'Dr. Karan','Jain','ENT','9865432123','karan.jain@example.com','2 PM - 6 PM','Monday, Wednesday, Friday','2024-10-31 14:20:07'),(6,'Dr. Asha','Sharma','Gynecology','9821234567','asha.sharma@example.com','9 AM - 1 PM','Tuesday, Thursday, Saturday','2024-10-31 14:20:07'),(7,'Dr. Rakesh','Kumar','Neurology','9811765432','rakesh.kumar@example.com','12 PM - 5 PM','Monday, Wednesday, Friday','2024-10-31 14:20:07'),(8,'Dr. Snehal','Rao','Psychiatry','9887654211','snehal.rao@example.com','10 AM - 2 PM','Tuesday, Thursday, Saturday','2024-10-31 14:20:07'),(9,'Dr. Sunil','Yadav','Urology','9821987654','sunil.yadav@example.com','3 PM - 7 PM','Monday, Wednesday, Friday','2024-10-31 14:20:07'),(10,'Dr. Anita','Sen','Gastroenterology','9834567892','anita.sen@example.com','8 AM - 11 AM','Tuesday, Thursday, Saturday','2024-10-31 14:20:07'),(11,'Dr. Vikram','Chopra','Nephrology','9812365478','vikram.chopra@example.com','2 PM - 6 PM','Monday, Wednesday, Friday','2024-10-31 14:20:07'),(12,'Dr. Pooja','Nair','Oncology','9845126789','pooja.nair@example.com','1 PM - 5 PM','Tuesday, Thursday, Saturday','2024-10-31 14:20:07'),(13,'Dr. Ravi','Iyer','Ophthalmology','9821347654','ravi.iyer@example.com','9 AM - 12 PM','Monday, Wednesday, Friday','2024-10-31 14:20:07'),(14,'Dr. Meera','Menon','Pathology','9867123456','meera.menon@example.com','11 AM - 3 PM','Tuesday, Thursday, Saturday','2024-10-31 14:20:07'),(15,'Dr. Ajay','Batra','Pulmonology','9812376548','ajay.batra@example.com','10 AM - 2 PM','Monday, Wednesday, Friday','2024-10-31 14:20:07');

CREATE TABLE `patients` (
  `PatientID` int NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `PhoneNumber` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Age` int DEFAULT NULL,
  `Gender` enum('Male','Female','Other') DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `DateCreated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PatientID`),
  UNIQUE KEY `PhoneNumber` (`PhoneNumber`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `userauth` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `UserType` enum('Doctor','Patient','Admin') NOT NULL,
  `LinkedID` int NOT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `userauth` VALUES (1,'dr.arjun','doctor123','Doctor',1),(2,'dr.seema','doctor456','Doctor',2),(3,'dr.rajeshkapoor','ortho789','Doctor',3),(4,'dr.nishadesh','derma321','Doctor',4),(5,'dr.karanjain','ent456','Doctor',5),(6,'dr.ashasharma','gyno123','Doctor',6),(7,'dr.rakeshkumar','neuro999','Doctor',7),(8,'dr.snehar','psych000','Doctor',8),(9,'dr.sunilyadav','uro1234','Doctor',9),(10,'dr.anitasen','gastro123','Doctor',10),(11,'dr.vikramc','nephro777','Doctor',11),(12,'dr.poojanair','onco555','Doctor',12),(13,'dr.raviiyer','opthal888','Doctor',13),(14,'dr.meeram','patho222','Doctor',14),(15,'dr.ajayb','pulmo000','Doctor',15);
