import { useState } from "react"
import MDEditor from "@uiw/react-md-editor"
import { Sparkles, Eye, Maximize2 } from "lucide-react"
import Button from "../ui/Button"
import InputField from "../ui/InputField"
import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"

const ChapterEditorTab = ({
  book = { title: "Untitled", chapter: [{ title: "Chapter 1", content: "" }] },
  selectedChapterIndex = 0,
  onChapterChange = () => {},
  onGenerateChapterContent = () => {},
  isGenerating,
}) => {
  const [isPreview, setIsPreview] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const chapter = book?.chapter?.[selectedChapterIndex] || {
    title: "Untitled chapter",
    description: "",
    content: "",
  }

  const renderContentPreview = () => {
    if (!chapter.content) {
      return <p className="text-slate-500">No chapter content yet. Use the editor or generate content with AI.</p>
    }

    return chapter.content.split(/\n{2,}/).map((paragraph, index) => (
      <p key={index} className="mb-4 leading-7 text-slate-700">
        {paragraph}
      </p>
    ))
  }

  return (
    <div className={`${isFullScreen ? "fixed inset-0 z-50 bg-white p-6" : "p-6"}`}>
      <div className="flex flex-col gap-4 mb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{chapter.title || `Chapter ${selectedChapterIndex + 1}`}</h1>
          <p className="text-sm text-slate-500">Edit your chapter and refine the content with AI assistance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onGenerateChapterContent(selectedChapterIndex)}
            isLoading={isGenerating === selectedChapterIndex}
            icon={Sparkles}
          >
            Generate content
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsPreview((prev) => !prev)} icon={Eye}>
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsFullScreen((prev) => !prev)} icon={Maximize2}>
            {isFullScreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>
      </div>

      <div className="grid gap-5">
        <InputField
          label="Chapter Title"
          name="title"
          value={chapter.title || ""}
          onChange={(e) => onChapterChange(selectedChapterIndex, "title", e.target.value)}
          placeholder="Chapter title"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Chapter Description</label>
          <textarea
            rows={3}
            value={chapter.description || ""}
            onChange={(e) => onChapterChange(selectedChapterIndex, "description", e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
            placeholder="Write a short description for this chapter"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          {isPreview ? (
            <div className="prose prose-slate max-w-none">{renderContentPreview()}</div>
          ) : (
            <MDEditor
              value={chapter.content || ""}
              onChange={(value) => onChapterChange(selectedChapterIndex, "content", value || "")}
              height={520}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ChapterEditorTab