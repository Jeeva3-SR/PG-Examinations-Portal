// This is Page 1 (Abstract) and the entry point for the PG Exam Settlement Letter.
// It provides settlement values to all other pages via SettlementProvider (React Context).
// NOTE: When generating the full PDF, ensure all settlement pages are rendered within the same parent (or route) so SettlementProvider context is shared.
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSettlement } from './SettlementContext';
import { usePdfMode } from '../PdfModeContext';

const SettlementAbstract = () => {
  const { setSettlementValues, examMonth } = useSettlement();
  const [advanceClaim, setAdvanceClaim] = useState(0);
  const [manualOtherExpenses, setManualOtherExpenses] = useState('');
  const [manualExternalCount, setManualExternalCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add state for manual session and candidate counts
  const [manualSessionCount, setManualSessionCount] = useState(0);
  const [sessionCountFetched, setSessionCountFetched] = useState(false); // Track if user has overridden
  const [manualCandidateCount, setManualCandidateCount] = useState(0);

  // For dynamic rows (only for user-added rows)
  const [expenseRows, setExpenseRows] = useState([]);

  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorDesignation, setCoordinatorDesignation] = useState('');

  const isPdf = usePdfMode();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch only the non-manual data
        const advanceRes = await axios.get('/api/claims/advance');
        setAdvanceClaim(advanceRes.data.totalAmount || 0);
        // Fetch session count from backend
        const sessionRes = await axios.get('/api/sessions/count');
        if (!sessionCountFetched) {
          setManualSessionCount(sessionRes.data.sessionCount || 0);
        }
        // Fetch coordinator name and designation
        const coordinatorRes = await axios.get('/api/coordinator');
        setCoordinatorName(coordinatorRes.data.name || '');
        setCoordinatorDesignation(coordinatorRes.data.designation || '');
      } catch (err) {
        setError('Failed to fetch initial data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculations using manual inputs
  const miscAmount = 250 * manualSessionCount;
  const externalAmount = (150 * manualCandidateCount) + (100 * manualCandidateCount);
  const taDaAmount = 500 * manualExternalCount;
  // Sum user-added rows
  const userAddedTotal = expenseRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const totalExpenditure =
    Number(manualOtherExpenses || 0) + miscAmount + externalAmount + taDaAmount + userAddedTotal;
  const unspentBalance = advanceClaim - totalExpenditure;

  // Update context whenever values change
  useEffect(() => {
    setSettlementValues({
      advanceAmount: advanceClaim,
      totalExpenditure,
      unspentBalance,
      examMonth,
      manualSessionCount,
      manualCandidateCount,
      miscAmount,
      externalAmount,
      taDaAmount,
      manualOtherExpenses,
      coordinatorName,
      coordinatorDesignation
    });
  }, [advanceClaim, totalExpenditure, unspentBalance, examMonth, manualSessionCount, manualCandidateCount, miscAmount, externalAmount, taDaAmount, manualOtherExpenses, setSettlementValues, coordinatorName, coordinatorDesignation]);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 font-serif border border-gray-300 shadow-lg mt-8 print:p-0 print:shadow-none">
      <div className="text-center mb-2">
        <h2 className="font-bold text-lg underline mb-2">ABSTRACT</h2>
        <div className="font-bold">Department of Computer Science and Engineering</div>
        <div className="font-bold">Anna University, Chennai – 600025</div>
        <div className="font-bold mt-4">SETTLEMENT OF ADVANCE</div>
        <div className="font-bold">PG END SEMESTER EXAMINATIONS – {examMonth || 'MAY 2025'}</div>
        <div className="font-bold mt-2">EXPENSES INCURRED FOR THE CONDUCT OF PG EXAMINATIONS</div>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <table className="w-full border border-black border-collapse text-sm mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-2 py-1">S.No.</th>
                <th className="border border-black px-2 py-1">Description</th>
                <th className="border border-black px-2 py-1">Amount</th>
                <th className="border border-black px-2 py-1">Page No.</th>
                <th className="border border-black px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* First 4 static/calculated rows */}
              <tr>
                <td className="border border-black px-2 py-1 text-center">1</td>
                <td className="border border-black px-2 py-1">Other Expenses (minimum Rs. 500/-)</td>
                <td className="border border-black px-2 py-1 text-right align-top">
                  {isPdf ? (
                    <span className="underline px-2">{manualOtherExpenses || '_____'}</span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      value={manualOtherExpenses}
                      onChange={e => setManualOtherExpenses(e.target.value)}
                      className="border px-2 py-1 w-32 text-sm"
                      placeholder="Enter amount"
                    />
                  )}
                </td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-center">2</td>
                <td className="border border-black px-2 py-1">
                  Miscellaneous Expenses (Rs. 250/- per session)
                  <div className="text-xs mt-1">Rs. 250/- × 
                    {isPdf ? (
                      <span className="underline px-2">{manualSessionCount || '_____'}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={manualSessionCount}
                        onChange={e => {
                          setManualSessionCount(Number(e.target.value));
                          setSessionCountFetched(true); // User has overridden
                        }}
                        className="border px-2 py-1 w-16 text-sm ml-1"
                      />
                    )} sessions
                  </div>
                </td>
                <td className="border border-black px-2 py-1 text-right">{miscAmount.toLocaleString()}</td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-center">3</td>
                <td className="border border-black px-2 py-1">
                  External Examiner PG (Rs. 150/- per present candidate thesis evaluation and Rs. 100/- per present candidate for Viva Voce examination)
                  <div className="text-xs mt-1">Rs. 150/- × 
                    {isPdf ? (
                      <span className="underline px-2">{manualCandidateCount || '_____'}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={manualCandidateCount}
                        onChange={e => setManualCandidateCount(Number(e.target.value))}
                        className="border px-2 py-1 w-16 text-sm ml-1"
                      />
                    )} candidates
                  </div>
                  <div className="text-xs mt-1">Rs. 100/- × {isPdf ? (manualCandidateCount || '_____') : manualCandidateCount} candidates</div>
                </td>
                <td className="border border-black px-2 py-1 text-right">{externalAmount.toLocaleString()}</td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-center">4</td>
                <td className="border border-black px-2 py-1">
                  External Examiner TA/DA (Rs. 500/- for less than 100 km both ways, 3 tier AC train fare and additional incidental charge Rs. 500 for more than 100 km)
                  <div className="text-xs mt-1">Rs. 500/- × 
                    {isPdf ? (
                      <span className="underline px-2">{manualExternalCount || '_____'}</span>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        value={manualExternalCount}
                        onChange={e => setManualExternalCount(Number(e.target.value))}
                        className="border px-2 py-1 w-16 text-sm ml-1"
                      />
                    )}
                    external examiners less than 100 km
                  </div>
                </td>
                <td className="border border-black px-2 py-1 text-right">{taDaAmount.toLocaleString()}</td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              {/* User-added rows */}
              {expenseRows.map((row, index) => (
                <tr key={row.key || index + 5}>
                  <td className="border border-black px-2 py-1 text-center">{index + 5}</td>
                  <td className="border border-black px-2 py-1">
                    {isPdf ? (
                      <span className="underline px-2">{row.description || '_____'}</span>
                    ) : (
                      <input
                        type="text"
                        value={row.description}
                        onChange={e => {
                          const newRows = [...expenseRows];
                          newRows[index].description = e.target.value;
                          setExpenseRows(newRows);
                        }}
                        className="border px-2 py-1 w-64 text-sm"
                        placeholder="Description"
                      />
                    )}
                  </td>
                  <td className="border border-black px-2 py-1 text-right align-top">
                    {isPdf ? (
                      <span className="underline px-2">{row.amount || '_____'}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={row.amount}
                        onChange={e => {
                          const newRows = [...expenseRows];
                          newRows[index].amount = e.target.value;
                          setExpenseRows(newRows);
                        }}
                        className="border px-2 py-1 w-32 text-sm"
                        placeholder="Amount"
                      />
                    )}
                  </td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1 text-center">
                    {!isPdf && (
                      <button
                        type="button"
                        className="text-red-600 font-bold"
                        onClick={() => setExpenseRows(expenseRows.filter((_, i) => i !== index))}
                        title="Delete row"
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isPdf && (
            <button
              type="button"
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setExpenseRows([...expenseRows, { description: '', amount: '', key: Date.now() + Math.random() }])}
            >
              + Add Row
            </button>
          )}
          <div className="flex flex-col items-end text-sm mb-8">
            <div>Total Expenditure: <span className="inline-block w-24 text-right">{totalExpenditure.toLocaleString()}</span></div>
            <div>Advance Claim: <span className="inline-block w-24 text-right">{advanceClaim.toLocaleString()}</span></div>
            <div>Unspent balance: <span className="inline-block w-24 text-right">{unspentBalance.toLocaleString()}</span></div>
          </div>
          <div className="flex justify-between items-end mt-12">
            <div className="text-left">
              <div className="font-bold">{coordinatorName || 'Dr. C. Valliyammai'}</div>
              <div className="font-bold">{coordinatorDesignation || 'Chief Superintendent, PG Examinations, DCSE'}</div>
            </div>
            <div className="text-right font-bold">HOD, DCSE</div>
          </div>
        </>
      )}
    </div>
  );
};

export default SettlementAbstract; 