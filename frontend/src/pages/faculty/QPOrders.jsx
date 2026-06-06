import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// import logo from '../../assets/logo.png'; // Make sure logo.png exists in this path

const QPOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coordinator, setCoordinator] = useState({ name: '', designation: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch coordinator details
    const fetchCoordinator = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/coordinator');
        if (res.data) {
          setCoordinator({ name: res.data.name, designation: res.data.designation });
        }
      } catch (err) {
        setCoordinator({ name: 'Dr. C. Valliyammai', designation: 'Professor, Chief Superintendent (P.G. Examinations)' });
      }
    };
    fetchCoordinator();

    const fetchOrders = async () => {
      try {
        const facultyData = JSON.parse(localStorage.getItem('loggedInFaculty') || '{}');
        if (!facultyData.facultyId) {
          navigate('/faculty/login');
          return;
        }

        const response = await axios.get(`/api/qporders/${facultyData.facultyId}`);
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch QP Orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleViewLetter = (letterText) => {
    // Replace the coordinator's name and designation in the existing paragraph
    const coordinatorDisplay = `<b>${coordinator.name || 'Dr. C. Valliyammai'}</b>, <b>${coordinator.designation || 'Professor, Chief Superintendent (P.G. Examinations)'}</b>`;
    // Regex to match the coordinator paragraph
    const replacedText = letterText.replace(/to [^,]+, [^,]+, [^,]+ in the Department of Computer Science and Engineering\./g, `to ${coordinatorDisplay} in the Department of Computer Science and Engineering.`);
    const html = `
      <html>
        <head>
          <title>QP Order Letter</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; white-space: pre-wrap; font-size: 14px; }
            b { font-weight: bold; }
            @media print { body { margin: 20mm; } }
          </style>
        </head>
        <body>${replacedText}</body>
      </html>
    `;
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
  };

  const handleDownloadLetter = (order) => {
    const doc = new jsPDF();
    const { 
        facultyName, courseCode, courseName, specialization, 
        regulation, examMonth, lastDateToSubmit, type 
    } = order;

    doc.setFont('times', 'normal');

    if (type.toLowerCase() === 'regular') {
        // --- REGULAR PDF Content ---
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING', 105, 18, { align: 'center' });
        doc.text('COLLEGE OF ENGINEERING, GUINDY CAMPUS', 105, 25, { align: 'center' });
        doc.text('ANNA UNIVERSITY:: CHENNAI - 600 025.', 105, 32, { align: 'center' });
        doc.setFontSize(11);
        doc.text(`PG (FT) & Ph.D REGULAR EXAMINATIONS – ${examMonth.toUpperCase()}`, 105, 42, { align: 'center' });

        doc.setFont('times', 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}`, 185, 52, { align: 'right' });

        doc.text('To', 14, 62);
        doc.setFont('times', 'bold');
        doc.text(facultyName, 24, 72);
        doc.setFont('times', 'normal');
        doc.text('Department of Computer Science and Engineering,', 24, 79);
        doc.text('CEG Campus,', 24, 86);
        doc.text('Anna University, Chennai 600 025.', 24, 93);

        doc.text('Sir/Madam,', 14, 105);
        doc.setFont('times', 'bold');
        doc.text('Sub:', 25, 115)
        doc.setFont('times', 'normal');
        doc.text(`PG (FT) – Regular Examination ${examMonth.toUpperCase()} – Appointment of`, 35, 115);
        doc.text('Question Paper Setter – Reg.', 35, 122);
        

        const bodyText1 = `It is informed that, you are appointed as Question Paper Setter for the Examinations to be held in ${examMonth.toUpperCase()} for the subject whose details are given below:`;
        doc.text(bodyText1, 14, 135, { maxWidth: 180 });

        autoTable(doc, {
            startY: 145,
            theme: 'grid',
            styles: { lineColor: [0,0,0], lineWidth: 0.1, fontSize: 10, cellPadding: 2 },
            head: [[
                'DEGREE', 'BRANCH', 'DURATION', 'MAX. MARKS', 'REGULATION'
            ]],
            body: [[
                'M.E.', specialization, '3 Hrs.', '100', regulation || '2023'
            ]],
            headStyles: { fillColor: [230,230,230], textColor: [0,0,0], fontStyle: 'bold', halign: 'center' },
            bodyStyles: { halign: 'center' },
        });
        
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 5,
            head: [['Sl.No', 'Subject Code and Subject Title', 'Last Date to submit the Question Paper']],
            body: [[ '1.', `${courseCode} - ${courseName}`, new Date(lastDateToSubmit).toLocaleDateString('en-GB').replace(/\//g, '.') ]],
            theme: 'grid',
            headStyles: { font: 'times', fontStyle: 'bold', halign: 'center', fontSize: 11, textColor: [255, 255, 255] },
            bodyStyles: { font: 'times', halign: 'center', fontSize: 11 },
        });

    } else { // Assuming 'Arrear' or default
        // --- ARREAR PDF Content ---
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING', 105, 18, { align: 'center' });
        doc.text('COLLEGE OF ENGINEERING, GUINDY CAMPUS', 105, 25, { align: 'center' });
        doc.text('ANNA UNIVERSITY:: CHENNAI - 600 025.', 105, 32, { align: 'center' });
        doc.setFontSize(11);
        doc.text(`PG (FT) & Ph.D ARREAR EXAMINATIONS – ${examMonth.toUpperCase()}`, 105, 42, { align: 'center' });

        doc.setFont('times', 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}`, 185, 52, { align: 'right' });

        doc.text('To', 14, 62);
        doc.setFont('times', 'bold');
        doc.text(facultyName, 24, 72);
        doc.setFont('times', 'normal');
        doc.text('Department of Computer Science and Engineering,', 24, 79);
        doc.text('CEG Campus,', 24, 86);
        doc.text('Anna University, Chennai 600 025.', 24, 93);

        doc.text('Sir/Madam,', 14, 105);
        doc.setFont('times', 'bold');
        doc.text('Sub:', 25, 115);
        doc.setFont('times', 'normal');
        doc.text(`PG (FT) – Arrear Examination ${examMonth.toUpperCase()} – Appointment of`, 35, 115);
        doc.text('Question Paper Setter – Reg.', 35, 122);
        

        const bodyText1 = `It is informed that, you are appointed as Question Paper Setter for the Examinations to be held in ${examMonth.toUpperCase()} for the subject whose details are given below:`;
        doc.text(bodyText1, 14, 135, { maxWidth: 180 });

        autoTable(doc, {
            startY: 145,
            theme: 'grid',
            styles: { lineColor: [0,0,0], lineWidth: 0.1, fontSize: 10 },
            head: [[
                'DEGREE', 'BRANCH', 'DURATION', 'MAX. MARKS', 'REGULATION'
            ]],
            body: [[
                'M.E.', specialization, '3 Hrs.', '100', regulation || '2023'
            ]],
            headStyles: { fillColor: [230,230,230], textColor: [0,0,0], fontStyle: 'bold', halign: 'center' },
            bodyStyles: { halign: 'center' },
        });

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 5,
            theme: 'grid',
            styles: { lineColor: [0,0,0], lineWidth: 0.1, fontSize: 10 },
            headStyles: { fillColor: [255, 255, 255], textColor: [0,0,0], fontStyle: 'bold', halign: 'center' },
            head: [['Sl.No', 'Subject Code and Subject Title', 'Last Date to submit the Question Paper']],
            body: [[ '1.', `${courseCode} - ${courseName}`, new Date(lastDateToSubmit).toLocaleDateString('en-GB').replace(/\//g, '.') ]],
            bodyStyles: { halign: 'center' }
        });
    }

    // --- Common Closing Text for both formats ---
    const bodyText2 = `You are requested to prepare the question paper with required number of copies, securely sealed in a cover, along with two additional copies placed in a separate sealed cover, and hand over both the covers to ${coordinator.name || 'Dr. C. Valliyammai'}, ${coordinator.designation || 'Professor, Chief Superintendent (P.G. Examinations)'}, in the Department of Computer Science and Engineering.`;
    const bodyText3 = `Your kind cooperation is requested for the smooth and successful conduct of examination as per schedule.`;
    
    let finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(11);
    doc.text(bodyText2, 14, finalY + 15, { maxWidth: 180 });
    doc.text(bodyText3, 14, finalY + 40, { maxWidth: 180 });

    doc.setFont('times', 'bold');
    doc.text('Head of the department', 185, finalY + 70, { align: 'right' });

    doc.save(`${order.type}_QP_Order_${courseCode}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-4">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">QP Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-600 mt-4">
          No QP orders found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.courseCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.courseName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.generatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewLetter(order.letterText)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadLetter(order)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QPOrders; 