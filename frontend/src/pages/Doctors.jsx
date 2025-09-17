import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { AppContext } from '../context/AppContext'
import { HiOutlineSearch, HiOutlineLocationMarker, HiOutlineClock, HiOutlineAdjustments } from 'react-icons/hi'
import { RiStethoscopeLine, RiMentalHealthLine } from 'react-icons/ri'
import { FaSortAmountDown } from 'react-icons/fa'
import BookingModal from '../components/BookingModal'

const Doctors = ({ openAppointmentModal }) => {
    const { currencySymbol } = useContext(AppContext)
    const [searchTerm, setSearchTerm] = useState('')
    const [specialty, setSpecialty] = useState('')
    const [sortBy, setSortBy] = useState('name') // 'name', 'experience'
    const [sortOrder, setSortOrder] = useState('asc') // 'asc' or 'desc'
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [bookedDoctors, setBookedDoctors] = useState(new Set())
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState(null)

    // Fetch doctors from backend
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/list`)
                if (response.data.success) {
                    setDoctors(response.data.doctors)
                } else {
                    throw new Error(response.data.message || 'Failed to fetch doctors')
                }
                setLoading(false)
            } catch (err) {
                setError('Failed to load doctors. Please try again later.')
                setLoading(false)
                toast.error('Failed to load doctors')
            }
        }

        fetchDoctors()
    }, [])

    // Handle opening booking modal
    const handleBookAppointment = (doctor) => {
        setSelectedDoctor(doctor);
        setShowBookingModal(true);
        setBookingForm({
            name: '',
            email: '',
            phone: '',
            date: '',
            message: ''
        });
    };

    // Handle form input changes
    const handleFormChange = (e) => {
        setBookingForm({
            ...bookingForm,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const appointmentData = {
                userData: {
                    name: bookingForm.name,
                    email: bookingForm.email,
                    phone: bookingForm.phone,
                    location: 'Center 1',
                    message: bookingForm.message,
                    speciality: selectedDoctor.speciality,
                    date: bookingForm.date
                },
                docData: {
                    name: selectedDoctor.name,
                    speciality: selectedDoctor.speciality,
                    location: 'Center 1'
                },
                amount: 0,
                slotTime: '09:00',
                slotDate: bookingForm.date,
                cancelled: false,
                payment: false,
                isCompleted: false,
                paymentDetails: null
            };

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/appointment-booking/book`, appointmentData);
            
            if (response.data.success) {
                setBookedDoctors(prev => new Set([...prev, selectedDoctor._id]));
                setShowBookingModal(false);
                toast.success(`Hello ${bookingForm.name}! Your appointment has been booked successfully. Email confirmation sent.`);
            } else {
                toast.error('Failed to book appointment');
            }
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Failed to book appointment');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close modal
    const closeBookingModal = () => {
        setShowBookingModal(false);
        setSelectedDoctor(null);
        setBookingForm({
            name: '',
            email: '',
            phone: '',
            date: '',
            message: ''
        });
    };

    // Get unique specialties from doctors
    const specialties = ['All Specialties', ...new Set(doctors.map(doctor => doctor.speciality))]

    // Sort and filter doctors
    const getSortedAndFilteredDoctors = () => {
        let filtered = doctors.filter(doctor => {
            const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesSpecialty = !specialty || doctor.speciality === specialty
            return matchesSearch && matchesSpecialty
        })

        return filtered.sort((a, b) => {
            let comparison = 0
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name)
                    break
                // Removed fees sorting
                    break
                case 'experience':
                    comparison = parseInt(a.experience) - parseInt(b.experience)
                    break
                default:
                    comparison = 0
            }
            return sortOrder === 'asc' ? comparison : -comparison
        })
    }

    const filteredDoctors = getSortedAndFilteredDoctors()

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Finding the best doctors for you...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RiMentalHealthLine className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                        <RiMentalHealthLine className="text-primary" />
                        Find Your Doctor
                    </h1>
                    <p className="text-lg text-gray-600">
                        Choose from our expert team of healthcare professionals
                    </p>
                </div>

                {/* Search, Sort and Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="w-full md:w-5/6 relative">
                            <input
                                type="text"
                                placeholder="Search by name or specialty..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>

                        {/* Sort and Filters */}
                        <div className="flex items-center gap-2">
                           
                           
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center justify-center gap-3 px-6 py-3 
                                         bg-primary text-white 
                                         rounded-lg font-medium hover:bg-primary/90
                                         transition-all duration-300"
                            >
                                <HiOutlineAdjustments className="w-5 h-5" />
                                <span>Filters</span>
                            </button>
                        </div>
                    </div>

                    {/* Expandable Filters */}
                    <div
                        className={`overflow-hidden transition-all duration-200 ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="pt-4 mt-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-primary/20"
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                    >
                                        {specialties.map((spec) => (
                                            <option key={spec} value={spec === 'All Specialties' ? '' : spec}>
                                                {spec}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                    {filteredDoctors.map((doctor, index) => (
                        <div
                            key={doctor._id}
                            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={doctor.image || 'https://placehold.co/300x200?text=Doctor'}
                                    alt={doctor.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                                    <div className="absolute bottom-4 left-4">
                                        <div className="flex items-center gap-2 text-white">
                                            <RiStethoscopeLine />
                                            <span className="font-medium">{doctor.speciality}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                    {doctor.name}
                                </h3>
                                <p className="text-sm text-primary font-medium mt-1">
                                    {doctor.speciality}
                                </p>
                                
                                <div className="mt-3 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <HiOutlineClock className="text-primary" />
                                            <span>{doctor.experience} Experience</span>
                                        </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                        {bookedDoctors.has(doctor._id) ? (
                                            <button
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium cursor-not-allowed"
                                                disabled
                                            >
                                                ✓ Appointment Booked
                                            </button>
                                        ) : (
                                            <button
                                                className="px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
                                                onClick={() => {
                                                    setSelectedDoctor(doctor)
                                                    setShowBookingModal(true)
                                                }}
                                            >
                                                Book Now
                                            </button>
                                        )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results Message */}
                {filteredDoctors.length === 0 && (
                    <div className="text-center py-12">
                        <RiMentalHealthLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No doctors found matching your criteria.</p>
                    </div>
                )}

                {/* Booking Modal */}
                <BookingModal 
                    isOpen={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    doctorInfo={selectedDoctor}
                    onBookingSuccess={(doctorId) => {
                        setBookedDoctors(prev => new Set([...prev, doctorId]));
                    }}
                />
            </div>
        </div>
    )
}

export default Doctors
