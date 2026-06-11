const BankAccount = require('../models/BankAccount');
const Faculty = require('../models/Faculty');

exports.addBankAccount = async (req, res) => {
  try {
    const { fullName, panNumber, bankAccountNumber, ifscCode } = req.body;

    if (!fullName || !panNumber || !bankAccountNumber || !ifscCode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const facultyId = req.user.userId || req.user.employeeId;

    const bankAccount = new BankAccount({
      facultyId,
      fullName,
      panNumber: panNumber.toUpperCase(),
      bankAccountNumber,
      ifscCode: ifscCode.toUpperCase()
    });

    const saved = await bankAccount.save();

    const faculty = await Faculty.findOne({ facultyId });
    if (faculty) {
      faculty.bankAccounts.push(saved._id);
      await faculty.save();
    }

    res.status(201).json({ message: 'Bank account details saved successfully', bankAccount: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getBankAccounts = async (req, res) => {
  try {
    const facultyId = req.user.userId || req.user.employeeId;
    const accounts = await BankAccount.find({ facultyId }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}