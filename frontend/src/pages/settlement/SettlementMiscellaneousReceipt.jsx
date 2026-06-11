import React, { useState, useEffect } from 'react';
import { useSettlement } from './SettlementContext';
import { usePdfMode } from '../PdfModeContext';
import api from '../../lib/api';

// Helper to convert number to words (simple version for demo)
function numberToWords(num) {
  const a = [ '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen' ];
  const b = [ '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety' ];
  if (num === 0) return 'zero';
  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '');
  if (num < 1000) return a[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' and ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  return num.toString();
}

const defaultRows = [
  { claim: 'Seating Arrangement', name: '', amount: '' },
  { claim: 'Clerical Assistance & Typing Charges', name: '', amount: '' },
  { claim: 'Packing Charges & Water Boy', name: '', amount: '' },
  { claim: 'Stationery', name: '', amount: '' },
];

const SettlementMiscellaneousReceipt = () => {
  const { examMonth, coordinatorName, coordinatorDesignation } = useSettlement();
  const [expenses, setExpenses] = useState(defaultRows);
  const [manualSessionCount, setManualSessionCount] = useState(0);
  const [sessionCountFetched, setSessionCountFetched] = useState(false);
  const isPdf = usePdfMode();

  useEffect(() => {
    const fetchSessionCount = async () => {
      try {
        const sessionRes = await api.get('/api/sessions/count');
        if (!sessionCountFetched) {
          setManualSessionCount(sessionRes.data.sessionCount || 0);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchSessionCount();
    // eslint-disable-next-line
  }, []);

  const handleChange = (idx, field, value) => {
    setExpenses(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const total = expenses.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const amountInWords = numberToWords(total).replace(/\b\w/g, l => l.toUpperCase()) + ' only';

  // Add row handler
  const handleAddRow = () => {
    setExpenses(prev => ([...prev, { claim: '', name: '', amount: '' }]));
  };

  // Delete row handler
  const handleDeleteRow = (idx) => {
    setExpenses(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 font-serif border border-gray-300 shadow-lg mt-8 print:p-0 print:shadow-none">
      <p className="text-center font-bold uppercase mb-2">
        Department of Computer Science and Engineering<br />
        Anna University, Chennai – 600025
      </p>
      <p className="text-center font-bold underline mb-4">
        PG END SEMESTER EXAMINATIONS – {examMonth || 'MAY 2025'}<br />
        MISCELLANEOUS EXPENSES – RECEIPT
      </p>
      <table className="w-full border border-black mb-6 text-sm">
        <thead className="bg-gray-100 border-b border-black">
          <tr>
            <th className="p-2 border-r border-black text-left">S. No.</th>
            <th className="p-2 border-r border-black text-left">Particulars of Claim</th>
            <th className="p-2 border-r border-black text-left">Name & Designation</th>
            <th className="p-2 border-r border-black text-left">Amount Paid (Rs.)</th>
            <th className="p-2 text-left">Signature</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((item, index) => (
            <tr key={index} className="border-b border-black">
              <td className="p-2 border-r border-black">{index + 1}</td>
              <td className="p-2 border-r border-black">
                {isPdf ? (
                  <span className="underline px-2">{item.claim || '_____'}</span>
                ) : (
                  <input
                    type="text"
                    value={item.claim}
                    onChange={e => handleChange(index, 'claim', e.target.value)}
                    className="border px-2 py-1 w-40 text-sm"
                    placeholder="Particulars of Claim"
                  />
                )}
              </td>
              <td className="p-2 border-r border-black">
                {isPdf ? (
                  <span className="underline px-2">{item.name || '_____'}</span>
                ) : (
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => handleChange(index, 'name', e.target.value)}
                    className="border px-2 py-1 w-48 text-sm"
                    placeholder="Enter name & designation"
                  />
                )}
              </td>
              <td className="p-2 border-r border-black">
                {isPdf ? (
                  <span className="underline px-2">{item.amount || '_____'}</span>
                ) : (
                  <input
                    type="number"
                    min="0"
                    value={item.amount}
                    onChange={e => handleChange(index, 'amount', e.target.value)}
                    className="border px-2 py-1 w-24 text-sm"
                    placeholder="Amount"
                  />
                )}
              </td>
              <td className="p-2 border-black text-center">
                {item.claim === 'Stationery' ? 'Bills attached' : '✍️'}
                {!isPdf && expenses.length > 1 && (
                  <button
                    type="button"
                    className="ml-2 text-red-600 font-bold"
                    onClick={() => handleDeleteRow(index)}
                    title="Delete row"
                  >
                    ×
                  </button>
                )}
              </td>
            </tr>
          ))}
          <tr className="font-bold">
            <td colSpan={3} className="p-2 text-right border-r border-black">Total:</td>
            <td className="p-2 border-r border-black">{total ? `Rs. ${total}/-` : ''}</td>
            <td className="p-2"></td>
          </tr>
        </tbody>
      </table>
      {!isPdf && (
        <button
          type="button"
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleAddRow}
        >
          + Add Row
        </button>
      )}
      <p className="mb-6">
        Certified that a sum of Rs. {total ? `${total.toLocaleString()}/-` : '____'} (Rupees {amountInWords}) was paid towards miscellaneous expenses in connection with the conduct of PG End Semester Examinations (Rs. 250 × 
        {isPdf ? (
          <span className="underline px-2">{manualSessionCount || '_____'}</span>
        ) : (
          <input 
            type="number"
            min="0"
            value={manualSessionCount}
            onChange={e => {
              setManualSessionCount(e.target.value);
              setSessionCountFetched(true);
            }}
            className="border-b border-gray-400 w-16 text-center mx-1"
            placeholder="0"
          />
        )}
        sessions = Rs. {total ? `${total.toLocaleString()}/-` : '____'}).
      </p>
      <div className="text-right mt-10">
        <p>{coordinatorName || 'Dr. C. Valliyammai'}</p>
        <p className="text-sm">{coordinatorDesignation || 'Chief Superintendent, PG Examinations, DCSE'}</p>
      </div>
    </div>
  );
};

export default SettlementMiscellaneousReceipt; 