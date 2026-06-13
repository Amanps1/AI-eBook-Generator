import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Sparkles,
  FileDown,
  Save,
  Menu,
  X,
  Edit,
  NotebookText,
  ChevronDown,
  FileText,
} from "lucide-react";

import { arrayMove } from "@dnd-kit/sortable";
import axiosInstance from "../utils/axosinstance";
import { API_PATH } from "../utils/apiPaths";
import DropDown, { DropDownItem } from "../components/ui/DropDown";
import Button from "../components/ui/Button";
import ChapterSidebar from "../components/editor/ChapterSidebar";
import BookDetailsTab from "../components/editor/BookDetailsTab";
import ChapterEditorTab from "../components/editor/ChapterEditorTab";

const EditorPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("editor");
  const fileInputRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOutlineModalOpen, setIsOutlineModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiStyle, setAiStyle] = useState("Informative");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const feetchBook = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_PATH.BOOKS.GET_BOOK_BY_ID}/${bookId}`,
        );
        setBook(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch book data.");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    feetchBook();
  }, [bookId, navigate]);

  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleChapterChange = (index, field, value) => {
    setBook((prev) => {
      const chapters = Array.isArray(prev.chapter) ? [...prev.chapter] : [];
      const updatedChapter = { ...(chapters[index] || {}), [field]: value };
      chapters[index] = updatedChapter;
      return { ...prev, chapter: chapters };
    });
  };

  const handleAddChapter = () => {
    setBook((prev) => {
      const chapters = Array.isArray(prev.chapter) ? [...prev.chapter] : [];
      return {
        ...prev,
        chapter: [
          ...chapters,
          {
            title: `Chapter ${chapters.length + 1}`,
            description: "",
            content: "",
          },
        ],
      };
    });
    setSelectedChapterIndex((prevIndex) => prevIndex + 1);
  };

  const handleDeleteChapter = (index) => {
    setBook((prev) => {
      const chapters = Array.isArray(prev.chapter) ? [...prev.chapter] : [];
      const updatedChapters = chapters.filter((_, idx) => idx !== index);
      return { ...prev, chapter: updatedChapters };
    });
    setSelectedChapterIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleReorderChapters = (oldIndex, newIndex) => {
    setBook((prev) => {
      const chapters = Array.isArray(prev.chapter) ? [...prev.chapter] : [];
      return { ...prev, chapter: arrayMove(chapters, oldIndex, newIndex) };
    });
    setSelectedChapterIndex(newIndex);
  };

  const handleSaveBook = async (bookToSave = book) => {
    if (!bookToSave) return;
    setIsSaving(true);

    try {
      const payload = {
        title: bookToSave.title,
        subTitle: bookToSave.subTitle,
        author: bookToSave.author,
        chapter: bookToSave.chapter || [],
      };
      const response = await axiosInstance.put(
        `${API_PATH.BOOKS.UPDATE_ID}/${bookId}`,
        payload,
      );
      setBook(response.data.data);
      toast.success("Changes saved successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save book.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("coverImage", file);
      const response = await axiosInstance.put(
        `${API_PATH.BOOKS.UPDATE_COVER}/${bookId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setBook(response.data.data);
      toast.success("Cover image uploaded successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload cover image.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateChapterContent = async (index) => {
    if (!book?.chapter?.[index]) return;
    setIsGenerating(index);

    try {
      const chapter = book.chapter[index];
      const response = await axiosInstance.post(
        API_PATH.AI.GENERATE_CHAPTER_CONTENT,
        {
          chapterTitle: chapter.title,
          chapterDescription: chapter.description || "",
          style: aiStyle || "Informative",
        },
      );
      const content = response.data.content || "";
      setBook((prev) => {
        const chapters = Array.isArray(prev.chapter) ? [...prev.chapter] : [];
        chapters[index] = { ...chapters[index], content };
        return { ...prev, chapter: chapters };
      });
      toast.success("Chapter content generated. Save to keep changes.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate chapter content.",
      );
    } finally {
      setIsGenerating(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_PATH.EXPORT.PDF}/${bookId}`,
        { responseType: "arraybuffer" },
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${book.title || "ebook"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to export PDF.");
    }
  };

  const handleExportDoc = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_PATH.EXPORT.DOC}/${bookId}`,
        { responseType: "arraybuffer" },
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${book.title || "ebook"}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to export document.",
      );
    }
  };

  if (isLoading || !book) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading Editor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex bg-slate-50 font-sans relative min-h-screen">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 flex md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="fixed inset-0 bg-black/20 bg-opacity-75"
              aria-hidden="true"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
            <div className="relative flex flex-1 flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="sr-only">Close Sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <ChapterSidebar
                book={book}
                selectedChapterIndex={selectedChapterIndex}
                onSelectedChapter={(index) => {
                  setSelectedChapterIndex(index);
                  setIsSidebarOpen(false);
                }}
                onAddChapter={handleAddChapter}
                onDeleteChapter={handleDeleteChapter}
                onGenerateChapterContent={handleGenerateChapterContent}
                isGenerating={isGenerating}
                onReorderChapters={handleReorderChapters}
              />
            </div>

            <div className="flex-shrink-0 w-14 " aria-hidden="true"></div>
          </div>
        )}
        <div className="hidden md:flex md:flex-shrink-0 sticky top-0 h-screen">
          <ChapterSidebar
            book={book}
            selectedChapterIndex={selectedChapterIndex}
            onSelectedChapter={(index) => {
              setSelectedChapterIndex(index);
              setIsSidebarOpen(false);
            }}
            onAddChapter={handleAddChapter}
            onDeleteChapter={handleDeleteChapter}
            onGenerateChapterContent={handleGenerateChapterContent}
            isGenerating={isGenerating}
            onReorderChapters={handleReorderChapters}
          ></ChapterSidebar>
        </div>

        <main className="flex-1 h-full flex flex-col">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between p-3">
            <div className="flex item-center gap-2">
              <button
                className="md:hidden p-2 text-slate-500 hover:text-slate-800"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:flex space-x-2 bg-slate-100 p-1 rounded-lg">
                <button
                  className={`flex items-center justify-center flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${activeTab === "editor" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  onClick={() => setActiveTab("editor")}
                >
                  <Edit className="w-4 h-4 mr-2" /> Editor
                </button>
                <button
                  onClick={() => {
                    setActiveTab("details");
                  }}
                  className={`flex items-center justify-center flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${activeTab === "details" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <NotebookText className="w-4 h-4 mr-2" /> Book Details
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-8">
              <DropDown
                trigger={
                  <button
                    variant="secondary"
                    icon={FileDown}
                    className="flex gap-4"
                  >
                    Export
                    <ChevronDown className="w-4 h-4 mt-1" />
                  </button>
                }
              >
                <DropDownItem onClick={handleExportPDF}>
                  <FileText className="w-4 h-4 mr-2 text-slate-500" />
                  Export as PDF
                </DropDownItem>
                <DropDownItem onClick={handleExportDoc}>
                  <FileText className="w-4 h-4 mr-2 text-slate-500" />
                  Export as Document
                </DropDownItem>
              </DropDown>

              <Button
                onClick={() => handleSaveBook()}
                isLoading={isSaving}
                icon={Save}
              >
                Save Changes
              </Button>
            </div>
          </header>

          <div className="">
            {activeTab === "editor" ? (
              <ChapterEditorTab
                book={book}
                selectedChapterIndex={selectedChapterIndex}
                onChapterChange={handleChapterChange}
                onGenerateChapterContent={handleGenerateChapterContent}
                isGenerating={isGenerating}
              />
            ) : (
              <BookDetailsTab
                book={book}
                onBookChange={handleBookChange}
                onCoverImageUpload={handleCoverImageUpload}
                fileInputRef={fileInputRef}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default EditorPage;
