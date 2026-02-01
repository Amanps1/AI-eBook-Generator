import {useEffect, useState, useRef, use} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast'
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


import {arrayMove} from '@dnd-kit/sortable'
import axiosInstance from '../utils/axosinstance'
import { API_PATH } from "../utils/apiPaths";
import Dropdown, {DropDownItem} from '../components/ui/DropDown'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import SelectField from '../components/ui/SelectedField'

const EditorPage = () => {
  const {bookId} = useParams()
  const navigate= useNavigate()
  const [book, setBook] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('editor')
  const fileInputRef= useRef(null) 
  const [isSedwbarOpen, setIsSidebarOpen]= useState(false)
  const [isOutlineModalOpen, setIsOutlineModalOpen]= useState(false)
  const [aiTopic, setAiTopic]= useState('')
  const [aiStyle, setAiStyle]= useState('Informative')
  const [isGenerating, setIsGenerating]= useState(false)

  useEffect(() => {
    const feetchBook = async () =>{
      try {
        const response = await axiosInstance.get(
          `${API_PATH.BOOKS.GET_BOOK_BY_ID}/${bookId}`
        )
        setBook(response.data);
      } catch (error) {
        toast.error("Failed to fetch book data.")
        navigate('/dashboard')
      } finally {
        setIsLoading(false)
      }
    };
    feetchBook();
  }, [bookId, navigate]);

  const handelBookChange = (e) =>{
    const {name, value} = e.target
    setBook((prev)=>({...prev, [name]: value}))
  }
  return (
    <div>EditorPage</div>
  )
}

export default EditorPage