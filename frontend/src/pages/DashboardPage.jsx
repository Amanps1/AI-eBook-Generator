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
import CreateBookModals from '../components/modals/CreateBookModals'
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

const ConfirmationModal=({isOpen, onClose, onConfirm, title, message})=>{
  if(!isOpen) return null;
  return (
    <div className='fixed inset-0 z-50 overflow-x-auto'>
      <div className='flex items-center justify-center min-h-screen px-4 text-center'>
        <div className='fixed inset-0 bg-black/50 bg-opacity-25 transition-opacity' onClick={onClose}></div>
        <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative'>
          <h3 className='text-lg font-semibold text-slate-900 mb-4'>
            {title}
          </h3>
          <p className='text-slate-600 mb-6'>{message}</p>
          <div className='flex justify-end space-x-3'>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} className='bg-red-600 text-white hover:bg-red-700'>Confirm</Button>
          </div>
        </div>
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
  
  const handleDeleteBook = async () => {
    if(!bookToDelete) return;
    try{
      await axiosInstance.delete(`${API_PATH.BOOKS.DELETE_ID}/${bookToDelete._id}`);
      setBooks(books.filter((book)=>book._id !== bookToDelete._id));
      toast.success('eBook deleted successfully');
    }catch(error){
      toast.error(error.response?.data?.message || 'Failed to delete eBook. Please try again.');
    }finally{
      setBookToDelete(null);

    }
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
        <ConfirmationModal 
          isOpen={!!bookToDelete}
          onClose={()=>setBookToDelete(null)}
          onConfirm={handleDeleteBook}
          title="Delete eBook"
          message="Are you sure you want to delete this eBook? This action cannot be undone."
        />
        <CreateBookModals
          isOpen={isCreateModelOpen}
          onClose={()=>setIsCreateModelOpen(false)}
          onBookCreated={handleBookCreated}
        />
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage