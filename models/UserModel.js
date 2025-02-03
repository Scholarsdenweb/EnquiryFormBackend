const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    studentContactNumber: {
        type: String,
    
        
    },
    program: {
        type: String,
    },
    courseOfIntrested: {
        type: String,
    },
    schoolName:{
        type: String,
    },
    parentsName: {
        type: String,
    },
    parentsOccupations: {
        type: String,
    },
    parentsContactNumber: {
        type: String,
        required: true,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    howToKnow: {
        type: String,
        
    },
    remarks: {
        type: String,
    },
    intime: {
        type: String,
    },
    enquiryTakenBy: {
        type: String,
    },
    brochureGiven: {
        type: String,
    },

});
const User = mongoose.model("User", UserSchema);

module.exports = User;