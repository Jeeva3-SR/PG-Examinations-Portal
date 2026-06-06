import React, { useState } from 'react';

const EvaluatorDetails = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Evaluator Details:', formData);
    alert('Evaluator details submitted successfully!');
    setFormData({
      fullName: '',
      panNumber: '',
      bankAccountNumber: '',
      ifscCode: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Submit Evaluator Details</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN Number
          </label>
          <input
            type="text"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            title="Please enter a valid PAN number (e.g., ABCDE1234F)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Account Number
          </label>
          <input
            type="text"
            name="bankAccountNumber"
            value={formData.bankAccountNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            pattern="[0-9]{9,18}"
            title="Please enter a valid bank account number (9-18 digits)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IFSC Code
          </label>
          <input
            type="text"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
            title="Please enter a valid IFSC code (e.g., SBIN0001234)"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Submit Details
        </button>
      </form>
    </div>
  );
};

export default EvaluatorDetails; 