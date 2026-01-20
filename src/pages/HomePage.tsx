import { useState, useMemo, useRef, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

import LoginAlertModal from '../components/AlertModal/LoginAlertModal'

import logotext from '../assets/logotext.png'
import logow from '../assets/logow.png'
import { Search, FileText } from 'lucide-react'
import ReactECharts from 'echarts-for-react'

interface GraphNode {
  id: string
  name: string
  category: number
  symbolSize: number
  x?: number
  y?: number
  fixed?: boolean
  label?: any
}

interface GraphLink {
  source: string
  target: string
}

interface DynamicGraphProps {
  width?: string | number
  height?: string | number
}

const COLORS = {
  center: '#6366f1', // Indigo
  centerHighlight: '#a5b4fc', // Light indigo
  root: '#4f46e5', // Indigo 600
  rootHighlight: '#3730a3', // Indigo 800
  leaf: '#4338ca', // Indigo 700
  leafHighlight: '#312e81', // Indigo 900
  line: '#c7d2fe', // Light indigo (연결선)
  text: '#FFFFFF',
}

const create3DGradient = (mainColor: string, highlightColor: string) => {
  return {
    type: 'radial' as const,
    x: 0.3,
    y: 0.3,
    r: 0.7,
    colorStops: [
      { offset: 0, color: highlightColor },
      { offset: 1, color: mainColor },
    ],
    global: false,
  }
}

const CENTER_NODE: GraphNode = {
  id: 'center',
  name: '핫이슈\n키워드',
  category: 0,
  symbolSize: 100,
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Pretendard, sans-serif',
  },
}

const ROOT_NODES_DATA = [
  { id: 'root1', name: '전세사기' },
  { id: 'root2', name: '이혼' },
  { id: 'root3', name: '폭행' },
  { id: 'root4', name: '교통사고' },
  { id: 'root5', name: '명예훼손' },
]

const ROOT_NODES: GraphNode[] = ROOT_NODES_DATA.map((item) => ({
  ...item,
  category: 1,
  symbolSize: 75,
  label: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Pretendard, sans-serif',
  },
}))

const RELATED_DATA: Record<string, string[]> = {
  root1: ['보증금 반환', 'HUG', '임차권 등기', '경매', '깡통전세'],
  root2: ['재산분할', '양육권', '위자료', '협의이혼', '가정법원'],
  root3: ['상해진단', '합의금', '정당방위', '특수폭행', '반의사 불벌'],
  root4: ['과실비율', '음주운전', '대인배상', '형사합의', '뺑소니'],
  root5: ['사이버 명예훼손', '모욕죄', '공연성', '사실적시', '허위사실'],
}

const CATEGORIES = [
  {
    name: '메인 허브',
    itemStyle: {
      color: create3DGradient(COLORS.center, COLORS.centerHighlight),
      shadowBlur: 16,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      shadowColor: 'rgba(99, 102, 241, 0.3)',
    },
  },
  {
    name: '핵심 키워드',
    itemStyle: {
      borderColor: '#c7d2fe',
      borderWidth: 2,
      color: create3DGradient(COLORS.root, COLORS.rootHighlight),
      shadowBlur: 12,
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      shadowColor: 'rgba(79, 70, 229, 0.25)',
    },
  },
  {
    name: '연관 키워드',
    itemStyle: {
      borderColor: '#e0e7ff',
      borderWidth: 2,
      color: create3DGradient(COLORS.leaf, COLORS.leafHighlight),
      opacity: 1,
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      shadowColor: 'rgba(67, 56, 202, 0.2)',
    },
  },
]

