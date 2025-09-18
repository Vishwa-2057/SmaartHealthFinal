import React, { useState, useContext } from 'react'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHospital } from 'react-icons/fa'

const AddPatient = () => {
  const { aToken } = useContext(AdminContext)
    const [formData, setFormData] = useState({
      uhid: '',
      patientName: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      occupation: '',
      referringDoctor: { name: '', clinic: '' },
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        zipCode: ''
      },
      insuranceStatus: 'Not Insured',
      organDonorStatus: 'No',
      photograph: '',
      governmentId: { type: '', number: '', document: '' },
      insuranceDetails: { provider: '', policyNumber: '', validity: '' },
      consent: {
        dataCollection: false,
        clinicalTreatment: false,
        teleconsultation: false,
        dataSharing: false
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target
    const field = name.split('.')[1]
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }))
  }

  const validateForm = () => {
    if (!formData.uhid.trim()) {
      toast.error('UHID is required')
      return false
    }
    if (!formData.patientName.trim()) {
      toast.error('Patient name is required')
      return false
    }
    if (!formData.email.trim()) {
      toast.error('Email is required')
      return false
    }
    if (!formData.password.trim()) {
      toast.error('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return false
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required')
      return false
    }
    if (!formData.dateOfBirth) {
      toast.error('Date of birth is required')
      return false
    }
    if (!formData.gender) {
      toast.error('Gender is required')
      return false
    }
    if (!formData.address.line1.trim() || !formData.address.city.trim() || !formData.address.state.trim() || !formData.address.zipCode.trim()) {
      toast.error('Address fields (except line 2) are required')
      return false
    }
    // Emergency contact validation
    if (!formData.emergencyContact.name.trim() ||
        !formData.emergencyContact.phone.trim() ||
        !formData.emergencyContact.relationship.trim()) {
      toast.error('Emergency contact details are required')
      return false
    }
    // Blood group is now optional
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!aToken) {
      toast.error('Not authorized. Please login again.')
      return
    }

    if (!validateForm()) {
      return
    }
    
    setLoading(true)

    try {
      const form = new FormData();
  form.append('uhid', formData.uhid);
  form.append('patientName', formData.patientName);
      form.append('email', formData.email);
      form.append('password', formData.password);
      form.append('phone', formData.phone);
      form.append('dateOfBirth', formData.dateOfBirth);
      form.append('gender', formData.gender);
      form.append('bloodGroup', formData.bloodGroup);
      form.append('occupation', formData.occupation);
      form.append('address', JSON.stringify(formData.address));
      form.append('referringDoctor', JSON.stringify(formData.referringDoctor));
      form.append('insuranceStatus', formData.insuranceStatus);
      form.append('organDonorStatus', formData.organDonorStatus);
      form.append('governmentId', JSON.stringify(formData.governmentId));
      if (formData.governmentId.document) {
        form.append('governmentIdDocument', formData.governmentId.document);
      }
      form.append('insuranceDetails', JSON.stringify(formData.insuranceDetails));
      form.append('consent', JSON.stringify(formData.consent));
      form.append('emergencyContact[name]', formData.emergencyContact.name);
      form.append('emergencyContact[phone]', formData.emergencyContact.phone);
      form.append('emergencyContact[relationship]', formData.emergencyContact.relationship);

      if (formData.photograph) {
        form.append('photograph', formData.photograph);
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/add-patient`,
        form,
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if (response.data.success) {
        toast.success('Patient added successfully');
        setFormData({
          uhid: '',
          patientName: '',
          email: '',
          password: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          bloodGroup: '',
          occupation: '',
          referringDoctor: { name: '', clinic: '' },
          address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            zipCode: ''
          },
          insuranceStatus: 'Not Insured',
          organDonorStatus: 'No',
          photograph: '',
          governmentId: { type: '', number: '', document: '' },
          insuranceDetails: { provider: '', policyNumber: '', validity: '' },
          consent: {
            dataCollection: false,
            clinicalTreatment: false,
            teleconsultation: false,
            dataSharing: false
          },
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          }
        });
      } else {
        throw new Error(response.data.message || 'Failed to add patient');
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error(error.response?.data?.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight mb-2 flex items-center justify-center"><FaUser className="mr-2 text-blue-600" /> Add New Patient</h1>
          <p className="text-lg text-blue-700">Fill in the details to add a new patient to the system</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
          {/* Photograph */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex flex-col items-center w-full md:w-1/3">
              <label className="block text-base font-semibold text-gray-700 mb-2">Photograph <span className="text-red-500">*</span></label>
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-2 overflow-hidden border-2 border-blue-300">
                {formData.photograph ? (
                  <img src={URL.createObjectURL(formData.photograph)} alt="Preview" className="object-cover w-full h-full" />
                ) : (
                  <FaUser className="text-5xl text-blue-400" />
                )}
              </div>
              <input type="file" accept="image/*" name="photograph" onChange={e => setFormData(prev => ({ ...prev, photograph: e.target.files[0] }))} required className="w-full px-4 py-2 border border-blue-300 rounded-lg" />
            </div>
            <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info - reordered and fixed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FaUser className="mr-1 text-blue-500" /> Patient Name <span className="text-red-500">*</span></label>
                <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UHID <span className="text-red-500">*</span></label>
                <input type="text" name="uhid" value={formData.uhid} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FaEnvelope className="mr-1 text-blue-500" /> Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required minLength={6} autoComplete="new-password" />
                <button type="button" className="mt-1 text-xs text-blue-600 underline" onClick={() => setShowPassword(prev => !prev)}>
                  {showPassword ? "Hide" : "Show"} Password
                </button>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FaPhone className="mr-1 text-blue-500" /> Phone Number <span className="text-red-500">*</span></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required pattern="[0-9]{10}" title="Please enter a valid 10-digit phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required max={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400">
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" />
              </div>
            </div>
          </div>
          {/* Referring Doctor */}
          <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referring Doctor Name</label>
              <input type="text" name="referringDoctor.name" value={formData.referringDoctor.name} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" placeholder="Doctor Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referring Doctor Clinic (if any)</label>
              <input type="text" name="referringDoctor.clinic" value={formData.referringDoctor.clinic} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" placeholder="Clinic Name" />
            </div>
          </div>
          {/* Address Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><FaMapMarkerAlt className="mr-1 text-blue-500" /> Address Line 1 <span className="text-red-500">*</span></label>
              <input type="text" name="address.line1" value={formData.address.line1} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
              <input type="text" name="address.line2" value={formData.address.line2} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
              <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
              <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code <span className="text-red-500">*</span></label>
              <input type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required pattern="[0-9]{6}" title="Please enter a valid 6-digit ZIP code" />
            </div>
          </div>
          {/* Government ID Proof */}
          <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Government ID Type</label>
              <select name="governmentId.type" value={formData.governmentId.type} onChange={e => setFormData(prev => ({ ...prev, governmentId: { ...prev.governmentId, type: e.target.value } }))} className="w-full px-4 py-2 border border-blue-300 rounded-lg">
                <option value="">Select ID Type</option>
                <option value="Aadhaar">Aadhaar</option>
                <option value="Passport">Passport</option>
                <option value="Driver's License">Driver's License</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
              <input type="text" name="governmentId.number" value={formData.governmentId.number} onChange={e => setFormData(prev => ({ ...prev, governmentId: { ...prev.governmentId, number: e.target.value } }))} placeholder="ID Number" className="w-full px-4 py-2 border border-blue-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
              <input type="file" accept="application/pdf,image/*" name="governmentId.document" onChange={e => setFormData(prev => ({ ...prev, governmentId: { ...prev.governmentId, document: e.target.files[0] } }))} className="w-full px-4 py-2 border border-blue-300 rounded-lg" />
            </div>
          </div>
          {/* Insurance, Consent & Emergency Contact */}
          <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Details</label>
              <input type="text" name="insuranceDetails.provider" value={formData.insuranceDetails.provider} onChange={e => setFormData(prev => ({ ...prev, insuranceDetails: { ...prev.insuranceDetails, provider: e.target.value } }))} placeholder="Provider" className="w-full px-4 py-2 border border-blue-300 rounded-lg mb-2" />
              <input type="text" name="insuranceDetails.policyNumber" value={formData.insuranceDetails.policyNumber} onChange={e => setFormData(prev => ({ ...prev, insuranceDetails: { ...prev.insuranceDetails, policyNumber: e.target.value } }))} placeholder="Policy Number" className="w-full px-4 py-2 border border-blue-300 rounded-lg mb-2" />
              <input type="text" name="insuranceDetails.validity" value={formData.insuranceDetails.validity} onChange={e => setFormData(prev => ({ ...prev, insuranceDetails: { ...prev.insuranceDetails, validity: e.target.value } }))} placeholder="Validity" className="w-full px-4 py-2 border border-blue-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consent</label>
              <div className="space-y-2">
                <label className="flex items-center"><input type="checkbox" checked={formData.consent.dataCollection} onChange={e => setFormData(prev => ({ ...prev, consent: { ...prev.consent, dataCollection: e.target.checked } }))} /> <span className="ml-2">Consent for Data Collection & Storage</span></label>
                <label className="flex items-center"><input type="checkbox" checked={formData.consent.clinicalTreatment} onChange={e => setFormData(prev => ({ ...prev, consent: { ...prev.consent, clinicalTreatment: e.target.checked } }))} /> <span className="ml-2">Consent for Clinical Treatment</span></label>
                <label className="flex items-center"><input type="checkbox" checked={formData.consent.teleconsultation} onChange={e => setFormData(prev => ({ ...prev, consent: { ...prev.consent, teleconsultation: e.target.checked } }))} /> <span className="ml-2">Consent for Teleconsultation</span></label>
                <label className="flex items-center"><input type="checkbox" checked={formData.consent.dataSharing} onChange={e => setFormData(prev => ({ ...prev, consent: { ...prev.consent, dataSharing: e.target.checked } }))} /> <span className="ml-2">Consent for Data Sharing</span></label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name <span className="text-red-500">*</span></label>
              <input type="text" name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleEmergencyContactChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg mb-2" required />
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone <span className="text-red-500">*</span></label>
              <input type="text" name="emergencyContact.phone" value={formData.emergencyContact.phone} onChange={handleEmergencyContactChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg mb-2" required pattern="[0-9]{10}" title="Please enter a valid 10-digit phone number" />
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship <span className="text-red-500">*</span></label>
              <input type="text" name="emergencyContact.relationship" value={formData.emergencyContact.relationship} onChange={handleEmergencyContactChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg" required />
            </div>
          </div>
          {/* Additional Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Status</label>
              <select name="insuranceStatus" value={formData.insuranceStatus} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required>
                <option value="Not Insured">Not Insured</option>
                <option value="Insured">Insured</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organ Donor Status</label>
              <select name="organDonorStatus" value={formData.organDonorStatus} onChange={handleChange} className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-blue-400 focus:border-blue-400" required>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold">
              {loading ? 'Adding Patient...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPatient 
