import { useState, useMemo, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
// ECharts의 그래픽 관련 타입을 가져옵니다.

interface GraphNode {
  id: string;
  name: string;
  category: number;
  symbolSize: number;
  x?: number;
  y?: number;
  fixed?: boolean;
  label?: any;
}

interface GraphLink {
  source: string;
  target: string;
} 

// === 디자인 시스템에 맞춘 컬러 팔레트 수정 및 하이라이트 색상 추가 ===
const COLORS = {
  // center: 이미지의 중앙 '핫이슈 키워드' 노드 색상 (금색/황토색)
  center: '#CFB982',
  // [NEW] 입체감을 위한 밝은 하이라이트 색상
  centerHighlight: '#EAD8B1',

  // root: 이미지의 1차 노드 색상 (짙은 네이비)
  root: '#1A233B',
  // [NEW] 입체감을 위한 밝은 하이라이트 색상
  rootHighlight: '#2A3454',

  // leaf: 이미지의 2차 노드 색상 (채도 낮은 파란색/하늘색)
  leaf: '#1A233B',
  // [NEW] 입체감을 위한 밝은 하이라이트 색상
  leafHighlight: '#3A4A6B',

  // line: 선 색상은 기존 유지 (은은한 회색)
  line: '#E2E8F0',
  text: '#FFFFFF',
};

// [NEW] 3D 볼륨감을 위한 방사형 그라데이션 생성 함수
const create3DGradient = (mainColor: string, highlightColor: string) => {
  return {
    type: 'radial' as const,
    x: 0.3, // 빛의 중심점 x좌표 (0~1, 왼쪽이 0) - 왼쪽 상단에서 빛이 들어오는 느낌
    y: 0.3, // 빛의 중심점 y좌표 (0~1, 위쪽이 0)
    r: 0.7, // 그라데이션 반경
    colorStops: [
      { offset: 0, color: highlightColor }, // 중심부 (가장 밝은 빛)
      // { offset: 0.5, color: mainColor },    // 중간톤
      { offset: 1, color: mainColor }       // 외곽부 (기본 색상, 약간 어둡게 처리됨)
    ],
    global: false // 상대 좌표 사용
  };
};

const CENTER_NODE: GraphNode = {
  id: 'center',
  name: '핫이슈\n키워드',
  category: 0,
  symbolSize: 100,
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Pretendard, sans-serif'
  }
};

const ROOT_NODES_DATA = [
  { id: 'root1', name: '전세사기' },
  { id: 'root2', name: '이혼' },
  { id: 'root3', name: '폭행' },
  { id: 'root4', name: '교통사고' },
  { id: 'root5', name: '명예훼손' },
];

const ROOT_NODES: GraphNode[] = ROOT_NODES_DATA.map(item => ({
  ...item,
  category: 1,
  symbolSize: 75,
  label: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Pretendard, sans-serif'
  }
}));

const RELATED_DATA: Record<string, string[]> = {
  'root1': ['보증금 반환', 'HUG', '임차권 등기', '경매', '깡통전세'],
  'root2': ['재산분할', '양육권', '위자료', '협의이혼', '가정법원'],
  'root3': ['상해진단', '합의금', '정당방위', '특수폭행', '반의사 불벌'],
  'root4': ['과실비율', '음주운전', '대인배상', '형사합의', '뺑소니'],
  'root5': ['사이버 명예훼손', '모욕죄', '공연성', '사실적시', '허위사실'],
};

// === [MODIFIED] 카테고리 스타일 정의 (3D 그라데이션 및 입체 그림자 적용) ===
const CATEGORIES = [
  {
    name: '메인 허브',
    itemStyle: {
      // [CHANGE] 단색 대신 그라데이션 적용
      color: create3DGradient(COLORS.center, COLORS.centerHighlight),
      // [CHANGE] 입체감을 위한 드롭 섀도우 설정
      shadowBlur: 12,
      shadowOffsetX: 3, // 그림자를 오른쪽 아래로 살짝 이동
      shadowOffsetY: 3,
      shadowColor: 'rgba(0, 0, 0, 0.2)' // 어두운 반투명 그림자
    }
  },
  {
    name: '핵심 키워드',
    itemStyle: {
      // [CHANGE] 단색 대신 그라데이션 적용
      color: create3DGradient(COLORS.root, COLORS.rootHighlight),
      // [CHANGE] 입체감을 위한 드롭 섀도우 설정
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowColor: 'rgba(0, 0, 0, 0.25)'
    }
  },
  {
    name: '연관 키워드',
    itemStyle: {
      // [CHANGE] 단색 대신 그라데이션 적용
      color: create3DGradient(COLORS.leaf, COLORS.leafHighlight),
      opacity: 1, // 그라데이션 표현을 위해 투명도 제거 (또는 1로 설정)
      // [CHANGE] 입체감을 위한 드롭 섀도우 설정
      shadowBlur: 6,
      shadowOffsetX: 1.5,
      shadowOffsetY: 1.5,
      shadowColor: 'rgba(0, 0, 0, 0.15)'
    }
  }
];

