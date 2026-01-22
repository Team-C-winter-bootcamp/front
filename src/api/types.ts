// ==========================================
// 1. INIT (사용자/카테고리 초기화)
// ==========================================
export type QuestionItem = {
  question_id: number;
  content: string;
};

export type CategoryItem = {
  category_id: number;
  name: string;
  content: string;
  questions: QuestionItem[];
};

export type GetCategoriesSuccess = {
  status: 'success';
  data: {
    categories: CategoryItem[];
  };
};

export type GetCategoriesError = {
  status: 'error';
  code: number;
  message: string;
  data: null;
};

export type GetCategoriesResponse = GetCategoriesSuccess | GetCategoriesError;


// ==========================================
// 2. CASES (사건 정보 등록)
// ==========================================
export type PostCaseInfoRequest = { // 이름 변경 제안 (INFO -> CaseInfo)
  category: string;
  situation: {
    detail: string;
    [key: string]: string; 
  };
};

export type PostCaseInfoSuccess = {
  status: 'success';
  data: {
    case_id: number;
  };
};

export type PostCaseInfoValidationError = {
  status: 'error';
  code: 400;
  message: string;
  data: {
    errors: Record<string, string>;
  };
};

export type PostCaseInfoNotFound = {
  status: 'error';
  code: number;
  message: string;
};

export type PostCaseInfoResponse = 
  | PostCaseInfoSuccess 
  | PostCaseInfoValidationError 
  | PostCaseInfoNotFound;


// ==========================================
// 3. SUMMARY (판례 상세 및 AI 분석)
// ==========================================
export type CaseInfo = {
  precedent_id: number;
  index: number;
  title: string;
  case_number: string;
  court: string;
  judgment_date: string;
  full_text: string;
};

export type AiAnalysis = {
  summary_status: 'completed' | 'processing' | 'failed' | string;
  overview: string;
  legal_conclusion: string;
  key_points: string[];
};

export type PrecedentDetailData = {
  case_info: CaseInfo;
  ai_analysis: AiAnalysis;
};

export type GetPrecedentDetailSuccess = {
  status: 'success';
  code: 200;
  message: string;
  data: PrecedentDetailData;
};

export type GetPrecedentDetailBadRequest = {
  status: 'error';
  code: 400;
  message: string;
  error: {
    detail: string;
  };
};

export type GetPrecedentDetailNotFound = {
  status: 'error';
  code: 404;
  message: string;
};

export type GetPrecedentDetailResponse = 
  | GetPrecedentDetailSuccess 
  | GetPrecedentDetailBadRequest 
  | GetPrecedentDetailNotFound;


// ==========================================
// 4. ANSWER (사건 분석 결과)
// ==========================================
export type OutcomePrediction = {
  probability: string;
  expected_result: string;
  estimated_compensation: string;
  estimated_duration: string;
};

export type ActionStep = {
  step: number;
  title: string;
  action: string;
  description: string;
};

export type EvidenceChecklistItem = {
  item: string;
  status: 'REQUIRED' | 'RECOMMENDED' | string;
  tip: string;
};

export type EvidenceStrategy = {
  status: string;
  checklist: EvidenceChecklistItem[];
};

export type LegalFoundation = {
  logic: string;
  precedent_ref: string;
};

export type CaseDetailData = {
  case_id: string;
  outcome_prediction: OutcomePrediction;
  action_roadmap: ActionStep[];
  evidence_strategy: EvidenceStrategy;
  legal_foundation: LegalFoundation;
};

export type GetCaseDetailSuccess = {
  status: 'success';
  data: CaseDetailData;
};

export type GetCaseDetailBadRequest = {
  status: 'error';
  code: 400;
  message: string;
  error: {
    detail: string;
  };
};

export type GetCaseDetailNotFound = {
  status: 'error';
  code: 404;
  message: string;
};

export type GetCaseDetailResponse = 
  | GetCaseDetailSuccess 
  | GetCaseDetailBadRequest 
  | GetCaseDetailNotFound;


// ==========================================
// 5. CREATEFILE (문서 생성 - POST)
// ==========================================
export type GenerateDocumentRequest = {
  document_type: '내용증명' | string; 
  case_id: number;
};

export type DocumentData = {
  document_id: number;
  case_id: number;
  title: string;
  content: string;
};

export type GenerateDocumentSuccess = {
  status: 'success';
  data: DocumentData;
};

export type GenerateDocumentBadRequest = {
  status: 'error';
  code: 400;
  message: string;
  error: {
    additional_request: null | string; 
  };
};

export type GenerateDocumentNotFound = {
  status: 'error';
  code: 404;
  message: string;
};

export type GenerateDocumentResponse = 
  | GenerateDocumentSuccess 
  | GenerateDocumentBadRequest 
  | GenerateDocumentNotFound;


// ==========================================
// 6. MODIFYFILE (문서 수정 - PATCH Streaming)
// ==========================================
export type PatchDocumentRequest = {
  document_id: number;
  user_answer: string;
};

// SSE Event Types
export type StreamEventInfo = {
  status: 'processing';
  extracted_fields: string[];
  message: string;
};

export type StreamEventChunk = {
  text: string;
};

export type StreamEventComplete = {
  document_id: number;
  case_id: number;
  updated_at: string;
  status: 'success';
};

// HTTP Errors (Connection phase)
export type PatchDocumentBadRequest = {
  status: 'error';
  code: 400;
  message: string;
  error: {
    detail: Record<string, string | null> | string;
  };
};

export type PatchDocumentNotFound = {
  status: 'error';
  code: 404;
  message: string;
};

export type PatchDocumentErrorResponse = 
  | PatchDocumentBadRequest 
  | PatchDocumentNotFound;