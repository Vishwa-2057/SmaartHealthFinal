import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    lineItems: [{
        description: { type: String, required: true },
        qty: { type: Number, required: true },
        unitPrice: { type: Number, required: true }
    }],
    total: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    invoiceNo: {
        type: Number,
        required: true
    },
    address: {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
    },
    phone: { type: String },
    email: { type: String },
    remarks: { type: String },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
