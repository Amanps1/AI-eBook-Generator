import React from 'react'
import InputField from '../ui/InputField'
import Button from '../ui/Button'
import { Camera, Image } from 'lucide-react'
import { BASE_URL } from '../../utils/apiPaths'

const BookDetailsTab = ({ book, onBookChange, onCoverImageUpload, fileInputRef, isUploading }) => {
  const coverUrl = book.coverImage
    ? book.coverImage.startsWith("http")
      ? book.coverImage
      : `${BASE_URL}${book.coverImage}`
    : null;

  return (
    <div className="p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-5">Book information</h2>
          <div className="space-y-5">
            <InputField
              label="Title"
              name="title"
              value={book.title || ''}
              onChange={onBookChange}
              placeholder="Enter your book title"
            />
            <InputField
              label="Sub-title"
              name="subTitle"
              value={book.subTitle || ''}
              onChange={onBookChange}
              placeholder="Add a subtitle or hook"
            />
            <InputField
              label="Author"
              name="author"
              value={book.author || ''}
              onChange={onBookChange}
              placeholder="Author name"
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-5">Cover image</h2>
          <div className="rounded-3xl border border-dashed border-slate-200 p-5 flex flex-col items-center justify-center text-center gap-4">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="Book cover"
                className="w-full max-w-xs rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-48 w-full max-w-xs items-center justify-center rounded-3xl bg-slate-50 text-slate-500">
                <div>
                  <Image className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                  <p className="text-sm">No cover uploaded yet</p>
                </div>
              </div>
            )}

            <div className="space-y-2 w-full">
              <Button
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                icon={Camera}
                isLoading={isUploading}
              >
                {coverUrl ? 'Replace cover image' : 'Upload cover image'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onCoverImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetailsTab