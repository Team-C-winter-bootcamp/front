import { useState, createContext, useContext, ReactNode } from 'react';

export type CaseType = 'loan' | 'lease' | 'damages' | 'other' | null;

export interface CaseData {
  description: string;
  type: CaseType;
  parties: {
    plaintiff: string;
    defendant: string;
  };
  incidentDate: string;
  amount: string;
  hasEvidence: 'yes' | 'no' | 'unsure' | null;
  documentContent: string;
  selectedCaseLaws: string[];
  status: 'drafting' | 'reviewing' | 'filed' | 'served' | 'hearing' | 'judgment' | 'sent' | 'responded' | 'resolved';
  sentMethod?: 'mail' | 'court' | 'email' | 'hand' | null;
  sentDate?: string;
  trackingNumber?: string;
  responseType?: 'paid' | 'partial' | 'refused' | 'counter' | 'none' | null;
  responseDate?: string;
  responseAmount?: string;
  responseNotes?: string;
  resolutionType?: 'settled' | 'judgment-favor' | 'judgment-against' | 'dismissed' | 'ongoing' | null;
  resolutionDate?: string;
  resolutionAmount?: string;
}

interface CaseContextType {
  caseData: CaseData;
  updateCaseData: (data: Partial<CaseData>) => void;
  resetCase: () => void;
}

const initialCaseData: CaseData = {
  description: '',
  type: null,
  parties: {
    plaintiff: '',
    defendant: ''
  },
  incidentDate: '',
  amount: '',
  hasEvidence: null,
  documentContent: '',
  selectedCaseLaws: [],
  status: 'drafting'
};

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [caseData, setCaseData] = useState<CaseData>(initialCaseData);

  const updateCaseData = (data: Partial<CaseData>) => {
    setCaseData((prev) => ({
      ...prev,
      ...data
    }));
  };

  const resetCase = () => {
    setCaseData(initialCaseData);
  };

  return (
    <CaseContext.Provider
      value={{
        caseData,
        updateCaseData,
        resetCase
      }}
    >
      {children}
    </CaseContext.Provider>
  );
}

export function useCase() {
  const context = useContext(CaseContext);
  if (context === undefined) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
}
