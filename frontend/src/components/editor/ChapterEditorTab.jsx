import { useMemo, useState } from "react"
import { Sparkles, Type, Eye, Maximize2 } from "lucide-react"
import Button from "../ui/Button"
import InputField from "../ui/InputField"
const ChapterEditorTab = (
    {
        book={
            title: 'Untitled',
            Chpters: [
                {
                    title: 'Chapter 1',
                    content:"-"
                }
            ]
        },
        selectedChapterIndex=0,
        onChapterChange=()=>{},
        onGenerateChapterContent=()=>{},
        isGenerating
    }
) => {
    const {isPreviousMode, SetIsPreviousMode} = useState(false)
    const {isFullScreen, setIsFullScreen} = useState(false)

    const formatMarkDown=()=>{

    }

    const mdeOptions= useMemo(() =>{
        return {
            autofocus: true,
            spellChecker: false,
            toolbar:[
                "bold","italic","strikethrough","heading","|",
                "quote","unordered-list","ordered-list","|",
                "link","image","table","|",
                "preview","side-by-side","fullscreen"
            ]
        }
    }, [])

  return (

    <div>ChapterEditorTab</div>
  )
}

export default ChapterEditorTab