import { useState } from "react"
import ViewChapterSlider from "./ViewChapterSlider"

const ViewBook = ({ book }) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0)
  const chapters = Array.isArray(book.chapter) ? book.chapter : []
  const activeChapter = chapters[activeChapterIndex]

  const coverUrl = book.coverImage
    ? book.coverImage.startsWith("http")
      ? book.coverImage
      : `${window.location.origin}${book.coverImage}`
    : null

  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={book.title}
                className="h-full w-full rounded-3xl object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                No cover available
              </div>
            )}
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-slate-900">{book.title}</h1>
            <p className="text-slate-600">{book.subTitle}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>{book.author}</span>
              <span>{chapters.length} chapters</span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Chapter {activeChapterIndex + 1}</h2>
          {activeChapter ? (
            <div className="space-y-5">
              <p className="text-lg font-medium text-slate-800">{activeChapter.title}</p>
              {activeChapter.description && (
                <p className="text-slate-600">{activeChapter.description}</p>
              )}
              {activeChapter.content ? (
                <div className="space-y-4 text-slate-700">
                  {activeChapter.content.split(/\n{2,}/).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No content has been added to this chapter yet.</p>
              )}
            </div>
          ) : (
            <p className="text-slate-500">Select a chapter from the list to preview it here.</p>
          )}
        </div>
      </article>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Chapters</h2>
          <ViewChapterSlider
            chapters={chapters}
            selectedChapterIndex={activeChapterIndex}
            onSelect={setActiveChapterIndex}
          />
        </div>
      </aside>
    </div>
  )
}

export default ViewBook