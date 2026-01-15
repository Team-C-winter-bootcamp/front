import { useState, useMemo, useEffect } from 'react'
import { SearchResult } from '../pages/SearchResultsPage'

export const useSearchFilters = (
  results: SearchResult[],
  query: string,
  activeTab: 'expert' | 'all' | 'ai'
) => {
  const [selectedCaseTypes, setSelectedCaseTypes] = useState<string[]>([])
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [selectedJudgmentType, setSelectedJudgmentType] = useState<string>('전체')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('전체 기간')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const filteredResults = useMemo(() => {
    let filtered = results

    if (query) {
      filtered = filtered.filter(r => 
        r.title.includes(query) || r.content.includes(query)
      )
    }

    if (activeTab === 'expert') {
      filtered = filtered.filter(r => 
        r.court.includes('대법원') || r.court.includes('고등법원') || r.court.includes('특허법원')
      )
    }

    if (selectedCaseTypes.length > 0) {
      filtered = filtered.filter(r => selectedCaseTypes.includes(r.caseType))
    }

    if (selectedCourts.length > 0) {
      filtered = filtered.filter(r => 
        selectedCourts.some(court => {
          if (court === '대법원') return r.court.includes('대법원')
          if (court === '고등/특허/고등법원') return r.court.includes('고등법원') || r.court.includes('특허법원')
          if (court === '지방법원') return r.court.includes('지방법원')
          if (court === '행정/가정/회생/군사법원') return r.court.includes('행정법원') || r.court.includes('가정법원')
          if (court === '헌법재판소') return r.court.includes('헌법재판소')
          return false
        })
      )
    }

    if (selectedJudgmentType !== '전체') {
      filtered = filtered.filter(r => r.judgmentType === selectedJudgmentType)
    }

    return filtered
  }, [query, activeTab, selectedCaseTypes, selectedCourts, selectedJudgmentType, results])

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredResults.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredResults, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [query, activeTab, selectedCaseTypes, selectedCourts, selectedJudgmentType])

  const handleCaseTypeChange = (type: string) => {
    if (type === '') {
      setSelectedCaseTypes([])
    } else {
      setSelectedCaseTypes(prev =>
        prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
      )
    }
  }

  const handleCourtChange = (court: string) => {
    if (court === '') {
      setSelectedCourts([])
    } else {
      setSelectedCourts(prev =>
        prev.includes(court) ? prev.filter(c => c !== court) : [...prev, court]
      )
    }
  }

  return {
    selectedCaseTypes,
    selectedCourts,
    selectedJudgmentType,
    selectedPeriod,
    currentPage,
    filteredResults,
    paginatedResults,
    totalPages,
    setSelectedJudgmentType,
    setSelectedPeriod,
    setCurrentPage,
    handleCaseTypeChange,
    handleCourtChange
  }
}
