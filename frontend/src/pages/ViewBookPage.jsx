import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { toast } from "react-hot-toast"
import axiosInstance from "../utils/axosinstance"
import { API_PATH } from "../utils/apiPaths"
import DashboardLayout from "../components/layout/DashboardLayout"
import ViewBook from "../components/view/ViewBook"
import Button from "../components/ui/Button"

const ViewBookPage = () => {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axiosInstance.get(`${API_PATH.BOOKS.GET_BOOK_BY_ID}/${bookId}`)
        setBook(response.data.data)
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load this eBook.")
        navigate("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBook()
  }, [bookId, navigate])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading book...</p>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button variant="secondary" onClick={() => navigate(-1)} icon={ArrowLeft}>
            Back
          </Button>
          <Button onClick={() => navigate(`/editor/${bookId}`)}>
            Edit eBook
          </Button>
        </div>
        <ViewBook book={book} />
      </div>
    </DashboardLayout>
  )
}

export default ViewBookPage