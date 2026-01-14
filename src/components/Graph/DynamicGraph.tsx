import { useState, useMemo, useRef, useEffect } from 'react'; // useRef, useEffect 추가
import ReactECharts from 'echarts-for-react';

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

const CENTER_NODE: GraphNode = {
  id: 'center',
  name: '이번주\n키워드',
  category: 0,
  symbolSize: 110,
  label: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '900'
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
  symbolSize: 80,
  label: {
    fontSize: 12,
    fontWeight: 'bold'
  }
}));

const RELATED_DATA: Record<string, string[]> = {
  'root1': ['보증금 반환', 'HUG', '임차권 등기', '경매', '깡통전세'],
  'root2': ['재산분할', '양육권', '위자료', '협의이혼', '가정법원'],
  'root3': ['상해진단', '합의금', '정당방위', '특수폭행', '반의사 불벌'],
  'root4': ['과실비율', '음주운전', '대인배상', '형사합의', '뺑소니'],
  'root5': ['사이버 명예훼손', '모욕죄', '공연성', '사실적시', '허위사실'],
};

const CATEGORIES = [
  { name: '메인 허브', itemStyle: { color: '#8E5CE7' } },
  { name: '핵심 키워드', itemStyle: { color: '#2E81F3' } },
  { name: '연관 키워드', itemStyle: { color: '#49C56E' } }
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
            symbolSize: 70,
            label: {
              fontSize: 11,
              width: 45,
              overflow: 'break',
              lineHeight: 14
            }
          });

          links.push({ source: parentId, target: childId });
        });
      }
    });

    return {
      tooltip: { formatter: '{b}' },
      animationDuration: 1500,
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
          scaleLimit: { min: 0.35, max: 3 },
          draggable: true,
          
          label: {
            show: true,
            position: 'inside',
            formatter: '{b}',
            color: '#fff',
            align: 'center',
            verticalAlign: 'middle',
            fontWeight: 'bold'
          },
          
          lineStyle: {
            color: '#A0AEC0',
            width: 2,
            curveness: 0.1
          },
          force: {
            repulsion: 1000,
            edgeLength: [110, 270],
            gravity: 0.1,
            friction: 0.6
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: { width: 4 }
          }
        }
      ]
    };
  }, [expandedNodeIds]);

  return ( 
    <div className="w-full h-auto bg-white rounded-xl shadow-lg border border-gray-200 p-2 relative">
      <h2 className="text-xl font-bold mb-4 px-2">최근 핫이슈 법률 키워드</h2>
      <ReactECharts
        option={graphOption}
        style={{ height: '500%', width: '100%' }}
        onEvents={{ 'click': handleChartClick }}
        
        notMerge={false} 
      />
      <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
        <span className="bg-white/80 px-4 py-1 rounded-full text-sm text-gray-500 shadow-sm">
          파란색 노드를 클릭하여 연관 키워드를 탐색해보세요!
        </span>
      </div>
    </div>
  );
};

export default DynamicGraph;