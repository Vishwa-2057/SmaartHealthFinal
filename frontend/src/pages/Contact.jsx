import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LuStethoscope, LuClock, LuMail, LuPhone, LuMapPin, LuUser, LuMessageSquare, LuHospital } from 'react-icons/lu'
import { TbNotes } from 'react-icons/tb'

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle form submission here
        console.log('Form submitted:', formData)
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const contactInfo = [
        {
            icon: <LuMapPin className="w-6 h-6" />,
            title: "Visit Us",
            details: ["SMAART Healthcare Center", "Multispecialty Phygital Clinic"],
            color: "from-gray-600 to-gray-700"
        },
        {
            icon: <LuPhone className="w-6 h-6" />,
            title: "Call Us",
            details: ["Main: +91-XXXX-XXXXXX", "Telehealth: +91-XXXX-XXXXXX"],
            color: "from-gray-600 to-gray-700"
        },
        {
            icon: <LuMail className="w-6 h-6" />,
            title: "Email Us",
            details: ["info@smaarthealthcare.com", "support@smaarthealthcare.com"],
            color: "from-gray-600 to-gray-700"
        },
        {
            icon: <LuClock className="w-6 h-6" />,
            title: "Working Hours",
            details: ["Monday - Saturday: 9:00 AM - 7:00 PM", "Sunday: 10:00 AM - 4:00 PM"],
            color: "from-gray-600 to-gray-700"
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=2000')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Contact SMAART Healthcare
                    </h1>
                    <p className="text-xl text-white/90 max-w-3xl mx-auto">
                        Connect with our healthcare experts for personalized care and support
                    </p>
                </motion.div>
            </div>

            {/* Contact Information Cards */}
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {contactInfo.map((info, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-primary mb-4">
                                {info.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                            {info.details.map((detail, idx) => (
                                <p key={idx} className="text-gray-600">{detail}</p>
                            ))}
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <motion.div
                        variants={item}
                        className="bg-white p-8 rounded-2xl shadow-sm"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gray-100 rounded-xl">
                                <LuStethoscope className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                                <p className="text-gray-600">We'll get back to you as soon as possible</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LuUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LuMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                    Subject
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <TbNotes className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-300"
                                    required
                                ></textarea>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="group relative inline-flex items-center justify-center gap-3 w-full px-8 py-4 
                                         bg-gradient-to-br from-primary via-blue-500 to-indigo-600 text-white 
                                         rounded-xl font-semibold shadow-[0_20px_40px_-8px_rgba(79,70,229,0.5)]
                                         hover:shadow-[0_20px_40px_-8px_rgba(79,70,229,0.7)]
                                         overflow-hidden transition-all duration-300"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-primary 
                                              opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <LuMessageSquare className="relative z-10 w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="relative z-10">Send Message</span>
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Map */}
                    <motion.div
                        variants={item}
                        className="bg-white p-8 rounded-2xl shadow-sm"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gray-100 rounded-xl">
                                <LuHospital className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Our Location</h2>
                                <p className="text-gray-600">Visit us at our medical center</p>
                            </div>
                        </div>
                        <div className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7773.479238243908!2d80.24852926581238!3d13.05223892991429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5267089cfab3ab%3A0x53cb1a750d69145f!2sSMAART%20HEALTHCARE!5e0!3m2!1sen!2sin!4v1758168372611!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="grayscale hover:grayscale-0 transition-all duration-500"
                            ></iframe>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

export default Contact
