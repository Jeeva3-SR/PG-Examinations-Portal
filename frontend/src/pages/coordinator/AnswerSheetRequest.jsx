import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReleaseClaimLetter from '../../components/ReleaseClaimLetter';


const AnswerSheetRequest = () => {
    const [loading, setLoading] = useState(false);

    // State for Evaluation Letter
    const [evalLetter, setEvalLetter] = useState(null);
    const [evalLetterStatus, setEvalLetterStatus] = useState('Not Generated');
    const [evalLoading, setEvalLoading] = useState(false);
    const [evalError, setEvalError] = useState('');

    // State for Advance Requisition Letter
    const [advReqLetter, setAdvReqLetter] = useState(null);
    const [advReqLetterStatus, setAdvReqLetterStatus] = useState('Not Generated');
    const [advReqLoading, setAdvReqLoading] = useState(false);
    const [advReqError, setAdvReqError] = useState('');
    
    // Coordinator state
    const [coordinator, setCoordinator] = useState({ name: '', designation: '' });

    // Fetch status of letters on component mount and poll for updates
    useEffect(() => {
        // Fetch coordinator details
        const fetchCoordinator = async () => {
            try {
                const res = await api.get('/api/coordinator');
                if (res.data) {
                    setCoordinator({ name: res.data.name, designation: res.data.designation });
                }
            } catch (err) {
                setCoordinator({ name: '', designation: '' });
            }
        };
        fetchCoordinator();
        const fetchLetterStatus = async () => {
            try {
                // Check for latest evaluation letter
                const evalRes = await api.get('/api/evaluation-letter/latest');
                if (evalRes.data) {
                    setEvalLetter(evalRes.data);
                    setEvalLetterStatus(evalRes.data.status);
                }
            } catch (error) {
                // Ignore 404 errors, means no letter exists
                if (error.response?.status !== 404) {
                    console.error('Failed to fetch evaluation letter status:', error);
                }
            }
            try {
                // Check for latest advance requisition letter
                const advReqRes = await api.get('/api/letters/advance-requisition/latest');
                if (advReqRes.data) {
                    setAdvReqLetter(advReqRes.data);
                    setAdvReqLetterStatus(advReqRes.data.status);
                }
            } catch (error) {
                if (error.response?.status !== 404) {
                    console.error('Failed to fetch advance requisition letter status:', error);
                }
            }
        };

        fetchLetterStatus();
        const interval = setInterval(fetchLetterStatus, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);


    const generatePDF = async () => {
        setLoading(true);
        try {
            // Fetch the latest session to determine the exam month
            const sessionRes = await api.get('/api/sessions');
            const sessions = sessionRes.data;
            let examMonth = '';
            if (sessions && sessions.length > 0) {
                // Find the latest session by date
                const latestSession = sessions.reduce((latest, curr) => {
                    return new Date(curr.date) > new Date(latest.date) ? curr : latest;
                }, sessions[0]);
                const examDate = new Date(latestSession.date);
                examMonth = examDate.toLocaleString('default', { month: 'long' }).toUpperCase() + ' ' + examDate.getFullYear();
            }

            const response = await api.get('/api/student-inputs/specialization-summary');
            const summaryData = response.data;
            
            const doc = new jsPDF();

            const specializations = [
                "M.E. Computer Science and Engineering",
                "M.E. Software Engineering",
                "M.E. CSE (Specialization in Big Data Analytics)",
                "M.E. Computer Science and Engineering (OR)",
                "Ph. D"
            ];

            const bySpecialization = summaryData.bySpecialization || [];
            const totalArrearData = summaryData.totalArrear || [];
            let grandTotal = 0;

            const table1Data = specializations.map((spec, index) => {
                const found = bySpecialization.find(item => item._id === spec);
                const totalSheets = found ? found.totalSheets : 0;
                grandTotal += totalSheets;
                return [`${index + 1}. ${spec}`, totalSheets];
            });

            const arrearTotal = totalArrearData.length > 0 ? totalArrearData[0].totalArrearSheets : 0;
            grandTotal += arrearTotal;
            table1Data.push([`${specializations.length + 1}. Arrear`, arrearTotal]);
            table1Data.push(['Total', grandTotal]);

            const coversNeeded = Math.ceil(grandTotal / 25);
            const table2Data = [
                ['1. Question Paper (25 pack)', coversNeeded],
                ['2. Answer Sheet (25 pack)', coversNeeded],
            ];

            // doc.addImage(logo, 'PNG', 15, 10, 20, 20); // Commented out, needs a valid logo
            doc.setFont('times', 'bold');
            doc.setFontSize(12);
            doc.text('DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING', 105, 15, { align: 'center' });
            doc.text('COLLEGE OF ENGINEERING, GUINDY CAMPUS', 105, 22, { align: 'center' });
            doc.text('ANNA UNIVERSITY:: CHENNAI - 600 025.', 105, 29, { align: 'center' });
            doc.setFont('times', 'bold');
            doc.text(coordinator.name || 'Dr. C. Valliyammai, Professor', 15, 40);
            doc.text('Chief Superintendent (P.G.Exams)', 15, 45);
            doc.setFont('times', 'normal');
            doc.text(`Date: ${new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}`, 185, 50, { align: 'right' });
            doc.setFont('times', 'bold');
            doc.text('To', 15, 60);
            doc.setFont('times', 'normal');
            doc.text('The Additional Controller of Examinations', 25, 67);
            doc.text('University Departments', 25, 72);
            doc.text('Anna University', 25, 77);
            doc.text('Chennai 600 025.', 25, 82);
            doc.text('Through Proper Channel', 105, 90, { align: 'center' });
            doc.setFont('times', 'bold');
            doc.text('Respected Madam,', 15, 100);
            doc.text(`Sub: PG (F.T) / Ph.D – End Semester Examinations – ${examMonth}`, 30, 110);
            doc.text('Requesting Answer Sheets – Covers-Reg.', 30, 115);
            doc.setFont('times', 'normal');
            const bodyText = `I hereby request you to issue the required number of answer sheets and covers for the conduct of PG. (F.T) / Ph.D Program Examinations during ${examMonth} as given below:`;
            doc.text(bodyText, 15, 125, { maxWidth: 180 });
            
            autoTable(doc, {
                startY: 140,
                head: [['Courses', 'No. of answer sheets needed']],
                body: table1Data,
                theme: 'grid',
                headStyles: { font: 'times', fontStyle: 'bold', halign: 'center' },
                bodyStyles: { font: 'times', fontStyle: 'normal' },
            });
            
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 10,
                head: [['Covers', 'No. of covers needed']],
                body: table2Data,
                theme: 'grid',
                headStyles: { font: 'times', fontStyle: 'bold', halign: 'center' },
                bodyStyles: { font: 'times', fontStyle: 'normal' },
            });

            doc.text('Thanking you', 15, doc.lastAutoTable.finalY + 20);
            doc.text('Yours faithfully', 165, doc.lastAutoTable.finalY + 30, { align: 'center' });
            doc.setFont('times', 'bold');
            doc.text(coordinator.name || 'Dr. C. Valliammal', 165, doc.lastAutoTable.finalY + 50, { align: 'center' });
            doc.text('Chief Superintendent (P.G.Exams)', 165, doc.lastAutoTable.finalY + 55, { align: 'center' });
            doc.save('Answer_Sheet_Request.pdf');

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. See console for details.');
        } finally {
            setLoading(false);
        }
    };

    // Generate Evaluation Letter
    const handleGenerateEvalLetter = async () => {
        setEvalLoading(true);
        setEvalError('');
        try {
            const res = await api.get('/api/evaluation-letter');
            setEvalLetter({ letterText: res.data.letterText, status: 'generated' });
            setEvalLetterStatus('Ready to Forward');
        } catch (err) {
            setEvalError('Failed to generate evaluation letter.');
        } finally {
            setEvalLoading(false);
        }
    };

    // Forward Evaluation Letter
    const handleForwardEvalLetter = async () => {
        setEvalLoading(true);
        setEvalError('');
        try {
            await api.post('/api/evaluation-letter/forward', { letterText: evalLetter.letterText });
            setEvalLetterStatus('pending');
        } catch (err) {
            setEvalError('Failed to forward evaluation letter.');
        } finally {
            setEvalLoading(false);
        }
    };

    const handleDownloadEvalLetter = () => {
        if (!evalLetter || !evalLetter.letterText) return;

        try {
            const doc = new jsPDF();
            const margin = 20;
            let y = margin;
            doc.setFont('Times', '');
            doc.setFontSize(12);

            const lines = evalLetter.letterText.split('\n');

            // Find the start of the table and the start of the post-table text ("Thank you")
            const tableStartIndex = lines.findIndex(line => line.startsWith('Course Code'));
            const thankYouIndex = lines.findIndex(line => line.trim().startsWith('Thank you'));

            // Text before the table
            const preTableLines = lines.slice(0, tableStartIndex);
            preTableLines.forEach(line => {
                doc.text(line, margin, y);
                y += 8;
            });
            y += 4; // Extra space before table

            // The actual data lines are between the header and the "Thank you" line
            const tableDataLines = lines.slice(tableStartIndex + 2, thankYouIndex).filter(l => l.trim());

            const tableData = tableDataLines.map(row => {
                // Use precise substring indices based on backend padEnd()
                const courseCode = row.substring(0, 8).trim();
                const courseTitle = row.substring(9, 49).trim();
                const facultyName = row.substring(50, 75).trim();
                const facultyId = row.substring(76).trim();
                return [courseCode, courseTitle, facultyName, facultyId];
            });

            autoTable(doc, {
                head: [['Course Code', 'Course Title', 'Faculty Name', 'Faculty ID']],
                body: tableData,
                startY: y,
                theme: 'grid', // Use a grid theme for clear borders
                styles: { font: 'times', fontSize: 11, cellPadding: 2 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 70 },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 'auto' },
                },
            });

            let finalY = doc.lastAutoTable.finalY + 12;

            // Text after the table
            if (thankYouIndex > -1) {
                const postTableLines = lines.slice(thankYouIndex);
                postTableLines.forEach(line => {
                    doc.text(line, margin, finalY);
                    finalY += 8;
                });
            }

            doc.save('Evaluation_Letter_Approved.pdf');
        } catch (error) {
            console.error('Error generating evaluation letter PDF:', error);
            setEvalError('Failed to generate PDF.');
        }
    };

    // Generate Advance Requisition Letter
    const handleGenerateAdvReqLetter = async () => {
        setAdvReqLoading(true);
        setAdvReqError('');
        try {
            const res = await api.get('/api/letters/advance-claim');
            const data = res.data;
            
            // Construct the full, detailed letter text for viewing
            const letterText = `Date: ${data.date}\n\n` +
                `From\n` +
                `Head of the Department\n` +
                `Department of Computer Science and Engineering\n` +
                `Anna University\n` +
                `Chennai-25\n\n` +
                `To\n` +
                `The ACOE\n` +
                `Anna University\n` +
                `Chennai-25\n\n` +
                `Respected Madam,\n\n` +
                `Sub: Requisition for advance for conducting PG Examination – Reg.\n\n` +
                `Herewith, enclosing the advance amount needed for conducting PG Examination.\n\n` +
                `Other Expenses: Rs. ${data.otherExpensesAmount}\n` +
                `Misc. Expenses: Rs. ${data.miscExpensesAmount}\n` +
                `External Examiner (Thesis + Viva): Rs. ${data.thesisVivaAmount}\n` +
                `External Examiner (TA/DA): Rs. ${data.taDaAmount}\n` +
                `Total Amount: Rs. ${data.totalAmount}\n\n` +
                `Yours Sincerely,\n` +
                `Head of the Department`;

            setAdvReqLetter({ letterText, status: 'generated' });
            setAdvReqLetterStatus('Ready to Forward');
        } catch (err) {
            setAdvReqError('Failed to generate advance requisition letter.');
        } finally {
            setAdvReqLoading(false);
        }
    };

    // Forward Advance Requisition Letter
    const handleForwardAdvReqLetter = async () => {
        setAdvReqLoading(true);
        setAdvReqError('');
        try {
            await api.post('/api/letters/advance-requisition/forward', { letterText: advReqLetter.letterText });
            setAdvReqLetterStatus('pending');
        } catch (err) {
            setAdvReqError('Failed to forward advance requisition letter.');
        } finally {
            setAdvReqLoading(false);
        }
    };
    
    const handleDownloadAdvReqLetter = async () => {
        if (!advReqLetter || advReqLetter.status !== 'approved') {
            setAdvReqError('Letter must be approved to download.');
            return;
        }
        
        setAdvReqLoading(true);
        setAdvReqError('');

        try {
            // Re-fetch the structured data to ensure the PDF is built with the original values
            const res = await api.get('/api/letters/advance-claim');
            const data = res.data;

            const doc = new jsPDF();
            const margin = 20;
            let y = margin;

            doc.setFont('Times', 'normal');
            doc.setFontSize(12);

            // Reconstruct the letter with proper formatting
            doc.text(`Date: ${data.date}`, 190, y, { align: 'right' });
            y += 15;
            
            doc.text('From', margin, y); y += 6;
            doc.text('Head of the Department', margin, y); y += 6;
            doc.text('Department of Computer Science and Engineering', margin, y); y += 6;
            doc.text('Anna University', margin, y); y += 6;
            doc.text('Chennai-25', margin, y); y += 12;

            doc.text('To', margin, y); y += 6;
            doc.text('The ACOE', margin, y); y += 6;
            doc.text('Anna University', margin, y); y += 6;
            doc.text('Chennai-25', margin, y); y += 12;

            doc.setFont('Times', 'bold');
            doc.text('Respected Madam,', margin, y); y += 10;
            doc.text('Sub: Requisition for advance for conducting PG Examination – Reg.', margin, y); y += 10;
            doc.setFont('Times', 'normal');

            doc.text('Herewith, enclosing the advance amount needed for conducting PG Examination.', margin, y); y += 15;

            // Create a table for the expense details
            const tableData = [
                ['Other Expenses', `Rs. ${data.otherExpensesAmount}`],
                ['Misc. Expenses', `Rs. ${data.miscExpensesAmount}`],
                ['External Examiner (Thesis + Viva)', `Rs. ${data.thesisVivaAmount}`],
                ['External Examiner (TA/DA)', `Rs. ${data.taDaAmount}`],
                ['Total Amount', `Rs. ${data.totalAmount}`]
            ];
            
            autoTable(doc, {
                head: [['Expense Detail', 'Amount']],
                body: tableData,
                startY: y,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            });

            let finalY = doc.lastAutoTable.finalY + 15;
            
            doc.text('Yours Sincerely,', margin, finalY);
            finalY += 15;
            doc.text('Head of the Department', margin, finalY);

            // Add the approval text at the very end
            finalY += 20;
            doc.setFont('Times', 'bold');
            doc.text('Approved by Head of the Department', margin, finalY);

            doc.save('Advance_Requisition_Letter_Approved.pdf');

        } catch (error) {
            console.error('Error generating advance requisition letter PDF:', error);
            setAdvReqError('Failed to generate PDF.');
        } finally {
            setAdvReqLoading(false);
        }
    };

    const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <span className="mr-2">🏠</span> },
  { path: '/sessions', label: 'Sessions', icon: <span className="mr-2">📅</span> },
  { path: '/student-input', label: 'Student Input', icon: <span className="mr-2">👨‍🎓</span> },
  { path: '/assign-qpsetter', label: 'Assign QP Setter', icon: <span className="mr-2">📝</span> },
  { path: '/dashboard/seating-arrangement', label: 'Seating Arrangement', icon: <span className="mr-2">🪑</span> },
  { path: '/duties', label: 'Duties', icon: <span className="mr-2">📋</span> },
  { path: '/claims', label: 'Claims', icon: <span className="mr-2">💰</span> },
  { path: '/letters', label: 'Letters', icon: <span className="mr-2">✉️</span> },
  { path: '/logout', label: 'Logout', icon: <span className="mr-2">🚪</span> },
];

    return (

            <div className="container mx-auto p-4">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">Generate Answer Sheet Request Letter</h1>
                    <p className="mb-6 text-gray-600">Click the button below to generate the PDF document for requesting answer sheets and covers based on the latest student input data.</p>
                    <button 
                        onClick={generatePDF}
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate PDF'}
                    </button>
                </div>
                <ReleaseClaimLetter />

                {/* Evaluation Letter Section */}
                <div className="bg-white shadow-md rounded-lg p-6 mt-8">
                    <h2 className="text-xl font-semibold mb-2">Evaluation Letter</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={handleGenerateEvalLetter} disabled={evalLoading || evalLetterStatus !== 'Not Generated'}>Generate</button>
                        <button onClick={handleForwardEvalLetter} disabled={evalLoading || evalLetterStatus !== 'Ready to Forward'}>Forward to HOD</button>
                        <button onClick={handleDownloadEvalLetter} disabled={evalLetterStatus !== 'approved'}>Download PDF</button>
                    </div>
                    <p className="mt-2">Status: <span className="font-semibold">{evalLetterStatus}</span></p>
                    {evalError && <p className="text-red-600 mt-2">{evalError}</p>}
                </div>

                {/* Advance Requisition Letter Section */}
                <div className="bg-white shadow-md rounded-lg p-6 mt-8">
                    <h2 className="text-xl font-semibold mb-2">Advance Requisition Letter for PG Claims</h2>
                     <div className="flex items-center gap-4">
                        <button onClick={handleGenerateAdvReqLetter} disabled={advReqLoading || advReqLetterStatus !== 'Not Generated'}>Generate</button>
                        <button onClick={handleForwardAdvReqLetter} disabled={advReqLoading || advReqLetterStatus !== 'Ready to Forward'}>Forward to HOD</button>
                        <button onClick={handleDownloadAdvReqLetter} disabled={advReqLetterStatus !== 'approved'}>Download PDF</button>
                    </div>
                    <p className="mt-2">Status: <span className="font-semibold">{advReqLetterStatus}</span></p>
                    {advReqError && <p className="text-red-600 mt-2">{advReqError}</p>}
                </div>
            </div>
        
    );
};

export default AnswerSheetRequest;