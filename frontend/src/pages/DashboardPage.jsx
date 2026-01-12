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
import BookCard from '../components/cards/BookCard'
const BookCardSkeleton = () => {
  return (
    <div className='animate-pulse border border-slate-200 rounded-lg shadow-sm'>
      <div className='w-full aspect-[16/25] bg-slate-200 rounded-t-lg'></div>
      <div className='p-4'>
        <div className='h-6 bg-slate-200 rounded w-3/4 mb-2'></div>
        <div className='h-4 bg-slate-200 rounded w-1/2'></div>
      </div>
    </div>
  )
}
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
        if (response.data.success) {
          setBooks(response.data.data || [])
        } else {
          setBooks([])
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setBooks([])
        } else {
          toast.error(error.response?.data?.message || 'Something went wrong. Please try again.')
        }
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
    navigate('/editor')
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
          <Button className='whitespace-nowrap' onClick={handleCreateBookClick}>
            <Plus className='w-4 h-4 mr-2' />
            Create New eBooks
          </Button>
        </div>

        {isLoading ? (
          <div className=''>
            {Array.from({length:6}).map((_,index)=>(
              <BookCardSkeleton key={index} />
            ))}
          </div>
        ):books.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl mb-8'>
            <div className='w-16 h-16 bg-slate-100 rounded-full flex justify-center mb-4'>
              <Book className='w-8 h-8 text-slate-400'/>
            </div>
            <h3 className='text-lg font-medium text-slate-900 mb-2'>
              No eBooks found.
            </h3>
            <p className='text-slate-500 mb-6 max-w-md'>You have not created any eBooks yet. Get started by creating your first one.</p>
            <Button className='' onClick={handleCreateBookClick}>
              <Plus className='w-4 h-4 mr-2' />
              Create New eBook
            </Button>
          </div>
        ):(
          <div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 lg:grid-cols-3 gap-6'>
            {books.map((book)=>(
              <BookCard
                key={book._id}
                book={book}
                onDelete={()=>setBookToDelete(book)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage