import React from 'react';

const handleRequestClaim = () => {
  alert('Release claim request sent successfully.');
};

const ReleaseClaim = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Request Release Claim</h2>
      <div className="text-center">
        <p className="text-gray-600 mb-6">
          Click the button below to request the release of your claim.
        </p>
        <button
          onClick={handleRequestClaim}
          className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
        >
          Request Claim
        </button>
      </div>
    </div>
  );
};

export default ReleaseClaim; 