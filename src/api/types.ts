// 공통 응답 
export interface ApiResponse<T> {
  status: string; 
  code: string;
  message: string;
  data: T | null;
}

// 유저 프로필 데이터(GET)
export interface UserProfile {
  email_address: string;
  name: string;
}


// NEWCHAT(POST)
export interface NEWCHATRequest {
  message: string;
}

export interface NEWCHATRequestData {
  session_id: number;
  title: string;
}


//GETLIST(GET) 나중에 [] 붙이기 
export interface GETLISTData {
  id: number;
  title: string;
  bookmark: boolean;
}


//MODIFY(PATCH)
export interface MODIFYRequest{
  title: string;
  bookmark: boolean;
}

export interface MODIFYData{
  title: string;
  bookmark: boolean;
}

//DELETE(DELETE)
export interface DELETEData{
  session_id: number;
  title:string
}

//GETMESSAGE(GET)
export interface GETMESSAGE{
  id: number;
  sender_id: number;    // 메시지 내용
  role: string; // 보낸 사람
  content: string;  // 보낸 시간
}

export interface GETMESSAGEData{
  messages: GETMESSAGE[];
}

//SENDMESSAGE(POST)
export interface SENDMESSAGERequest{
  message: string;
}

export interface SENDMESSAGEData{
  id: number;
  order: number;
  role: string;
  content: string;
}

//MODIFYMESSAGE(PATCH)
export interface MODIFYMESSAGERequest{
  message: string;
}

export interface MODIFYMESSAGEData{
  id: number;
  order: number;
  role: string;
  content: string;
}

// //INIT(GET)
// // 1. 공통으로 쓰이는 필터 아이템 (code, label)
// export interface FilterOption {
//   code: number; // 명세서의 int는 number로 작성
//   label: string;
// }

// // 2. data 안의 각 부분 정의
// export interface SearchFilters {
//   outcomes: FilterOption[];
//   courts: FilterOption[];
//   categories: FilterOption[];
// }

// export interface DefaultSearch {
//   sort: string;
//   page_size: number;
// }

// // 3. 최종 [Data] 알맹이
// export interface INITData {
//   filters: SearchFilters;
//   default_search: DefaultSearch;
// }
//PREVIEW
export interface PREVIEWMeta{
  total_count: number;
  page: number;
  limit: number;
  total_page:number
}

export interface PREVIEWData{
  precedents_id: number;
  case_title: string;
  case_preview: string;
  outcome_display: string;
}

export interface PREVIEW{

}
//TOTALDATA
export interface TOTALDATAData{
  case_title: string;
  case_name: string;
  defendant: string;
  petitioner: string;
  pleader: string;
  original_judgment: string;
  main_sentence: string;
  reason: string;
}