const DynamicGraph = () => {
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    isInitialized.current = true;
  }, []);

  const handleChartClick = (params: any) => {
    if (params.dataType !== 'node') return;
    const clickedNodeId = params.data.id;
    if (clickedNodeId === 'center') return;
    if (!RELATED_DATA[clickedNodeId]) return;

    setExpandedNodeIds((prev) => {
      if (prev.includes(clickedNodeId)) {
        return prev.filter(id => id !== clickedNodeId);
      } else {
        return [...prev, clickedNodeId];
      }
    });
  };

  const graphOption = useMemo(() => {
    const nodes: GraphNode[] = [CENTER_NODE, ...JSON.parse(JSON.stringify(ROOT_NODES))];
    const links: GraphLink[] = [];

    ROOT_NODES.forEach(node => {
      links.push({ source: 'center', target: node.id });
    });

    expandedNodeIds.forEach((parentId) => {
      const childNames = RELATED_DATA[parentId];
      if (childNames) {
        childNames.forEach((childName, index) => {
          const childId = `${parentId}-child-${index}`;

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
              fontWeight: '400'
            }
          });

          links.push({ source: parentId, target: childId });
        });
      }
    });

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
          fontSize: 12
        },
        padding: [8, 12],
        extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px;'
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
          ...(isInitialized.current ? {} : {
            center: ['50%', '50%'],
            zoom: 0.9
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
            // [NEW] 텍스트 가독성을 위한 미세한 그림자 추가
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowBlur: 2,
            textShadowOffsetX: 1,
            textShadowOffsetY: 1,
          },
          lineStyle: {
            color: COLORS.line,
            width: 1.5,
            curveness: 0.1,
            opacity: 0.8
          },
          force: {
            repulsion: 800,
            edgeLength: [80, 200],
            gravity: 0.1,
            friction: 0.6
          },
          emphasis: {
            focus: 'adjacency',
            scale: true,
            itemStyle: {
              // [CHANGE] 강조 시 그림자를 더 진하고 넓게
              shadowBlur: 20,
              shadowOffsetX: 4,
              shadowOffsetY: 4,
              shadowColor: 'rgba(0,0,0,0.4)'
            },
            lineStyle: {
              width: 3,
              opacity: 1
            }
          }
        }
      ]
    };
  }, [expandedNodeIds]);

  return (
    <div className="w-full h-auto bg-[#F5F3EB] rounded-minimal-lg border border-minimal-gray shadow-sm p-1 relative overflow-hidden">
      <div className="px-4 py-3 border-b border-minimal-gray flex items-center justify-between bg-[#F5F3EB] backdrop-blur-sm z-10 relative">
        <h2 className="text-xl font-medium text-[#CFB982] tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#CFB982] opacity-80"></span>
          최근 핫이슈 법률 연관 키워드
        </h2> 
      </div>

      <div className="w-full h-[600px] bg-[#F5F3EB]/30">
        <ReactECharts
          option={graphOption}
          style={{ height: '100%', width: '100%' }}
          onEvents={{ 'click': handleChartClick }}
          notMerge={false}
        />
      </div>

      {/* 하단 안내 메시지 */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center pointer-events-none z-10">
        <div className="bg-[#F5F3EB]/90 backdrop-blur-md px-5 py-2 rounded-full border border-[#CFB982] shadow-minimal flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: COLORS.root }}></span>
          <span className="text-xs text-minimal-medium-gray font-light tracking-wide">
            색 노드를 클릭하여 연관 키워드를 탐색해보세요
          </span>
        </div>
      </div>
    </div>
  );
};

export default DynamicGraph;