const mongoose = require('mongoose');
const Faculty = require('../models/Faculty');
require('dotenv').config();

const facultyList = [
  {
    facultyId: "F001",
    name: "Dr. Uma Maheswari",
    email: "uma@cse.ac.in",
    course: "Data Warehousing and Mining",
    courseCode: "CP3351",
    position: "Professor",
    contactInfo: { email: "uma@cse.ac.in", phone: "1234567890" },
    areasOfExpertise: ["Data Warehousing", "Data Mining"],
    classesHandled: [
      { subject: "Data Warehousing", semester: "6", section: "A", year: "2023" }
    ],
    dob: new Date("1975-05-10"),
    dateOfJoining: new Date("2005-07-01"),
    department: "CSE",
    gender: "Female",
    profilePicUrl: "",
    isActive: true,
    scaleOfPay: "UGC Scale",
    presentPay: "150000",
    natureOfAppointment: "Permanent"
  },
  {
    facultyId: "F002",
    name: "Dr. Rajesh Kumar",
    email: "rajesh@cse.ac.in",
    course: "Design Patterns",
    courseCode: "CP3061",
    position: "Associate Professor",
    contactInfo: { email: "rajesh@cse.ac.in", phone: "1234567891" },
    areasOfExpertise: ["Design Patterns", "Software Engineering"],
    classesHandled: [
      { subject: "Design Patterns", semester: "5", section: "B", year: "2023" }
    ],
    dob: new Date("1978-08-15"),
    dateOfJoining: new Date("2008-08-01"),
    department: "CSE",
    gender: "Male",
    profilePicUrl: "",
    isActive: true,
    scaleOfPay: "UGC Scale",
    presentPay: "140000",
    natureOfAppointment: "Permanent"
  },
  {
    facultyId: "F003",
    name: "Dr. Priya Sharma",
    email: "priya@cse.ac.in",
    course: "PERT/CPM",
    courseCode: "OR3003",
    position: "Assistant Professor",
    contactInfo: { email: "priya@cse.ac.in", phone: "1234567892" },
    areasOfExpertise: ["Operations Research"],
    classesHandled: [
      { subject: "PERT/CPM", semester: "7", section: "A", year: "2023" }
    ],
    dob: new Date("1980-11-20"),
    dateOfJoining: new Date("2010-09-01"),
    department: "OR",
    gender: "Female",
    profilePicUrl: "",
    isActive: true,
    scaleOfPay: "State Scale",
    presentPay: "120000",
    natureOfAppointment: "Probationer"
  },
  {
    facultyId: "F004",
    name: "Dr. Arun Verma",
    email: "arun@cse.ac.in",
    course: "Supply Chain Management",
    courseCode: "OR3005",
    position: "Professor",
    contactInfo: { email: "arun@cse.ac.in", phone: "1234567893" },
    areasOfExpertise: ["Supply Chain", "Logistics"],
    classesHandled: [
      { subject: "Supply Chain Management", semester: "8", section: "C", year: "2023" }
    ],
    dob: new Date("1972-03-12"),
    dateOfJoining: new Date("2000-01-01"),
    department: "OR",
    gender: "Male",
    profilePicUrl: "",
    isActive: true,
    scaleOfPay: "State Scale",
    presentPay: "160000",
    natureOfAppointment: "Permanent"
  },
  {
    facultyId: "F005",
    name: "Dr. Meera Patel",
    email: "meera@cse.ac.in",
    course: "Cyber Security",
    courseCode: "CP3351",
    position: "Assistant Professor",
    contactInfo: { email: "meera@cse.ac.in", phone: "1234567894" },
    areasOfExpertise: ["Cyber Security"],
    classesHandled: [
      { subject: "Cyber Security", semester: "6", section: "B", year: "2023" }
    ],
    dob: new Date("1985-02-25"),
    dateOfJoining: new Date("2015-06-01"),
    department: "CSE",
    gender: "Female",
    profilePicUrl: "",
    isActive: true,
    scaleOfPay: "UGC Scale",
    presentPay: "110000",
    natureOfAppointment: "Temporary"
  },
  {
    facultyId: "F006",
    name: "Dr. Suresh Kumar",
    email: "suresh@cse.ac.in",
    course: "DevOps",
    courseCode: "CP3061",
    position: "Associate Professor",
    contactInfo: { email: "suresh@cse.ac.in", phone: "1234567895" },
    areasOfExpertise: ["DevOps", "Cloud Computing"],
    classesHandled: [
      { subject: "DevOps", semester: "5", section: "A", year: "2023" }
    ],
    dob: new Date("1979-09-30"),
    dateOfJoining: new Date("2009-07-01"),
    department: "CSE",
    gender: "Male",
    profilePicUrl: "",
    isActive: true,
    scaleOfPay: "UGC Scale",
    presentPay: "130000",
    natureOfAppointment: "Approved Probationer"
  },
  {
    facultyId: "F007",
    name: "Dr. Anjali Singh",
    email: "anjali@cse.ac.in",
    course: "Formal Specification Techniques",
    courseCode: "CP3064",
    position: "Assistant Professor",
    contactInfo: { email: "anjali@cse.ac.in", phone: "1234567896" },
    areasOfExpertise: ["Formal Methods"],
    classesHandled: [
      { subject: "Formal Specification Techniques", semester: "7", section: "B", year: "2023" }
    ],
    dob: new Date("1983-07-18"),
    dateOfJoining: new Date("2012-08-01"),
    department: "CSE",
    gender: "Female",
    profilePicUrl: "",
    isActive: true,
    scaleOfPay: "State Scale",
    presentPay: "125000",
    natureOfAppointment: "Probationer"
  },
  {
    facultyId: "F008",
    name: "Dr. Vikram Malhotra",
    email: "vikram@cse.ac.in",
    course: "UI/UX Design",
    courseCode: "CP3079",
    position: "Professor",
    contactInfo: { email: "vikram@cse.ac.in", phone: "1234567897" },
    areasOfExpertise: ["UI/UX", "Design"],
    classesHandled: [
      { subject: "UI/UX Design", semester: "8", section: "A", year: "2023" }
    ],
    dob: new Date("1970-12-05"),
    dateOfJoining: new Date("1998-06-01"),
    department: "CSE",
    gender: "Male",
    profilePicUrl: "",
    isActive: true,
    scaleOfPay: "UGC Scale",
    presentPay: "170000",
    natureOfAppointment: "Permanent"
  }
];

const initializeFaculty = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam-management');
    console.log('Connected to MongoDB');

    // Clear existing faculty data
    await Faculty.deleteMany({});
    console.log('Cleared existing faculty data');

    // Insert new faculty data
    const result = await Faculty.insertMany(facultyList);
    console.log(`Successfully inserted ${result.length} faculty members`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error initializing faculty data:', error);
    process.exit(1);
  }
};

initializeFaculty(); 