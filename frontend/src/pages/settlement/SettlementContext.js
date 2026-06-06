import React, { createContext, useState, useContext } from 'react';

const initialValues = {
  advanceAmount: 0,
  totalExpenditure: 0,
  unspentBalance: 0,
  examMonth: '',
  manualSessionCount: 0,
  manualCandidateCount: 0,
  miscAmount: 0,
  externalAmount: 0,
  taDaAmount: 0,
  setSettlementValues: () => {},
};

const SettlementContext = createContext(initialValues);

export const SettlementProvider = ({ children, initialValues: initialPropValues }) => {
  const [values, setValues] = useState(initialPropValues || initialValues);

  const setSettlementValues = (newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  };

  return (
    <SettlementContext.Provider value={{ ...values, setSettlementValues }}>
      {children}
    </SettlementContext.Provider>
  );
};

export const useSettlement = () => useContext(SettlementContext); 