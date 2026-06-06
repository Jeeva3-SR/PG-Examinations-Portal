import React, { useState, useEffect } from 'react';
import { useSettlement } from './SettlementContext';
import { usePdfMode } from '../PdfModeContext';

const SettlementOtherExpenses = () => {
  const { examMonth, setSettlementValues, coordinatorName, coordinatorDesignation } = useSettlement();
  const [otherExpenseAmount, setOtherExpenseAmount] = useState('');
  const [pageNo, setPageNo] = useState('');
  const [volNo, setVolNo] = useState('');
  const isPdf = usePdfMode();

  // Update the shared context whenever the local amount changes
  useEffect(() => {
    setSettlementValues({ manualOtherExpenses: otherExpenseAmount });
  }, [otherExpenseAmount, setSettlementValues]);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 font-serif border border-gray-300 shadow-lg mt-8 print:p-0 print:shadow-none">
      <div className="mb-6 flex gap-4 items-center">
        <label className="font-semibold">Other Expenses Amount (₹):</label>
        {isPdf ? (
          <span className="underline px-2">{otherExpenseAmount || '_____'}</span>
        ) : (
          <input
            type="number"
            min="0"
            value={otherExpenseAmount}
            onChange={e => setOtherExpenseAmount(e.target.value)}
            className="border px-2 py-1 w-32 text-sm"
            placeholder="Enter amount"
          />
        )}
      </div>
      <div className="p-6 bg-white text-black font-serif leading-relaxed border border-gray-200">
        <p className="text-center font-bold underline mb-6">
          PG END SEMESTER EXAMINATIONS – {examMonth || 'MAY 2025'}
        </p>

        <p className="mb-4">
          Received the articles in good condition and entered in the Department Consumable Stock Register
          vide Page No. {isPdf ? <span className="underline px-2">{pageNo || '_____'}</span> : <input type="text" value={pageNo} onChange={e => setPageNo(e.target.value)} className="border-b border-gray-400 w-16 text-center" placeholder="___" />} Vol. No. {isPdf ? <span className="underline px-2">{volNo || '_____'}</span> : <input type="text" value={volNo} onChange={e => setVolNo(e.target.value)} className="border-b border-gray-400 w-16 text-center" placeholder="___" />}.
        </p>

        <p className="mb-4">
          Certified that the expenditure incurred towards purchase of stationeries under the head of <strong>Other Expenses</strong> 
          for the conduct of PG End Semester Examinations {examMonth || 'MAY 2025'} in the Department of Computer Science and Engineering,
          CEG Campus, Anna University, Chennai – 600025.
        </p>

        <p className="mb-2">
          This bill is in order and may be passed for payment of <strong>Rs. {otherExpenseAmount ? Number(otherExpenseAmount).toLocaleString() : '_____'} /-</strong>
        </p>

        <p>The bill amount has not been claimed previously.</p>

        <div className="mt-10 flex justify-between">
          <div>
            <p>{coordinatorName || 'Dr. C. Valliyammai'}</p>
            <p className="text-sm">{coordinatorDesignation || 'Chief Superintendent, PG Examinations, DCSE'}</p>
          </div>
          <div>
            <p>HOD, DCSE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementOtherExpenses; 