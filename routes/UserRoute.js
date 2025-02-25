const express = require("express");
const User = require("../models/UserModel");
const OtpStore = require("../models/OtpStore");
const axios = require("axios")

const router = express.Router();


const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/authentication");



router.get("/getUserbyToken", verifyToken(), async (req, res) => {
  try {
    console.log("req.user from getUserbyToken", req.user);
    const user = await User.findById(req.user._id);
    console.log("req.user from getUserbyToken", user);
    res.status(200).send(user);

  } catch (error) {
    res.status(500).send("Internal Server Error");
  }

})


router.get("/getTokenNo", async (req, res) => {
  try{
    const tokenNo = await User.find().countDocuments();
    res.status(200).json({tokenNo});
  }catch(error){
    res.status(500).json("Internal Server Error");
    console.log("Error in getTokenNo", error)

  }


})

router.post("/", async (req, res) => {

  try {
    const { studentName, email, fatherContactNumber, fatherName } = req.body;

    // Check if user already exists
    // const user = await User.findOne({ $or: [{ fatherContactNumber }, { email }] });

    // if (user) {
    //   return res.status(400).send("User already exists");
    // }



    // Create new user
    const newUser = new User({
      studentName,
      email,
      fatherContactNumber,
      fatherName

    });
    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { _id: newUser._id, email: newUser.email, fatherContactNumber: newUser.fatherContactNumber },
      JWT_SECRET,
    );
    res.status(200).send({ token, newUser });
  } catch (error) {
    console.error("Error in signup:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

);

router.patch("/putFormData", verifyToken(), async (req, res) => {

  try {
    const { studentContactNumber, program, courseOfIntrested,
      schoolName,
      fatherName,
      fatherOccupations,
      fatherContactNumber,
      city,
      state,
      howToKnow,
      remarks,
      intime,
      enquiryTakenBy,
      brochureGiven } = req.body;
    const { _id } = req.user;

    console.log("req.body", req.body)


    console.log("req.user", req.user);


    const user = await User.findOneAndUpdate(
      { _id },
      {
        studentContactNumber,
        program,
        courseOfIntrested,
        schoolName,
        fatherName,
        fatherOccupations,
        fatherContactNumber,
        city,
        state,
        howToKnow,
        remarks,
        intime,
        enquiryTakenBy,
        brochureGiven,
      },
      { new: true }
    );
    console.log("user", user);

    res.status(200).send({ user });
  } catch (error) {
    console.error("Error in signup:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

);



// router.post("/sendVerification", async (req, res) => {
//   try {
//     const { mobileNumber } = req.body;
//     console.log("req.body from sendVerification", req.body)


//     if (!mobileNumber) {
//       return res.status(400).json({ success: false, message: 'Mobile number is required.' });
//     }



//     console.log(mobileNumber);
//     console.log(process.env.FAST2SMS_API_KEY);

//     // Store the OTP in the database
//     const existingOtp = await OtpStore.findOne({ mobileNumber });

//     if (existingOtp) {
//       return res.status(400).json({ success: false, message: 'An OTP has already been sent to this number.' });
//     }

//     // Generate a random 4-digit OTP
//     const otp = Math.floor(1000 + Math.random() * 9000);

//     const options = {
//       method: 'POST',
//       url: 'https://www.fast2sms.com/dev/bulkV2',
//       headers: {
//         'authorization': `${process.env.FAST2SMS_API_KEY}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       data: new URLSearchParams({
//         variables_values: otp,
//         route: 'otp',
//         numbers: mobileNumber,
//       }),
//     };
//     let otpStoreData;
//     // Make the API request to Fast2SMS
//     const response = await axios.post(options.url, options.data, { headers: options.headers });

//     console.log(response.data);

//     // Store the OTP in the database
//     // const existingOtp = await OtpStore.findOne({ mobileNumber });

//     // if (existingOtp) {
//     //   // Update the existing document if an OTP is already stored for this number
//     //   existingOtp.otp = otp;
//     //   existingOtp.createdAt = new Date();
//     //   await existingOtp.save();
//     // } else {
//       // Create a new document if no OTP exists for this number
//       otpStoreData = await OtpStore.create({ otp, mobileNumber });
//     // }

//     // Construct and send a custom response
//     return res.status(200).json({
//       success: true,
//       message: 'OTP sent successfully',
//       smsResponse: response.data, // Include the response from Fast2SMS
//       otpStoreData
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to send OTP.',
//       error: error.message, // Include the error message for easier debugging
//     });
//   }
// });


router.post("/sendVerification", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    console.log("req.body from sendVerification", req.body);

    if (!mobileNumber) {
      return res.status(400).json({ success: false, message: 'Mobile number is required.' });
    }

    console.log(mobileNumber);
    console.log(process.env.FAST2SMS_API_KEY);

    // Check if an OTP was already sent within the last 5 minutes
    const existingOtp = await OtpStore.findOne({ mobileNumber });

    if (existingOtp) {
      const currentTime = new Date();
      const otpCreatedTime = new Date(existingOtp.createdAt);
      const timeDifference = (currentTime - otpCreatedTime) / 1000; // Difference in seconds

      // If OTP was sent less than 5 minutes ago
      if (timeDifference < 300) {
        return res.status(400).json({
          success: false,
          message: `An OTP has already been sent to this number. Please wait ${Math.ceil(300 - timeDifference)} sec before requesting another.`,

        });
      }
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    const options = {
      method: 'POST',
      url: 'https://www.fast2sms.com/dev/bulkV2',
      headers: {
        'authorization': `${process.env.FAST2SMS_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams({
        variables_values: otp,
        route: 'otp',
        numbers: mobileNumber,
      }),
    };

    // Make the API request to Fast2SMS
    const response = await axios.post(options.url, options.data, { headers: options.headers });

    console.log(response.data);

    // Save the OTP in the database
    if (existingOtp) {
      // Update the existing record
      existingOtp.otp = otp;
      existingOtp.createdAt = new Date(); // Update the timestamp
      await existingOtp.save();
    } else {
      // Create a new record
      await OtpStore.create({ otp, mobileNumber, createdAt: new Date() });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      smsResponse: response.data, // Include the response from Fast2SMS
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP.',
      error: error.message, // Include the error message for easier debugging
    });
  }
});






router.post("/verifyNumber", async (req, res) => {
  const { mobileNumber, otp } = req.body;
  try {
    console.log("req.body from verifyNumber", req.body);

    const existingOtp = await OtpStore.findOne({ mobileNumber });
    console.log("existingOtp from verifyNumber", existingOtp);

    if (!existingOtp) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
    }

    if (existingOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    console.log("existingOtp from verifyNumber", existingOtp);



    const currentTime = new Date();

    if (currentTime > existingOtp.createdAt + 300) {
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }
    const deleteData = await OtpStore.deleteOne({ mobileNumber });
    return res.status(200).json({ success: true, message: 'OTP verification successful.' });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP.', error: error.message });
  }
})


module.exports = router;
