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
                  <Sparkles className='w-4 h-4 mr-2 animate-spin' />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className='w-4 h-4 mr-2' />
                  Generate Outline with AI
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className=''>
          {/* Progress Indicator */}
          <div className=''>
            <div className=''>
              &#10003;
            </div>
            <div className=''></div>
            <div className=''>
              2
            </div>
          </div>

          <div className=''>
            <h3 className=''>
              Review Chapters
            </h3>
            <span className=''>
              {chapters.length} Chapters
            </span>
          </div>

          <div 
            ref={chapterContainerRef}
            className=''
          >
            {chapters.length === 0 ? (
              <div className=''>
                <BookOpen className=''/>
                <p className=''>
                  No Chapters yet. Add one to get started.
                </p>
              </div>
            ) : (
              chapters.map((chapter, index) => (
                <div key={index} className=''>
                  <div className=''>
                    <div className=''>{index+1}</div>
                    <input type="text" value={chapter.title} onChange={(e)=>handleChapterChange()} placeholder='Chapter Title'  className=''></input>
                    <button onClick={()=>handleDeleteChapter(index)} className='' title="Delete Chapter">
                      <Trash2 className=''/>
                    </button>
                  </div>
                  <Textarea 
                    value={chapter.description}
                    onChange={(e)=>handleChapterChange(index, "description", e.target.value)}
                    placeholder='Brief description of what these chapter will cover...'
                    rows={2}
                    className=''
                    ></Textarea>
                </div>
              ))
            )}
          </div>

          <div className=''>
            
          </div>
        </div> 
      )}
    </Modal>  
  );
}

export default CreateBookModals