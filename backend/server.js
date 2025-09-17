import express from "express";
import cors from 'cors';
import 'dotenv/config';
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import patientRouter from "./routes/patientRoute.js";
import appointmentRouter from './routes/appointmentRoute.js';
import appointmentBookingRoute from './routes/appointmentBookingRoute.js';
import clinicalInfoRouter from './routes/clinicalInfoRoute.js';
import errorMiddleware from './middleware/error.js';

// Import models to ensure they are registered
import './models/doctorModel.js';
import './models/appointmentModel.js';
import './models/userModel.js';
import './models/Patient.js';

// app config
const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(express.json());

// Serve uploads folder as static for images
app.use('/uploads', express.static('uploads'));

// Configure CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174','https://extraordinary-gaufre-2fb3ba.netlify.app/', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'atoken', 'dtoken', 'token'],
  exposedHeaders: ['Authorization', 'atoken', 'dtoken', 'token']
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests for all routes
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

let retryCount = 0;
const maxRetries = 5;
let server = null;

// Initialize connections with retry logic
const initializeApp = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Cloudinary
    connectCloudinary();

    // Reset retry count on successful connection
    retryCount = 0;

    // Start server only after successful connections
    server = app.listen(port, () => {
      console.log(`Server started on PORT:${port}`);
      console.log(`CORS enabled for origins: ${corsOptions.origin.join(', ')}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to initialize app:', error);

    if (retryCount < maxRetries) {
      retryCount++;
      console.log(`Retrying connection... Attempt ${retryCount} of ${maxRetries}`);
      setTimeout(initializeApp, 5000); // Wait 5 seconds before retrying
    } else {
      console.error('Max retries reached. Exiting...');
      process.exit(1);
    }
  }
}

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/patient", patientRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/appointment-booking", appointmentBookingRoute);
app.use("/api/clinical-info", clinicalInfoRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

// Error Middleware
app.use(errorMiddleware);

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Closing server...');
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

initializeApp();
