import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const ReleaseClaimLetterHOD = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [letterViewed, setLetterViewed] = useState(false);
    const [letterText, setLetterText] = useState('');
    const [toast, setToast] = useState('');
    const [coordinatorName, setCoordinatorName] = useState('');

    useEffect(() => {
        // Fetch coordinator name on mount
        const fetchCoordinator = async () => {
            try {
                const res = await axios.get('/api/coordinator');
                if (res.data && res.data.name) {
                    setCoordinatorName(res.data.name);
                }
            } catch (err) {
                setCoordinatorName('C. Valliyammai');
            }
        };
        fetchCoordinator();
    }, []);

    const handleViewLetter = async () => {
        setLoading(true);
        setError('');
        setToast('');
        try {
            const res = await axios.get('/api/claims/forwarded-advance-letter');
            const data = res.data;
            if (!data) {
                setError('No forwarded letter found.');
                setLoading(false);
                setLetterViewed(false);
                return;
            }
            const { totalAmount, formattedMonthYear } = data;
            const letter = `From\n${coordinatorName || 'C. Valliyammai'}\nPG Chief Superintendent\nDepartment of Computer Science and Engineering\nAnna University\nChennai 600025\n\nTo\nHead of the Department\nDepartment of Computer Science and Engineering\nAnna University\nChennai 600025\n\nDear Ma'am,\n\nSub: Request to release advance claim for conduct of PG Examination – reg.\n\nI kindly request you to release the advance claim amount of Rs. ${totalAmount.toLocaleString()}/-, which was credited from ACOE, Anna University for the PG Examinations ${formattedMonthYear}.\n\nThank you\n\n(${coordinatorName || 'Dr. C. Valliyammai'})`;
            setLetterText(letter);
            setLetterViewed(true);
            const newWindow = window.open();
            newWindow.document.write('<pre>' + letter.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>');
            newWindow.document.title = 'Release Advance Claim Letter';
            setToast('Letter loaded!');
            setTimeout(() => setToast(''), 2000);
        } catch (err) {
            setError('Failed to fetch or generate letter.');
            setLetterViewed(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/claims/forwarded-advance-letter');
            const data = res.data;
            if (!data) {
                setError('No forwarded letter found.');
                setLoading(false);
                return;
            }
            const { totalAmount, formattedMonthYear } = data;
            const doc = new jsPDF();
            doc.setFont('times', 'normal');
            doc.setFontSize(12);
            let y = 20;
            const margin = 20;
            const fromAddress = [
                'From',
                coordinatorName || 'C. Valliyammai',
                'PG Chief Superintendent',
                'Department of Computer Science and Engineering',
                'Anna University',
                'Chennai 600025'
            ];
            fromAddress.forEach(line => { doc.text(line, margin, y); y += 7; });
            y += 7;
            const toAddress = [
                'To',
                'Head of the Department',
                'Department of Computer Science and Engineering',
                'Anna University',
                'Chennai 600025'
            ];
            toAddress.forEach(line => { doc.text(line, margin, y); y += 7; });
            y += 7;
            doc.text("Dear Ma'am,", margin, y); y += 14;
            doc.setFont('times', 'bold');
            doc.text('Sub:', margin, y);
            doc.setFont('times', 'normal');
            doc.text('Request to release advance claim for conduct of PG Examination – reg.', margin + 10, y); y += 14;
            const body = `I kindly request you to release the advance claim amount of Rs. ${totalAmount.toLocaleString()}/-, which was credited from ACOE, Anna University for the PG Examinations ${formattedMonthYear}.`;
            const splitBody = doc.splitTextToSize(body, 170);
            doc.text(splitBody, margin, y);
            y += splitBody.length * 7 + 14;
            doc.text('Thank you', margin, y); y += 21;
            doc.text(`(${coordinatorName || 'Dr. C. Valliyammai'})`, margin, y);
            doc.save('Release-Advance-Claim-Letter.pdf');
            setToast('Letter downloaded!');
            setTimeout(() => setToast(''), 2000);
        } catch (err) {
            setError('Failed to fetch or generate letter.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="p-6 bg-white shadow-md rounded-lg mt-6">
            <h2 className="text-xl font-semibold mb-4">Release Advance Claim Letter</h2>
            <button
                onClick={handleViewLetter}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
            >
                {loading ? 'Loading...' : 'View'}
            </button>
            <button
                onClick={handleDownloadPdf}
                disabled={loading || !letterViewed}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {loading ? 'Downloading...' : 'Download PDF'}
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {toast && <div className="fixed top-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">{toast}</div>}
        </div>
    );
};

export default ReleaseClaimLetterHOD; 