import React, { useState } from 'react';

const SignOff = () => {
  const [evaluators, setEvaluators] = useState([
    {
      id: 1,
      name: 'Dr. John Smith',
      pan: 'ABCDE1234F',
      amount: 5000,
      status: 'Pending'
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      pan: 'FGHIJ5678K',
      amount: 4500,
      status: 'Pending'
    },
    {
      id: 3,
      name: 'Dr. Michael Brown',
      pan: 'LMNOP9012Q',
      amount: 4800,
      status: 'Pending'
    },
    {
      id: 4,
      name: 'Dr. Emily Davis',
      pan: 'RSTUV3456W',
      amount: 5200,
      status: 'Pending'
    }
  ]);

  const handleSignOff = (evaluatorId) => {
    setEvaluators(evaluators.map(evaluator => 
      evaluator.id === evaluatorId 
        ? { ...evaluator, status: 'Signed Off' }
        : evaluator
    ));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sign-Off on Evaluator & Remuneration</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evaluator Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PAN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount (₹)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evaluators.map((evaluator) => (
              <tr key={evaluator.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {evaluator.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {evaluator.pan}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{evaluator.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    evaluator.status === 'Signed Off' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {evaluator.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {evaluator.status === 'Pending' && (
                    <button
                      onClick={() => handleSignOff(evaluator.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Sign Off
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SignOff; 