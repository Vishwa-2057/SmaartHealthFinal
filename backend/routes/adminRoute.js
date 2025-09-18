import { scheduleAppointmentWithDoctor } from '../controllers/adminController.js';
import { createBill, getAllBills } from '../controllers/billController.js';
import express from 'express';
import { addDoctor, allDoctors, loginAdmin, appointmentsAdmin, appointmentCancel, adminDashboard, addPatient, getAllPatients, getPatientDetails } from '../controllers/adminController.js';
import { getPatientPrescriptions } from '../controllers/prescriptionController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import { 
    searchPatients,
    createClinicalRecord,
    getClinicalRecords,
    updateClinicalRecord,
    deleteClinicalRecord,
    getPatientClinicalRecords
} from '../controllers/clinicalRecordController.js';
import {
    createVitalsRecord,
    getPatientVitals,
    getVitalsByUHID,
    getLatestVitals,
    updateVitalsRecord,
    deleteVitalsRecord
} from '../controllers/vitalsController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
import userModel from '../models/userModel.js';
import Patient from '../models/Patient.js';
import appointmentModel from '../models/appointmentModel.js';
import clinicalRecordModel from '../models/clinicalRecordModel.js';
import doctorModel from '../models/doctorModel.js';


const adminRouter = express.Router();
// Billing
adminRouter.post('/bills', authAdmin, createBill);
adminRouter.get('/bills', authAdmin, getAllBills);
// Schedule appointment with doctor
adminRouter.put('/schedule-appointment/:appointmentId', authAdmin, scheduleAppointmentWithDoctor);

// Admin authentication
adminRouter.post("/login", loginAdmin);

// Doctor management
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailablity);

// Appointment management
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);

// Dashboard
adminRouter.get("/dashboard", authAdmin, adminDashboard);

// Patient management
adminRouter.post("/add-patient", authAdmin, upload.fields([
    { name: 'photograph', maxCount: 1 },
    { name: 'governmentIdDocument', maxCount: 1 }
]), addPatient);
adminRouter.get("/patients", authAdmin, getAllPatients);
adminRouter.get("/patient-prescriptions/:patientId", authAdmin, getPatientPrescriptions);
adminRouter.get("/patient-details/:patientId", authAdmin, async (req, res) => {
    try {
        const { patientId } = req.params;
        
        // Try to find in userModel first
        let patient = await userModel.findById(patientId).select('-password');
        let source = 'user';
        
        // If not found in userModel, try Patient
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

        // Get appointments for this patient
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

        // Get clinical records for this patient
        const clinicalRecords = await clinicalRecordModel.find({
            patient: patientId
        })
        .populate({
            path: 'consultedDoctor',
            select: 'name speciality image',
            model: 'Doctor'
        })
        .sort({ createdAt: -1 });

        // Transform the data based on the source
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
                doctor: app.docId  // Map docId to doctor for frontend compatibility
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

// Clinical Records Routes
adminRouter.post('/search-patients', authAdmin, searchPatients);
adminRouter.post('/add-clinical-record', authAdmin, createClinicalRecord);
adminRouter.get('/clinical-records', authAdmin, getClinicalRecords);
adminRouter.get('/clinical-records/:patientId', authAdmin, getPatientClinicalRecords);
adminRouter.put('/clinical-records/:recordId', authAdmin, updateClinicalRecord);
adminRouter.delete('/clinical-records/:recordId', authAdmin, deleteClinicalRecord);

// Vitals Routes
adminRouter.post('/vitals', authAdmin, createVitalsRecord);
adminRouter.get('/vitals/patient/:patientId', authAdmin, getPatientVitals);
adminRouter.get('/vitals/uhid/:uhid', authAdmin, getVitalsByUHID);
adminRouter.get('/vitals/latest/:patientId', authAdmin, getLatestVitals);
adminRouter.put('/vitals/:recordId', authAdmin, updateVitalsRecord);
adminRouter.delete('/vitals/:recordId', authAdmin, deleteVitalsRecord);

export default adminRouter;
