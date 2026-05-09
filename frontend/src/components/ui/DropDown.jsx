import { useRef, useEffect, useState } from "react"
const DropDown = ({trigger, children}) => {
  const {isOpen, setIsOpen}=useState(false)
  const dropDownRef= useRef(null)

  useEffect(()=>{
    const handleClickOutside=(event)=>{
      if(dropDownRef.current && !dropDownRef.current.contains(event.target)){
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return ()=>{
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  return (
    <div className="relative inline-block text-left" ref={dropDownRef}>
      <div onClick={()=>setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-30 original-top-right rounded-lg bg-white shadow-lg border border-slate-200 focus:outline-none" role='menu' aria-orientation='vertical' aria-labelledby='menu-button'tabIndex={-1}>
          <div className="py-1 " role="none"> {children}</div>
        </div>
      )}
    </div>
  )
}
export const DropDownItem=({onClick, children})=>{
  return(
    <button onClick={onClick} role="menuitem" className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-700 text-left" tabIndex={-1}>{children}</button>
  )
}
export default DropDown