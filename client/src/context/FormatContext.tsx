// // src/context/FormatContext.ts
// import { createContext, useContext, useState } from 'react';
// import type { ReactNode } from 'react';

// export type UserFormat = 'LP' | 'SINGLE';

// interface FormatContextType {
//   selectedFormat: UserFormat;
//   setSelectedFormat: (format: UserFormat) => void;
//   getSize: () => number;
// }

// const FormatContext = createContext<FormatContextType | undefined>(undefined);

// export const FormatProvider = ({ children }: { children: ReactNode }) => {
//   const [selectedFormat, setSelectedFormat] = useState<UserFormat>('LP');

//   const getSize = () => {
//     return selectedFormat === 'LP' ? 12 : 7;
//   };

//   return (
//     <FormatContext.Provider value={{ selectedFormat, setSelectedFormat, getSize }}>
//       {children}
//     </FormatContext.Provider>
//   );
// };

// export const useFormat = (): FormatContextType => {
//   const context = useContext(FormatContext);
//   if (!context) {
//     throw new Error('useFormat must be used within a FormatProvider');
//   }
//   return context;
// };

// src/context/FormatContext.ts
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type UserFormat = 'LP' | 'SINGLE';

interface FormatContextType {
  selectedFormat: UserFormat;
  setSelectedFormat: (format: UserFormat) => void;
  lpSize: number;                // taille actuelle pour LP
  setLpSize: (size: number) => void; // permet de changer LP entre 10 ou 12
  getSize: () => number;
}

const FormatContext = createContext<FormatContextType | undefined>(undefined);

export const FormatProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFormat, setSelectedFormat] = useState<UserFormat>('LP');
  const [lpSize, setLpSize] = useState<number>(12); // par défaut LP = 12

  const getSize = () => {
    if (selectedFormat === 'LP') return lpSize;
    return 7; // SINGLE
  };

  return (
    <FormatContext.Provider value={{ selectedFormat, setSelectedFormat, lpSize, setLpSize, getSize }}>
      {children}
    </FormatContext.Provider>
  );
};

export const useFormat = (): FormatContextType => {
  const context = useContext(FormatContext);
  if (!context) {
    throw new Error('useFormat must be used within a FormatProvider');
  }
  return context;
};