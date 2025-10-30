const Book=require("../models/Book");


const createBook=async(req,res)=>{

    try {
        const {title,author,subTitle,chapter}=req.body;

        if(!title || !author){
            return res.status(400).json({success:false,message:"Title and Author are required"});
        }

        const book=await Book.create({
            userId:req.user._id,
            title,
            author,
            subTitle,
            chapter
        })
        res.status(201).json({success:true,data:book,message:"Book created successfully"});
    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }

}

const getBooks=async(req,res)=>{

    try {
        const books=await Book.find({userId:req.user._id}).sort({createdAt:-1});
        
        if(!books || books.length === 0){
            return res.status(404).json({
                success:false,
                message:"No books found"
            })
        }

        return res.status(200).json({
            success:true,
            data:books
        })

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
}

const getBookById=async(req,res)=>{

    try {
        const book = await Book.findById(req.params.id);
        
        if(!book){
            return res.status(404).json({
                success:false,
                message:"Book not found"
            })
        }
        
        if(book.userId.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success:false,
                message:"Not authorized to view this book"
            })
        }
        
        res.status(200).json({
            success:true,
            data:book
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// const updateBook=async(req,res)=>{
//     try {
//         const book=await Book.findById(req.params.id);
//         if(!book){
//             return res.status(404).json({
//                 success:false,
//                 message:"Book not found"
//             })
//         }
//         if(book.userId.toString() !== req.user._id.toString()){
//             return res.status(401).json({
//                 success:false,
//                 message:"Not authorized to update this book"
//             })
//         }
//          const updatedBook = await Book.findByIdAndUpdate(
//            req.params.id,
//            {
//              $set: {
//                title: req.body.title,
//                subTitle: req.body.subTitle,
//                author: req.body.author,
//                chapter: req.body.chapter, // full array replacement
//              },
//            },
//            { new: true, runValidators: true }
//          );
//         return res.status(200).json({
//             success:true,
//             data:updatedBook,
//             message:"Book updated successfully"
//         })
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
// }
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this book",
      });
    }


    if (req.body.title) book.title = req.body.title;
    if (req.body.subTitle) book.subTitle = req.body.subTitle;
    if (req.body.author) book.author = req.body.author;
    if (req.body.coverImage) book.coverImage = req.body.coverImage;
    if (req.body.status) book.status = req.body.status;

    if (req.body.chapter) {
      book.chapter = req.body.chapter; 
    }

    await book.save();

    return res.status(200).json({
      success: true,
      data: book,
      message: "Book updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBook=async(req,res)=>{
    try {
        const book=await Book.findById(req.params.id);

        if(!book){
            return res.status(404).json({
                success:false,
                message:"Book not fiund"
            })
        }
        
        if(book.userId.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success:false,
                message:"Not authorized to delete this book"
            })
        }
        await book.deleteOne();
        return res.status(200).json({
            success:true,
            message:"Book deleted Successfully"
        })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
}

const updateBookCover=async(req,res)=>{
    try {
        if(!req.file){
            return res.status(400).json({success:false,message:"No file uploaded"});
        }
        
        const book=await Book.findById(req.params.id);

        if(!book){
            return res.status(404).json({
                success:false,
                message:"Book not found"
            })
        }   

        if(book.userId.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success:false,
                message:"Not authorized to update this book"
            })
        }   

        book.coverImage=`/uploads/${req.file.filename}`;
        const updatedBook=await book.save();

        return res.status(200).json({
            success:true,
            data:updatedBook,
            message:"Book cover image updated successfully"
        });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }       

}

module.exports={createBook,getBooks,getBookById,updateBook,deleteBook,updateBookCover};

