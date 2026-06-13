import {useState, useRef, useEffect} from 'react'
import {
  Plus,
  Sparkles,
  Trash2,
  ArrowLeft,
  BookOpen,
  Hash,
  Lightbulb,
  Palette
} from 'lucide-react'
import Modal from '../ui/Modal'
import InputField from '../ui/InputField'
import SelectedField from "../ui/SelectedField";
import Button from '../ui/Button'
import axiosInstance from '../../utils/axosinstance'
import {API_PATH} from '../../utils/apiPaths'
import toast from "react-hot-toast";
import {useAuth} from "../../context/AuthContext";

const CreateBookModals = ({isOpen, onClose, onBookCreated}) => {
  const {user}=useAuth();
  const [step, setStep]=useState(1);
  const [bookTitle, setBookTitle]=useState('');
  const [numChapters, setNumChapters]=useState(5);
  const [aiTopic, setAiTopic]=useState("");
  const [aiStyle, setAiStyle]=useState("Informative");
  const [chapters, setChapters]=useState([]);
  const [isGeneratingOutline, setIsGeneratingOutline]=useState(false);
  const [isFinilizingBook, setIsFinalizingBook]=useState(false);
  const chapterContainerRef=useRef(null);

  const resetModal=()=>{
    setStep(1);
    setBookTitle("");
    setNumChapters(5);
    setAiTopic("");
    setAiStyle("Informative");
    setChapters([]);
    setIsGeneratingOutline(false);
    setIsFinalizingBook(false);
  }

  const handleGenerateOutline=async()=>{
    if(!bookTitle || !numChapters){
      toast.error("Please provide book title and number of chapters.");
      return;
    }
    setIsGeneratingOutline(true);
    try {
      const response=await axiosInstance.post(API_PATH.AI.GENERATE_OUTLINE, {
        topic: bookTitle,
        description: aiTopic || "",
        style: aiStyle,
        numChapters: numChapters
      })
      setChapters(response.data.outline);
      setStep(2);
      toast.success("Outline generated successfully. Review and edit chapters.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate outline. Please try again.");
    }finally{
      setIsGeneratingOutline(false);
    }

  }

  const handleChapterChange=(index, field, value)=>{
    const updatedChapters=[...chapters];
    updatedChapters[index][field]=value;
    setChapters(updatedChapters);
  }

  const handleDeleteChapter=(index)=>{
    if(chapters.length<=1) return;
    setChapters(chapters.filter((_,i)=>i!==index));
  }

  const handleAddChapter=()=>{
    setChapters([...chapters, {title:`Chapter ${chapters.length+1}`, description:""}]);
  }

  const handleFinilizeBook=async()=>{
    if(!bookTitle || chapters.length===0){
      toast.error("Please provide book title and at least one chapter.");
      return;
    }
    setIsFinalizingBook(true);
    try {
      const response=await axiosInstance.post(API_PATH.BOOKS.CREATE_BOOK, {
        title: bookTitle,
        author: user.name || "Unknown Author",
        chapter: chapters
      })
      toast.success("eBook created successfully.");
      onBookCreated(response.data.data._id);
      onClose();
      resetModal();
    } catch (error) {
      console.log("TESR__", bookTitle, chapters);
      toast.error(error.response?.data?.message || "Failed to create eBook. Please try again.");
    }finally{
      setIsFinalizingBook(false);
    }
  }

  useEffect(()=>{
    if(step===2 && chapterContainerRef.current){
      const scrollableDiv=chapterContainerRef.current;
      scrollableDiv.scrollTo({
        top: scrollableDiv.scrollHeight,
        behavior: 'smooth'
      })
    }
  },[chapters.length, step])
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetModal();
      }}
      title="Create New eBook"
    >
      {step === 1 && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-600 text-sm font-semibold">
              1
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 "></div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 text-sm font-semibold">
              2
            </div>
          </div>
          <InputField
            icon={BookOpen}
            label="Book Title"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="Enter book title"
          />
          <InputField
            icon={Hash}
            label="Number of Chapters"
            type="number"
            value={numChapters}
            onChange={(e) => setNumChapters(parseInt(e.target.value || 1))}
            placeholder="5"
            min="1"
            max="20"
          />
          <InputField
            icon={Lightbulb}
            label="Topic (Optional)"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="Specific topics for AI generation..."
          />
          <SelectedField
            label="Style"
            name="style"
            icon={Palette}
            value={aiStyle}
            onChange={(e) => setAiStyle(e.target.value)}
            options={[
              { value: "Informative", label: "Informative" },
              { value: "Casual", label: "Casual" },
              { value: "Professional", label: "Professional" },
              { value: "Humorous", label: "Humorous" },
            ]}
          />

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleGenerateOutline}
              disabled={isGeneratingOutline}
            >
              {isGeneratingOutline ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Outline with AI
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-5">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-600 text-sm font-semibold">
              &#10003;
            </div>
            <div className="flex-1 h-0.5 bg-violet-600"></div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-600 text-sm font-semibold">2</div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Review Chapters</h3>
            <span className="text-sm text-gray-500">{chapters.length} Chapters</span>
          </div>

          <div ref={chapterContainerRef} className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {chapters.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No Chapters yet. Add one to get started.</p>
              </div>
            ) : (
              chapters.map((chapter, index) => (
                <div key={index} className="group p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all bg-white">
                  <div className="flex items-start gap-3 ">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-50 text-violet-600 text-sm font-semibold flex-shrink-0 mt-2">{index + 1}</div>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => handleChapterChange(index, "title", e.target.value)}
                      placeholder="Chapter Title"
                      className="flex-1 text-base font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    ></input>
                    <button
                      onClick={() => handleDeleteChapter(index)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <textarea
                    value={chapter.description}
                    onChange={(e) =>
                      handleChapterChange(index, "description", e.target.value)
                    }
                    placeholder="Brief description of what these chapter will cover..."
                    rows={2}
                    className="w-full pl-9 text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 resize-none placeholder-gray-400"
                  ></textarea>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setStep(1)} icon={ArrowLeft}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleAddChapter}
                icon={Plus}
              >
                Add Chapter
              </Button>
              <Button onClick={handleFinilizeBook} isLoading={isFinilizingBook}>
                Create eBook
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default CreateBookModals