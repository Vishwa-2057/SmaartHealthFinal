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

const Doctors = () => {
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
    const [bookingForm, setBookingForm] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const handleBookAppointment = (doctor) => {
        setSelectedDoctor(doctor)
        setShowBookingModal(true)
        setBookingForm({
            name: '',
            email: '',
            phone: '',
            date: '',
            message: ''
        })
    }

    const handleFormChange = (e) => {
        setBookingForm({
            ...bookingForm,
            [e.target.name]: e.target.value
        })
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const appointmentData = {
                userData: {
                    name: bookingForm.name,
                    email: bookingForm.email,
                    phone: bookingForm.phone,
                    location: 'Center 1',
                    message: bookingForm.message,
                    speciality: selectedDoctor?.speciality || '',
                    date: bookingForm.date
                },
                docData: {
                    name: selectedDoctor?.name || '',
                    speciality: selectedDoctor?.speciality || '',
                    location: 'Center 1'
                },
                amount: 0,
                slotTime: '09:00',
                slotDate: bookingForm.date,
                cancelled: false,
                payment: false,
                isCompleted: false,
                paymentDetails: null
            }

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/appointment-booking/book`, appointmentData)
            
            if (response.data.success) {
                setBookedDoctors(prev => new Set([...prev, selectedDoctor._id]))
                setShowBookingModal(false)
                toast.success(`Hello ${bookingForm.name}! Your appointment has been booked successfully. Email confirmation sent.`)
            } else {
                toast.error('Failed to book appointment')
            }
        } catch (error) {
            console.error('Booking error:', error)
            toast.error('Failed to book appointment')
        } finally {
            setIsSubmitting(false)
        }
    }

    const closeBookingModal = () => {
        setShowBookingModal(false)
        setSelectedDoctor(null)
        setBookingForm({
            name: '',
            email: '',
            phone: '',
            date: '',
            message: ''
        })
    }

    const specialties = ['All Specialties', ...new Set(doctors.map(doctor => doctor.speciality).filter(Boolean))]

    const getSortedAndFilteredDoctors = () => {
        let filtered = doctors.filter(doctor => {
            const name = doctor.name || ''
            const speciality = doctor.speciality || ''
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  speciality.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesSpecialty = !specialty || speciality === specialty
            return matchesSearch && matchesSpecialty
        })

        return filtered.sort((a, b) => {
            let comparison = 0
            switch (sortBy) {
                case 'name':
                    comparison = (a.name || '').localeCompare(b.name || '')
                    break
                case 'experience':
                    comparison = parseInt(a.experience || '0') - parseInt(b.experience || '0')
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
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                        <RiMentalHealthLine className="text-primary" />
                        Find Your Doctor
                    </h1>
                    <p className="text-lg text-gray-600">
                        Choose from our expert team of healthcare professionals
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all duration-300"
                            >
                                <HiOutlineAdjustments className="w-5 h-5" />
                                <span>Filters</span>
                            </button>
                        </div>
                    </div>

                    <div className={`overflow-hidden transition-all duration-200 ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <div
                            key={doctor._id}
                            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={doctor.image || 'https://placehold.co/300x200?text=Doctor'}
                                    alt={doctor.name || 'Doctor'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{doctor.name || 'Unknown Doctor'}</h3>
                                <p className="text-sm text-gray-600 mb-4">{doctor.speciality || 'General'}</p>
                                <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <HiOutlineLocationMarker className="w-4 h-4" />
                                        Center 1
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <HiOutlineClock className="w-4 h-4" />
                                        {doctor.experience || 0} yrs
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-primary font-bold text-lg">
                                        {currencySymbol}{doctor.fee || 0}
                                    </span>
                                    <button
                                        onClick={() => handleBookAppointment(doctor)}
                                        disabled={bookedDoctors.has(doctor._id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                            bookedDoctors.has(doctor._id)
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary/90'
                                        }`}
                                    >
                                        {bookedDoctors.has(doctor._id) ? 'Booked' : 'Book'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showBookingModal && selectedDoctor && (
                <BookingModal
                    doctor={selectedDoctor}
                    bookingForm={bookingForm}
                    handleFormChange={handleFormChange}
                    handleFormSubmit={handleFormSubmit}
                    closeBookingModal={closeBookingModal}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    )
}

export default Doctors
