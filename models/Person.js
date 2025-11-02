const mongoose = require("mongoose");

const PersonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    work: { type: String, enum: [ "waiter", "chef", "manager" ], required: true },
    mobile: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    salary: { type: Number, required: true }
});
const Person = mongoose.model("Person", PersonSchema);
module.exports = Person;