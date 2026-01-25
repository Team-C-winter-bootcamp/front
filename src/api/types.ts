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
// types.ts
export type PostCaseRequest = {
  category: string; // 카테고리
  who: string;      // 당사자
  when: string;     // 시기
  what: string;     // 사건 내용 (기존 where를 what으로 변경)
  want: string;     // 원하는 결과
  detail: string;   // 상세 설명
};

export type CaseResult = {
  case_No: string;
  case_name: string;
  case_title: string;
  law_category: string;
  law_subcategory: string;
  court: string;
  judgment_date: string;
  similarity: number;
  preview: string;
};

export type PostCaseInfoSuccess = {
  status: 'success';
  code: number;
  message: string;
  data: {
    case_id: number;
    total_count: number;
    results: CaseResult[];
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
export type PrecedentDetailData = {
  case_no: string;
  case_title: string;
  case_name: string;
  court: string;
  judgment_date: string;
  precedent_id: number;
  issue: string;
  content: string;
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
export interface AnalysisData {
  outcome_prediction: {
    probability: string;
    expected_result: string;
    expected_compensation: string;
    estimated_duration: string;
    sentence_distribution: Array<{ name: string; value: number }>;
    radar_data: Array<{ subject: string; A: number; B: number; fullMark: number }>;
  };
  action_roadmap: Array<{ title: string; description: string }>;
  legal_foundation: {
    logic: string;
    relevant_precedents: Array<{ case_number: string; key_points: string[] }>;
  };
}

export interface GetCaseDetailSuccess {
  status: 'success';
  data: AnalysisData;
}

export interface GetCaseDetailBadRequest {
  status: 'error';
  message: string;
}

// 두 타입을 결합한 유니온 타입
export type GetCaseDetailResponse = GetCaseDetailSuccess | GetCaseDetailBadRequest;

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