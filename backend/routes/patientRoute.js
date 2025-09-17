import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
    loginPatient, 
    getPatientDashboard, 
    getPatientAppointments, 
    getPatientPrescriptions, 
    getPatientBills, 
    getPatientProfile, 
    updatePatientProfile 
} from '../controllers/patientController.js';
import authPatient from '../middleware/authPatient.js';

const patientRouter = express.Router();

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Public routes
patientRouter.post("/login", loginPatient);

// Protected routes (require patient authentication)
patientRouter.get("/dashboard", authPatient, getPatientDashboard);
patientRouter.get("/appointments", authPatient, getPatientAppointments);
patientRouter.get("/prescriptions", authPatient, getPatientPrescriptions);
patientRouter.get("/bills", authPatient, getPatientBills);
patientRouter.get("/profile", authPatient, getPatientProfile);

// Use multer middleware to handle profile image uploads
patientRouter.put("/profile", authPatient, upload.single('photograph'), updatePatientProfile);

export default patientRouter;
