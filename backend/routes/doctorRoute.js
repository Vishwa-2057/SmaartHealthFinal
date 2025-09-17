import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
    loginDoctor, 
    appointmentsDoctor, 
    appointmentCancel, 
    doctorList, 
    changeAvailablity, 
    appointmentComplete, 
    doctorDashboard, 
    doctorProfile, 
    updateDoctorProfile, 
    getPatients 
} from '../controllers/doctorController.js';
import { 
    createPrescription, 
    getPatientPrescriptions, 
    getDoctorPrescriptions, 
    updatePrescription, 
    getScheduledPatients, 
    getPatientDetails, 
    getPatientVitals 
} from '../controllers/prescriptionController.js';
import authDoctor from '../middleware/authDoctor.js';
import userModel from '../models/userModel.js';
import Patient from '../models/Patient.js';
import appointmentModel from '../models/appointmentModel.js';
import clinicalRecordModel from '../models/clinicalRecordModel.js';
import doctorModel from '../models/doctorModel.js';

const doctorRouter = express.Router();

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// Routes
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/patients", authDoctor, getPatients);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.get("/list", doctorList);
doctorRouter.post("/change-availability", authDoctor, changeAvailablity);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);

// Use multer middleware for image uploads when updating doctor profile
doctorRouter.post("/update-profile", authDoctor, upload.single('image'), updateDoctorProfile);

// Prescription and consultation routes
doctorRouter.post("/prescription", authDoctor, createPrescription);
doctorRouter.get("/prescriptions", authDoctor, getDoctorPrescriptions);
doctorRouter.get("/patient-prescriptions/:patientId", authDoctor, getPatientPrescriptions);
doctorRouter.put("/prescription/:prescriptionId", authDoctor, updatePrescription);
doctorRouter.get("/scheduled-patients", authDoctor, getScheduledPatients);
doctorRouter.get("/vitals/patient/:patientId", authDoctor, getPatientVitals);

// Add patient details endpoint
doctorRouter.get("/patient-details/:patientId", authDoctor, async (req, res) => {
    try {
        const { patientId } = req.params;
        
        let patient = await userModel.findById(patientId).select('-password');
        let source = 'user';
        
        if (!patient) {
            patient = await Patient.findById(patientId);
            source = 'patient';
        }
        
        if (!patient) {
            return res.status(404).json({ 
                success: false, 
                message: 'Patient not found' 
            });
        }

        const appointments = await appointmentModel.find({ 
            $or: [
                { userId: patientId },
                { patient: patientId }
            ]
        })
        .populate({
            path: 'docId',
            select: 'name speciality image',
            model: 'Doctor'
        })
        .sort({ date: -1 });

        const clinicalRecords = await clinicalRecordModel.find({
            patient: patientId
        })
        .populate({
            path: 'consultedDoctor',
            select: 'name speciality image',
            model: 'Doctor'
        })
        .sort({ createdAt: -1 });

        const transformedPatient = {
            _id: patient._id,
            patientName: source === 'user' ? patient.name : patient.patientName,
            name: source === 'user' ? patient.name : patient.patientName,
            email: patient.email,
            phone: patient.phone,
            gender: patient.gender,
            dateOfBirth: patient.dateOfBirth || patient.dob,
            bloodGroup: patient.bloodGroup,
            address: patient.address,
            uhid: source === 'patient' ? patient.uhid : undefined,
            medicalInfo: patient.medicalInfo || {},
            appointments: appointments.map(app => ({
                ...app.toObject(),
                doctor: app.docId
            })) || [],
            clinicalRecords: clinicalRecords || []
        };

        res.status(200).json({ 
            success: true, 
            patient: transformedPatient,
            source
        });
    } catch (error) {
        console.error('Error in getPatientDetails:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching patient details',
            error: error.message 
        });
    }
});

export default doctorRouter;
