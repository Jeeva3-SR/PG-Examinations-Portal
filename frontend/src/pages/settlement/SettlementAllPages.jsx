import React, { useRef, useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import { SettlementProvider } from './SettlementContext';
import SettlementAbstract from './SettlementAbstract';
import SettlementMiscellaneousReceipt from './SettlementMiscellaneousReceipt';
import SettlementReturnUnspent from './SettlementReturnUnspent';
import SettlementOtherExpenses from './SettlementOtherExpenses';
import SettlementMiscellaneousExpenses from './SettlementMiscellaneousExpenses';
import { PdfModeProvider } from '../PdfModeContext';

// A4 page height at 96dpi is about 1122px. We'll use minHeight to ensure equal size.
const PageWrapper = ({ children }) => (
  <div
    className="max-w-2xl mx-auto bg-white p-8 font-serif border border-gray-300 shadow-lg print:p-0 print:shadow-none flex flex-col justify-center min-h-[1122px]"
    style={{ minHeight: '1122px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
  >
    {children}
  </div>
);

const SettlementAllPages = () => {
  const printRef = useRef();
  const [examMonth, setExamMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPdfMode, setIsPdfMode] = useState(false);

  useEffect(() => {
    const fetchExamMonth = async () => {
      setLoading(true);
      try {
        const sessionsRes = await axios.get('/api/sessions');
        const sessions = sessionsRes.data;
        let dynamicExamMonth = '';
        if (sessions && sessions.length > 0) {
          const latestSession = sessions.reduce((latest, curr) => {
            return new Date(curr.date) > new Date(latest.date) ? curr : latest;
          }, sessions[0]);
          const examDate = new Date(latestSession.date);
          dynamicExamMonth = examDate.toLocaleString('default', { month: 'long' }).toUpperCase() + ' ' + examDate.getFullYear();
        }
        setExamMonth(dynamicExamMonth);
      } catch (err) {
        setExamMonth('');
      } finally {
        setLoading(false);
      }
    };
    fetchExamMonth();
  }, []);

  const handleDownloadPDF = () => {
    setIsPdfMode(true);
    setTimeout(() => {
    const element = printRef.current;
    const opt = {
      margin: 0,
      filename: 'PG-Exam-Settlement.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'px', format: [794, 1122], orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    };
      html2pdf().from(element).set(opt).save().then(() => {
        setIsPdfMode(false);
      });
    }, 100);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <PdfModeProvider value={isPdfMode}>
    <SettlementProvider initialValues={{ examMonth }}>
      <div className="bg-gray-100 min-h-screen py-8">
          <div ref={printRef} className="print:bg-white pdf-area">
          <PageWrapper>
            <SettlementAbstract />
          </PageWrapper>
          <div className="my-8 page-break" />
          <PageWrapper>
            <SettlementMiscellaneousReceipt />
          </PageWrapper>
          <div className="my-8 page-break" />
          <PageWrapper>
            <SettlementReturnUnspent />
          </PageWrapper>
          <div className="my-8 page-break" />
          <PageWrapper>
            <SettlementOtherExpenses />
          </PageWrapper>
          <div className="my-8 page-break" />
          <PageWrapper>
            <SettlementMiscellaneousExpenses />
          </PageWrapper>
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            Download All Pages as PDF
          </button>
        </div>
      </div>
    </SettlementProvider>
    </PdfModeProvider>
  );
};

export default SettlementAllPages;

// Add some CSS to help with page breaks for printing
const style = document.createElement('style');
style.innerHTML = `
  @media print {
    .page-break {
      page-break-before: always;
    }
    .min-h-\[1122px\] {
      min-height: 1122px !important;
    }
  }
`;
document.head.appendChild(style); 