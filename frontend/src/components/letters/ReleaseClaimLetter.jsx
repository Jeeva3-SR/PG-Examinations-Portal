import React, { useState } from 'react';
import api from '../../lib/api';
import jsPDF from 'jspdf';
// import { useNavigate } from 'react-router-dom';

const ReleaseClaimLetter = () => {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    // const navigate = useNavigate();

    const generateAndForwardPdf = async () => {
        setLoading(true);
        setToast(null);
        try {
            const res = await api.get('/api/claims/advance-details');
            const data = res.data;
            if (!data) {
                setToast({ type: 'error', message: 'Could not fetch letter data.' });
                setLoading(false);
                return;
            }
            // Forward the letter data to the backend
            await api.post('/api/claims/forward-advance-letter', {
                totalAmount: data.totalAmount,
                formattedMonthYear: data.formattedMonthYear
            });
            setToast({ type: 'success', message: 'Letter forwarded to HOD successfully!' });
            // Do NOT redirect
        } catch (err) {
            console.error('Failed to forward letter:', err);
            setToast({ type: 'error', message: 'Failed to forward letter. See console for details.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg mt-6 relative">
            <h2 className="text-xl font-semibold mb-4">Release Advance Claim Letter</h2>
            <p className="mb-6 text-gray-600"></p>
            <button
                onClick={generateAndForwardPdf}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {loading ? 'Forwarding...' : 'Generate & Forward to HOD'}
            </button>
            {toast && (
                <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg z-50 transition-all ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default ReleaseClaimLetter; 