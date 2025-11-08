const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    position: { type: String, enum: [ "waiter", "chef", "manager", "bartender", "host", "dishwasher" ], required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    salary: { type: Number, required: true },
    hireDate: { type: Date, default: Date.now },
    employeeId: { type: String, unique: true },
    status: { type: String, enum: ["active", "on-leave", "terminated"], default: "active" },
    shift: { type: String, enum: ["morning", "evening", "night", "flexible"], default: "flexible" },
    emergencyContact: { 
        name: { type: String },
        phone: { type: String },
        relationship: { type: String }
    }
}, { timestamps: true });

// Generate employee ID before saving
EmployeeSchema.pre('save', async function(next) {
    if (!this.employeeId) {
        const count = await mongoose.model('Employee').countDocuments();
        this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;