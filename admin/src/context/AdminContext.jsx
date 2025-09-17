import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '');
    const [isInitialized, setIsInitialized] = useState(false);

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [patients, setPatients] = useState([]);
    const [clinicalRecords, setClinicalRecords] = useState([]);

    // Configure axios base URL
    axios.defaults.baseURL = backendUrl;
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    // Initialize token and verify it
    useEffect(() => {
        const initializeToken = async () => {
            const token = localStorage.getItem('aToken');
            if (token) {
                try {
                    setAxiosAuthToken(token);
                    const response = await axios.get('/api/admin/dashboard');
                    if (response.data.success) {
                        setAToken(token);
                    } else {
                        handleLogout();
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    handleLogout();
                }
            }
            setIsInitialized(true);
        };
        initializeToken();
    }, []);

    // Set axios headers when token changes
    useEffect(() => {
        if (!isInitialized) return;
        if (aToken) {
            setAxiosAuthToken(aToken);
        } else {
            clearAxiosAuthToken();
        }
    }, [aToken, isInitialized]);

    const setAxiosAuthToken = (token) => {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['atoken'] = token;
    };

    const clearAxiosAuthToken = () => {
        delete axios.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['atoken'];
    };

    const handleLogout = () => {
        setAToken('');
        localStorage.removeItem('aToken');
        clearAxiosAuthToken();
        window.location.href = '/';
    };

    const ensureTokenSet = () => {
        if (!axios.defaults.headers.common['Authorization']) {
            const token = localStorage.getItem('aToken');
            if (token) {
                setAxiosAuthToken(token);
            } else {
                handleLogout();
                throw new Error('Authentication token not found');
            }
        }
    };

    // Fetch all doctors
    const getAllDoctors = async () => {
        try {
            ensureTokenSet();
            const { data } = await axios.get('/api/admin/all-doctors');
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    const changeAvailability = async (docId) => {
        try {
            ensureTokenSet();
            const { data } = await axios.post('/api/admin/change-availability', { docId });
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    const getAllAppointments = async () => {
        try {
            ensureTokenSet();
            const { data } = await axios.get('/api/admin/appointments');
            if (data.success) {
                setAppointments(data.appointments.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            ensureTokenSet();
            const { data } = await axios.post('/api/admin/cancel-appointment', { appointmentId });
            if (data.success) {
                toast.success(data.message);
                getAllAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    const getDashData = async () => {
        try {
            ensureTokenSet();
            const { data } = await axios.get('/api/admin/dashboard');
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };

    const getAllPatients = async () => {
        try {
            ensureTokenSet();
            const { data } = await axios.get('/api/admin/patients');
            if (data.success) {
                const validatedPatients = data.patients.map(patient => ({
                    ...patient,
                    name: patient.patientName || 'Unnamed Patient',
                    email: patient.email || 'No email provided',
                    phone: patient.phone || 'No phone provided',
                    age: calculateAge(patient.dateOfBirth) || 'N/A',
                    gender: patient.gender || 'Not specified',
                    bloodGroup: patient.bloodGroup || 'Not specified'
                }));
                setPatients(validatedPatients);
            } else {
                throw new Error(data.message || 'Failed to fetch patients');
            }
        } catch (error) {
            handleError(error);
            throw error;
        }
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };

    const getPatientDetails = async (patientId) => {
        try {
            ensureTokenSet();
            const { data } = await axios.get(`/api/admin/patient-details/${patientId}`);
            if (data.success) {
                const patient = data.patient;
                const transformedPatient = {
                    ...patient,
                    name: patient.patientName || patient.name || 'Unnamed Patient',
                    email: patient.email || 'No email provided',
                    phone: patient.phone || 'No phone provided',
                    uhid: patient.uhid || 'Not assigned',
                    gender: patient.gender || 'Not specified',
                    bloodGroup: patient.bloodGroup || 'Not specified',
                    dateOfBirth: patient.dateOfBirth || patient.dob || null,
                    appointments: patient.appointments || [],
                    clinicalRecords: patient.clinicalRecords || [],
                    medicalInfo: {
                        ...patient.medicalInfo,
                        allergies: patient.medicalInfo?.allergies || 'None reported',
                        chronicConditions: patient.medicalInfo?.chronicConditions || 'None reported',
                        currentMedications: patient.medicalInfo?.currentMedications || 'None reported',
                        emergencyContact: patient.medicalInfo?.emergencyContact || {}
                    },
                    address: patient.address || {}
                };
                return {
                    success: true,
                    patient: transformedPatient,
                    source: data.source
                };
            } else {
                throw new Error(data.message || 'Failed to fetch patient details');
            }
        } catch (error) {
            handleError(error);
            throw error;
        }
    };

    const getPatientClinicalRecords = async (patientId) => {
        try {
            ensureTokenSet();
            const { data } = await axios.get(`/api/admin/clinical-records/${patientId}`);
            if (data.success) {
                return data.clinicalRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else {
                throw new Error(data.message || 'Failed to fetch clinical records');
            }
        } catch (error) {
            handleError(error);
            throw error;
        }
    };

    const searchPatients = async (searchTerm) => {
        try {
            if (!searchTerm?.trim()) return [];
            ensureTokenSet();
            const { data } = await axios.post('/api/admin/search-patients', { term: searchTerm.trim() });
            if (data.success) {
                return data.patients.map(patient => ({
                    _id: patient._id,
                    name: patient.name || patient.patientName || 'Unnamed Patient',
                    email: patient.email || 'No email provided',
                    phone: patient.phone || 'No phone provided',
                    uhid: patient.uhid || 'No UHID',
                    gender: patient.gender || 'Not specified',
                    dateOfBirth: patient.dateOfBirth,
                    bloodGroup: patient.bloodGroup || 'Not specified'
                }));
            } else {
                throw new Error(data.message || 'Search failed');
            }
        } catch (error) {
            handleError(error);
            return [];
        }
    };

    const addClinicalRecord = async (patientId, recordData) => {
        try {
            ensureTokenSet();
            const requiredFields = [
                'consultedDoctor',
                'encounterType',
                'encounterDate',
                'reasonForVisit',
                'diagnosis',
                'treatment',
                'currentClinical
