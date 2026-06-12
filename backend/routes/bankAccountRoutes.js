const express = require('express');
const router = express.Router();
const BankAccount = require('../models/BankAccount');
const Faculty = require('../models/Faculty');
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/bankAccountController');

// Add bank account details
router.post('/', auth, ctrl.addBankAccount );

// Get bank account details for the logged-in faculty
router.get('/', auth, ctrl.getBankAccounts);

module.exports = router;
