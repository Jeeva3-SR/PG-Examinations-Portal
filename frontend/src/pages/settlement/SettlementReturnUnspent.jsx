import React, { useState } from 'react';
import { useSettlement } from './SettlementContext';
import { usePdfMode } from '../PdfModeContext';

const SettlementReturnUnspent = () => {
  const { examMonth, advanceAmount: contextAdvance, totalExpenditure: contextExpenditure, unspentBalance: contextUnspent, coordinatorName, coordinatorDesignation } = useSettlement();
  
  // Local state for manual inputs on this page
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [totalExpenditure, setTotalExpenditure] = useState('');
  const [unspentBalance, setUnspentBalance] = useState('');
  const isPdf = usePdfMode();

  // Use context values as default if local state is empty
  const displayAdvance = advanceAmount !== '' ? advanceAmount : (contextAdvance ?? '');
  const displayExpenditure = totalExpenditure !== '' ? totalExpenditure : (contextExpenditure ?? '');
  const displayUnspent = unspentBalance !== '' ? unspentBalance : (contextUnspent ?? '');

  return (
    <div className="p-6 bg-white text-black font-serif leading-relaxed max-w-2xl mx-auto border border-gray-300 shadow-lg mt-8 print:p-0 print:shadow-none">
      <p><strong>From</strong><br />
        Chief Superintendent<br />
        PG Examinations<br />
        Department of Computer Science and Engineering<br />
        Anna University<br />
        Chennai 600025</p>

      <br />

      <p><strong>To</strong><br />
        ACOE<br />
        Anna University<br />
        Chennai 600025</p>

      <br />

      <p><strong>Respected Ma'am,</strong></p>

      <p><strong>Sub:</strong> Return of unspent balance in advance claimed for the PG exams conducted in {examMonth || '______'} – reg.</p>

      <p>
        I wish to inform that an advance claim of <strong>Rs. {isPdf ? <span className="underline px-2">{displayAdvance || '_____'}</span> : <input type="text" value={displayAdvance} onChange={e => setAdvanceAmount(e.target.value)} className="border-b border-gray-400 w-24 text-center mx-1" placeholder="Amount" />} /-</strong> was credited to the account of 
        HOD, DCSE for the conduct of PG Examinations in the Department of Computer Science and Engineering. The total expenditure 
        incurred amounts to <strong>Rs. {isPdf ? <span className="underline px-2">{displayExpenditure || '_____'}</span> : <input type="text" value={displayExpenditure} onChange={e => setTotalExpenditure(e.target.value)} className="border-b border-gray-400 w-24 text-center mx-1" placeholder="Amount" />} /-</strong>. After adjusting the expenditure against the 
        advance, the unspent balance amount of <strong>Rs. {isPdf ? <span className="underline px-2">{displayUnspent || '_____'}</span> : <input type="text" value={displayUnspent} onChange={e => setUnspentBalance(e.target.value)} className="border-b border-gray-400 w-24 text-center mx-1" placeholder="Amount" />} /-</strong> is returned to ACOE account.
      </p>

      <br />

      <p>Thank you</p>

      <br />

      <p><strong>Yours sincerely</strong></p>

      <br />

      <p>{coordinatorName || 'Dr. C. Valliyammai'}<br />
        {coordinatorDesignation || 'Chief Superintendent, PG Examinations, DCSE'}</p>
    </div>
  );
};

export default SettlementReturnUnspent; 