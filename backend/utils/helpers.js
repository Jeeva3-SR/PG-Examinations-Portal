const normalizeEmail = (email) => email.trim().toLowerCase();

const resolveFacultyId = (user) => user.userId || user.employeeId || user._id.toString();

const formatUserResponse = (user) => {
  const facultyId = resolveFacultyId(user);
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    employeeId: user.employeeId,
    bankAccount: user.bankAccount,
    ifscCode: user.ifscCode,
    userId: facultyId,
    facultyId
  };
};

module.exports = { normalizeEmail, resolveFacultyId, formatUserResponse };
