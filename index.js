const express = require('express');
const app = express();
const cors = require('cors');

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();



// Middleware

app.use(express.json());


const allowedOrigins = ['https://scholarsden.in', 'http://jat.solutions', "https://scholarsdenenquiryform.netlify.app", 'https://www.jat.solutions', 'http://www.jat.solutions', 'https://enquiryformbackend.onrender.com'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));



mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected to MongoDB')).catch((err) => console.log(err));


// Routes

// const authRoutes = require('./routes/authRoutes');
const userRoute = require('./routes/UserRoute');
// const formRoutes = require('./routes/formRoutes');
// const takenByRoutes = require('./routes/takenByRoutes');

// app.use('/auth', authRoutes);


app.use('/api/user', userRoute);

// app.use('/forms', formRoutes);


// app.use('/takenBy', takenByRoutes);


app.listen(5000, () => console.log('Server started on port 5000'));