const DynamicGraph = ({ width = '100%', height = '700px' }: DynamicGraphProps) => {
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([])
  const isInitialized = useRef(false)

  useEffect(() => {
    isInitialized.current = true
  }, [])

  const handleChartClick = (params: any) => {
    if (params.dataType !== 'node') return
    const clickedNodeId = params.data.id
    if (clickedNodeId === 'center') return
    if (!RELATED_DATA[clickedNodeId]) return

    setExpandedNodeIds((prev) => {
      if (prev.includes(clickedNodeId)) {
        return prev.filter((id) => id !== clickedNodeId)
      } else {
        return [...prev, clickedNodeId]
      }
    })
  }

  const graphOption = useMemo(() => {
    const nodes: GraphNode[] = [CENTER_NODE, ...JSON.parse(JSON.stringify(ROOT_NODES))]
    const links: GraphLink[] = []

    ROOT_NODES.forEach((node) => {
      links.push({ source: 'center', target: node.id })
    })

    expandedNodeIds.forEach((parentId) => {
      const childNames = RELATED_DATA[parentId]
      if (childNames) {
        childNames.forEach((childName, index) => {
          const childId = `${parentId}-child-${index}`

          nodes.push({
            id: childId,
            name: childName,
            category: 2,
            symbolSize: 60,
            label: {
              fontSize: 11,
              width: 45,
              overflow: 'break',
              lineHeight: 14,
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: '400',
            },
          })

          links.push({ source: parentId, target: childId })
        })
      }
    })

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}',
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        textStyle: {
          color: '#2D3748',
          fontFamily: 'Pretendard, sans-serif',
          fontSize: 12,
        },
        padding: [8, 12],
        extraCssText:
          'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px;',
      },
      animationDuration: 1000,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: links,
          categories: CATEGORIES,
          ...(isInitialized.current
            ? {}
            : {
                center: ['50%', '50%'],
                zoom: 0.9,
              }),
          roam: true,
          scaleLimit: { min: 0.5, max: 2.5 },
          draggable: true,
          label: {
            show: true,
            position: 'inside',
            formatter: '{b}',
            color: '#fff',
            align: 'center',
            verticalAlign: 'middle',
            fontFamily: 'Pretendard, sans-serif',
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowBlur: 2,
            textShadowOffsetX: 1,
            textShadowOffsetY: 1,
          },
          lineStyle: {
            color: COLORS.line,
            width: 2,
            curveness: 0.15,
            opacity: 0.6,
          },
          force: {
            repulsion: 800,
            edgeLength: [80, 200],
            gravity: 0.1,
            friction: 0.6,
          },
          emphasis: {
            focus: 'adjacency',
            scale: true,
            itemStyle: {
              shadowBlur: 24,
              shadowOffsetX: 0,
              shadowOffsetY: 6,
              shadowColor: 'rgba(99, 102, 241, 0.4)',
            },
            lineStyle: {
              width: 3,
              opacity: 0.8,
              color: '#a5b4fc',
            },
          },
        },
      ],
    }
  }, [expandedNodeIds])

  return (
    <div 
      className="relative overflow-hidden"
      style={{ width, height }}
    >
      <div
        className="w-full h-full relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      >
        <div className="absolute top-8 left-8 z-10 select-none">
          <h2 className="text-xl font-bold text-indigo-700 tracking-tight flex items-center gap-2 drop-shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 opacity-90 shadow-sm"></span>
            최근 핫이슈 법률 연관 키워드
          </h2>
        </div>

        <ReactECharts
          option={graphOption}
          style={{ height: '100%', width: '100%' }}
          onEvents={{ click: handleChartClick }}
          notMerge={false}
        />
      </div>

      <div className="absolute bottom-6 left-0 w-full flex justify-center pointer-events-none z-10">
        <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full border border-indigo-200 shadow-xl shadow-indigo-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse bg-indigo-600 shadow-sm"></span>
          <span className="text-xs text-slate-700 font-medium tracking-wide">
            노드를 클릭하여 연관 키워드를 탐색해보세요
          </span>
        </div>
      </div>
    </div>
  )
}

const HomePage = () => {
  const navigate = useNavigate()
  const { isSignedIn, user } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetPath, setTargetPath] = useState<string>('')

  // 페이지 진입 시 상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleModalConfirm = () => {
    setIsModalOpen(false)
    navigate('/login', { state: { from: targetPath } })
  }

  const handleDocumentClick = () => {
    if (!isSignedIn) {
      setTargetPath('/document')
      setIsModalOpen(true)
      return
    }
    navigate('/document')
  }

  return (
    /* [수정] overflow-x-auto를 추가하여 창이 작아질 때 가로 스크롤이 생기도록 함 */
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white overflow-x-auto">
      {/* [수정] 모든 내부 섹션이 일정한 최소 너비를 유지하도록 min-w-[1024px] 설정 */}
      <div className="min-w-[1024px] flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
          <button
            onClick={() => navigate('/home')}
            className="text-2xl font-black tracking-tighter text-indigo-600 hover:opacity-70 transition-opacity"
          >
            LAWDING
          </button>

          <div className="flex gap-4 items-center">
            <SignedIn>
              <span className="text-sm text-slate-700 font-light">
                환영합니다 {user?.firstName || user?.username}님!
              </span>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
              >
                로그인
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95"
              >
                회원가입
              </button>
            </SignedOut>
          </div>
        </header>

        <div className="flex flex-col items-center justify-start w-full pt-24">
          {/* 상단 로고 & 검색 섹션 */}
          <div
            className="w-full flex flex-col items-center justify-center py-20 px-6 mb-12 bg-gradient-to-b from-slate-50 to-white"
          >
            <div className="w-full max-w-5xl flex flex-col items-center gap-10">
              <div className="flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight text-center">
                  법례 검색의 새로운 기준 <br />
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">LAWDING</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium tracking-wide">
                  국내 최초 AI 판례 검색
                </p>
              </div>

              <form onSubmit={handleSearch} className="w-full flex justify-center">
                <div className="relative max-w-2xl w-full group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-purple-200 p-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="궁금한 법례 키워드를 입력하세요"
                      className="flex-1 bg-transparent px-6 py-3 text-base outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center shadow-md"
                    >
                      <Search size={20} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* 액션 버튼 영역 제거 - floating button으로 이동 */}

          {/* 그래프 섹션 */}
          <div className="w-full max-w-5xl px-6 mb-12">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <DynamicGraph width="100%" height="773px" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Document Button */}
      <button
        onClick={handleDocumentClick}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl shadow-xl shadow-indigo-200 transition-all duration-200 flex items-center gap-2 z-50 hover:scale-105 active:scale-95"
      >
        <FileText size={20} />
        <span className="font-medium text-sm">문서 작성</span>
      </button>

      <LoginAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </div>
  )
}

export default HomePage