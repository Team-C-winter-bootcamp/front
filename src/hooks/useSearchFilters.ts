import { useState, useMemo } from 'react';
import { SearchResult } from '../pages/SearchResult';

export function useSearchFilters(
  results: SearchResult[],
  query: string,
  activeTab: 'expert' | 'all'
) {
  const [selectedCaseTypes, setSelectedCaseTypes] = useState<string[]>([]);
  const [selectedCourts, setSelectedCourts] = useState<string[]>([]);
  const [selectedJudgmentType, setSelectedJudgmentType] = useState<string>('전체');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('전체 기간');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleCaseTypeChange = (type: string) => {
    if (type === '') {
      setSelectedCaseTypes([]);
    } else {
      setSelectedCaseTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    }
    setCurrentPage(1);
  };

  const handleCourtChange = (court: string) => {
    if (court === '') {
      setSelectedCourts([]);
    } else {
      setSelectedCourts((prev) =>
        prev.includes(court) ? prev.filter((c) => c !== court) : [...prev, court]
      );
    }
    setCurrentPage(1);
  };

  const filteredResults = useMemo(() => {
    let filtered = results;

    // 검색어 필터
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (result) =>
          result.title.toLowerCase().includes(lowerQuery) ||
          result.content.toLowerCase().includes(lowerQuery) ||
          result.court.toLowerCase().includes(lowerQuery)
      );
    }

    // 사건종류 필터
    if (selectedCaseTypes.length > 0) {
      filtered = filtered.filter((result) =>
        selectedCaseTypes.includes(result.caseType)
      );
    }

    // 법원 필터
    if (selectedCourts.length > 0) {
      filtered = filtered.filter((result) =>
        selectedCourts.some((court) => result.court.includes(court))
      );
    }

    // 재판유형 필터
    if (selectedJudgmentType !== '전체') {
      filtered = filtered.filter(
        (result) => result.judgmentType === selectedJudgmentType
      );
    }

    return filtered;
  }, [results, query, selectedCaseTypes, selectedCourts, selectedJudgmentType]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResults, currentPage]);

  return {
    selectedCaseTypes,
    selectedCourts,
    selectedJudgmentType,
    selectedPeriod,
    currentPage,
    totalPages,
    filteredResults,
    paginatedResults,
    handleCaseTypeChange,
    handleCourtChange,
    setSelectedJudgmentType,
    setSelectedPeriod,
    setCurrentPage
  };
}
