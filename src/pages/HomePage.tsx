import { useState, useMemo, useRef, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

import LoginAlertModal from '../components/AlertModal/LoginAlertModal'

import logotext from '../assets/logotext.png'
import background2 from '../assets/background2.png'
import logow from '../assets/logow.png'
import graphbackground from '../assets/graphbackground.png'
import { Search, Gavel, FileText } from 'lucide-react'
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
  center: '#CFB982',
  centerHighlight: '#EAD8B1',
  root: '#3D4364',
  rootHighlight: '#222538',
  leaf: '#323958',
  leafHighlight: '#5C6B9C',
  line: '#B5A67B',
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
      shadowBlur: 12,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      shadowColor: 'rgba(0, 0, 0, 0.2)',
    },
  },
  {
    name: '핵심 키워드',
    itemStyle: {
      borderColor: '#B5A67B',
      borderWidth: 2,
      color: create3DGradient(COLORS.root, COLORS.rootHighlight),
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowColor: 'rgba(0, 0, 0, 0.25)',
    },
  },
  {
    name: '연관 키워드',
    itemStyle: {
      borderColor: '#B5A67B',
      borderWidth: 2,
      color: create3DGradient(COLORS.leaf, COLORS.leafHighlight),
      opacity: 1,
      shadowBlur: 6,
      shadowOffsetX: 1.5,
      shadowOffsetY: 1.5,
      shadowColor: 'rgba(0, 0, 0, 0.15)',
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
            width: 1.5,
            curveness: 0.1,
            opacity: 0.8,
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
              shadowBlur: 20,
              shadowOffsetX: 4,
              shadowOffsetY: 4,
              shadowColor: 'rgba(0,0,0,0.4)',
            },
            lineStyle: {
              width: 3,
              opacity: 1,
            },
          },
        },
      ],
    }
  }, [expandedNodeIds])

  return (
    <div 
      className="relative overflow-hidden border-lg border-minimal-gray rounded-minimal-lg shadow-minimal"
      style={{ width, height }}
    >
      <div
        className="w-full h-full relative"
        style={{
          backgroundImage: `url(${graphbackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute top-8 left-8 z-10 select-none">
          <h2 className="text-xl font-bold text-[#8C7B58] tracking-tight flex items-center gap-2 drop-shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C7B58] opacity-80"></span>
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
        <div className="bg-[#F5F3EB]/90 backdrop-blur-md pr-5 px-5 py-2 rounded-full border border-[#CFB982] shadow-minimal flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: COLORS.root }}
          ></span>
          <span className="text-xs text-minimal-medium-gray font-light tracking-wide">
            색 노드를 클릭하여 연관 키워드를 탐색해보세요
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

  const handleAIChatClick = () => {
    if (!isSignedIn) {
      setTargetPath('/ai-chat')
      setIsModalOpen(true)
      return
    }
    navigate('/ai-chat')
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
    <div className="min-h-screen bg-[#F5F3EB] font-serif overflow-x-auto">
      {/* [수정] 모든 내부 섹션이 일정한 최소 너비를 유지하도록 min-w-[1024px] 설정 */}
      <div className="min-w-[1024px] flex flex-col">
        <header className="flex justify-between items-center px-8 py-4 border-b border-minimal-gray bg-[#1A233B] font-serif">
          <button
            onClick={() => navigate('/')}
            className="pl-[3%] text-2xl font-medium text-minimal-charcoal hover:opacity-70 transition-opacity"
          >
            <div className="inline-block p-1 rounded-full">
              <img
                src={logow}
                alt="logo"
                className="w-10 h-10 object-contain justify-center items-center "
              />
            </div>
          </button>

          <div className="pr-[3%] flex gap-4 items-center">
            <SignedIn>
              <span className="text-sm text-white font-light">
                환영합니다 {user?.firstName || user?.username}님!
              </span>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
              <button
                onClick={() => navigate('/login')}
                className="btn-minimal"
              >
                로그인
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="btn-minimal-primary"
              >
                회원가입
              </button>
            </SignedOut>
          </div>
        </header>

        <div className="flex flex-col items-center justify-start w-full border-t-[3px] border-[#CFB982]">
          {/* 상단 로고 & 검색 섹션 */}
          <div
            className="w-full flex flex-col items-center justify-center py-20 px-6 mb-12 shadow-xl"
            style={{
              backgroundImage: `url(${background2})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="w-full max-w-5xl flex flex-col items-center gap-10">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => navigate('/')}
                  className="mb-2 transition-opacity hover:opacity-80 focus:outline-none"
                >
                  <img
                    src={logotext}
                    alt="LAWDING"
                    className="w-[320px] h-auto object-contain"
                  />
                </button>

                <p className="text-sm text-[#F5F3EB] font-medium tracking-wide drop-shadow-md">
                  국내 최초 AI 판례 검색 로딩중
                </p>
              </div>

              <form onSubmit={handleSearch} className="w-full flex justify-center">
                <div className="relative w-full max-w-2xl">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="키워드를 입력하세요"
                    className="w-full pl-6 pr-16 py-4 rounded-lg border border-gray-200 text-lg outline-none focus:border-[#CFB982] transition-colors placeholder:text-gray-400 shadow-lg font-sans"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-[#C8A45D] hover:bg-[#b8934d] text-[#F5F3EB] rounded-md w-12 flex items-center justify-center transition-colors"
                  >
                    <Search size={24} />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 액션 버튼 영역 */}
          <div className="flex gap-6 w-full max-w-5xl px-6 mb-16">
            <button
              onClick={handleAIChatClick}
              className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1A233B] via-[#253453] to-[#1A233B] p-8 text-left transition-all hover:shadow-lg hover:-translate-y-1 group"
            >
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#E2CD8C] mb-2">
                    나와 유사한 판례 찾기
                  </h3>
                  <p className="text-sm text-gray-300 font-light opacity-90">
                    AI 챗봇으로 필요한 판례를 찾아보세요!
                  </p>
                </div>
                <div className="rounded-full p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  <Gavel className="text-[#CFB982]" size={50} />
                </div>
              </div>
            </button>

            <button
              onClick={handleDocumentClick}
              className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1A233B] via-[#253453] to-[#1A233B] p-8 text-left transition-all hover:shadow-lg hover:-translate-y-1 group"
            >
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#E2CD8C] mb-2">
                    문서 작성하러 가기
                  </h3>
                  <p className="text-sm text-gray-300 font-light opacity-90">
                    문서 정리를 AI로 간단하게!
                  </p>
                </div>
                <div className="rounded-full p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  <FileText className="text-[#CFB982]" size={50} />
                </div>
              </div>
            </button>
          </div>

          {/* 그래프 섹션 */}
          <div className="w-full max-w-5xl px-6 mb-12">
              <DynamicGraph width="100%" height="773px" />
          </div>
        </div>
      </div>

      <LoginAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </div>
  )
}

export default HomePage