import React, { createContext, useContext } from 'react';

const PdfModeContext = createContext(false);

export const usePdfMode = () => useContext(PdfModeContext);
 
export const PdfModeProvider = ({ value, children }) => (
  <PdfModeContext.Provider value={value}>{children}</PdfModeContext.Provider>
); 