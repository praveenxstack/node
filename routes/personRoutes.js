const express = require("express");
const router = express.Router();
const Person = require("../models/Person");

router.post("/", (req, res) => {

  const data = req.body;

  const newPerson = new Person(data);
  newPerson.save()
    .then(person => res.status(201).json({"Data saved" : person}))
    .catch(err => res.status(500).json({ "Internal Server Error": err.message }));

});

//get method to fetch all persons
router.get("/", (req, res) => {
  Person.find()
    .then(persons => res.status(200).json(persons))
    .catch(err => res.status(500).json({ "Internal Server Error": err.message }));
});

router.get("/:workType", async(req, res) => {
  try{
    const workType = req.params.workType;
    if(!["waiter", "chef", "manager"].includes(workType)){
      return res.status(400).json({"error": "Invalid work type"});
    } else {
      const results = await Person.find({work: workType});
      res.status(200).json(results);
    }
  }catch(err){
    res.status(500).json({"Internal Server Error": err.message});
  }});

router.put("/:id", async (req, res) => {
  try{
    const personId = req.params.id;
    const updatedData = req.body;

    const response = await Person.findByIdAndUpdate(
      personId,
      updatedData,
      { new: true, runValidators: true }
    );
    // If no person is found with the given ID
    if(!response){
      return res.status(404).json({"error": "Person not found"});
    }

    console.log("Data saved");
    res.status(200).json({"Data updated": response});
  }catch(err){
    return res.status(500).json({"Internal Server Error": err.message});
  }
});

router.delete("/:id", async (req, res) => {
  try{
    const personId = req.params.id;
    const response = await Person.findByIdAndDelete(personId);
    // If no person is found with the given ID
    if(!response){
      return res.status(404).json({"error": "Person not found"});
    }
    console.log("Data deleted");
    res.status(200).json({"Data deleted successfully" : response});
  }
    catch(err){
    return res.status(500).json({"Internal Server Error": err.message});
  }})
  
module.exports = router;
