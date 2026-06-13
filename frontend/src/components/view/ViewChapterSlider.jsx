const ViewChapterSlider = ({ chapters = [], selectedChapterIndex = 0, onSelect = () => {} }) => {
  return (
    <div className="space-y-3">
      {chapters.length === 0 ? (
        <p className="text-sm text-slate-500">No chapters available yet.</p>
      ) : (
        chapters.map((chapter, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`w-full rounded-3xl border p-4 text-left transition ${
              selectedChapterIndex === index
                ? "border-violet-500 bg-violet-50 text-violet-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <p className="font-semibold truncate">{chapter.title || `Chapter ${index + 1}`}</p>
            {chapter.description && (
              <p className="text-sm text-slate-500 mt-1 overflow-hidden text-ellipsis">{chapter.description}</p>
            )}
          </button>
        ))
      )}
    </div>
  )
}

export default ViewChapterSlider