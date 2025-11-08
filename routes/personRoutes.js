const express = require("express");
const router = express.Router();
const Employee = require("../models/Person");

// Get all employees with optional filters
router.get("/", async (req, res) => {
  try {
    const { status, position, shift } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (position) filter.position = position;
    if (shift) filter.shift = shift;
    
    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get employees by position (legacy support for workType)
router.get("/:positionType", async (req, res) => {
  try {
    const positionType = req.params.positionType;
    const validPositions = ["waiter", "chef", "manager", "bartender", "host", "dishwasher"];
    
    if (!validPositions.includes(positionType)) {
      return res.status(400).json({ error: "Invalid position type" });
    }
    
    const employees = await Employee.find({ position: positionType });
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ "Internal Server Error": err.message });
  }
});

// Get employee statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: "active" });
    const byPosition = await Employee.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$position", count: { $sum: 1 } } }
    ]);
    const byShift = await Employee.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$shift", count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      totalEmployees,
      byPosition,
      byShift
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new employee
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const newEmployee = new Employee(data);
    const savedEmployee = await newEmployee.save();
    res.status(201).json({ "Data saved": savedEmployee });
  } catch (err) {
    res.status(400).json({ "Internal Server Error": err.message });
  }
});

// Update an employee
router.put("/:id", async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedData = req.body;

    const response = await Employee.findByIdAndUpdate(
      employeeId,
      updatedData,
      { new: true, runValidators: true }
    );
    
    if (!response) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log("Employee data updated");
    res.status(200).json({ "Data updated": response });
  } catch (err) {
    return res.status(500).json({ "Internal Server Error": err.message });
  }
});

// Update employee status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an employee
router.delete("/:id", async (req, res) => {
  try {
    const employeeId = req.params.id;
    const response = await Employee.findByIdAndDelete(employeeId);
    
    if (!response) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    console.log("Employee data deleted");
    res.status(200).json({ "Data deleted successfully": response });
  } catch (err) {
    return res.status(500).json({ "Internal Server Error": err.message });
  }
});

module.exports = router;
