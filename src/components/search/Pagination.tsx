interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center mt-10 gap-2">
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="btn-minimal disabled:opacity-30 disabled:cursor-not-allowed"
      >
        &lt;
      </button> 
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border rounded-minimal font-light transition-all duration-200 ${
            currentPage === page 
              ? 'bg-minimal-charcoal text-white border-minimal-charcoal shadow-minimal' 
              : 'bg-[#F5F3EB] border-[#CFB982] text-minimal-dark-gray hover:bg-[#E8E0D0]'
          }`}
        >
          {page}
        </button>
      ))}
      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="btn-minimal disabled:opacity-30 disabled:cursor-not-allowed"
      >
        &gt;
      </button>
    </div>
  )
}
