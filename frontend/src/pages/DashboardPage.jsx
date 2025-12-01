import React from 'react'
import {useState, useEffect} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {toast} from 'react-hot-toast'
import {Plus, Book} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import {useAuth} from '../context/AuthContext'
import Button from '../components/ui/Button'
import axiosInstance from '../utils/axosinstance'
import {API_PATH} from '../utils/apiPaths'

const DashboardPage = () => {
  const [books,setBooks]=useState([])
  const [isLoading,setIsLoading]=useState(false)
  const [isCreateModelOpen,setIsCreateModelOpen]=useState(false)
  const [bookToDelete,setBookToDelete]=useState(null)
  const {user}=useAuth()
  const navigate=useNavigate()
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true)
      try {
        const response = await axiosInstance.get(API_PATH.BOOKS.GET_BOOKS)
        setBooks(response.data)
      } catch (error) {
        toast.error(error.response?.data?.message || 'Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    };
    fetchBooks();
  }, [])
  
  const handleDeleteBook = async (bookId) => {
    if(!bookToDelete) return;
  }

  const handleCreateBookClick=()=>{
    setIsCreateModelOpen(true)
  }

  const handleBookCreated=(bookId)=>{
    setIsCreateModelOpen(false)
    navigate(`/editor/${bookId}`)
  }
  return (
    <DashboardLayout>
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-lg font-bold text-slate-900'>All eBooks</h1>
            <p className='text-[13px] text-slate-600 mt-1'>Create, edit, and manage all your AI-generated eBooks</p>
          </div>
          <Button className='whitespace-nowrap' onClick={handleCreateBookClick} icon={Plus}>
            Create New eBooks
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage