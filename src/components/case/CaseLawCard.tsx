import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface CaseLawProps {
  title: string;
  citation: string;
  relevance: string;
  snippet: string;
  isUnfavorable?: boolean;
  onViewDetails: () => void;
}

export function CaseLawCard({
  title,
  citation,
  relevance,
  snippet,
  isUnfavorable,
  onViewDetails
}: CaseLawProps) {
  return (
    <Card
      className="hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:border-indigo-300"
      onClick={onViewDetails}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-500 font-mono mt-1">{citation}</p>
        </div>
        {isUnfavorable && (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            혼합 결과
          </Badge>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-indigo-600 mb-2">{relevance}</p>
        <div className="bg-yellow-50 border-l-4 border-yellow-300 p-3 rounded-r-md shadow-sm">
          <p className="text-sm text-slate-700 italic">"{snippet}"</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="text-sm font-medium text-slate-600 hover:text-indigo-600 flex items-center transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
        >
          상세 보기 <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </Card>
  );
}
