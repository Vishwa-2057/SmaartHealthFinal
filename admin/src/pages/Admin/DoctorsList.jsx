import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const DoctorsList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors } = useContext(AdminContext)
  const { currency } = useContext(AppContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpeciality, setFilterSpeciality] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (aToken) {
      loadDoctors()
    }
  }, [aToken])

  const loadDoctors = async () => {
    setLoading(true)
    try {
      await getAllDoctors()
    } catch (error) {
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleAvailabilityChange = async (doctorId, currentStatus) => {
    try {
      await changeAvailability(doctorId)
      toast.success(`Doctor availability ${currentStatus ? 'disabled' : 'enabled'}`)
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  // Build specialities list safely
  const specialities = [
    'all',
    ...Array.from(new Set(doctors.map(doc => doc.speciality || 'Unknown')))
  ]

  const filteredDoctors = doctors.filter(doctor => {
    const name = doctor.name || ''
    const speciality = doctor.speciality || ''
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speciality.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpeciality =
      filterSpeciality === 'all' || speciality === filterSpeciality
    return matchesSearch && matchesSpeciality
  })

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Doctors Directory</h1>
        <p className="text-gray-500">Manage and view all registered doctors</p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search doctors by name or speciality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div className="w-full sm:w-48">
          <select
            value={filterSpeciality}
            onChange={(e) => setFilterSpeciality(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          >
            {specialities.map((speciality, index) => (
              <option key={index} value={speciality}>
                {speciality.charAt(0).toUpperCase() + speciality.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map((doctor, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative">
                <img
                  src={doctor.image || 'https://via.placeholder.com/400x300'}
                  alt={doctor.name || 'Doctor'}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  doctor.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {doctor.available ? 'Available' : 'Unavailable'}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{doctor.name || 'Unknown'}</h3>
                <p className="text-sm text-gray-600 mb-2">{doctor.speciality || 'General'}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {doctor.experience || 0} years experience
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {currency}{doctor.fees || 0} per consultation
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={doctor.available}
                      onChange={() => handleAvailabilityChange(doctor._id, doctor.available)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ms-3 text-sm font-medium text-gray-700">Available</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}

export default DoctorsList
