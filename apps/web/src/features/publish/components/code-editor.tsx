"use client"

import Editor from "react-simple-code-editor"
import Prism from "prismjs"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-markdown"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-css"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: "markdown" | "typescript" | "javascript" | "css" | "markup"
  placeholder?: string
  padding?: number
}

export function CodeEditor({ 
  value, 
  onChange, 
  language = "markup",
  placeholder,
  padding = 16 
}: CodeEditorProps) {
  const highlight = (code: string) => {
    const lang = Prism.languages[language] || Prism.languages.markup
    return Prism.highlight(code, lang, language)
  }

  return (
    <div className="flex-1 overflow-auto font-mono text-sm">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlight}
        padding={padding}
        className="min-h-full bg-transparent"
        textareaClassName="focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  )
}

// Auto-detect language from file extension
export function getLanguageFromFilename(filename: string): CodeEditorProps["language"] {
  if (filename.endsWith('.md')) return 'markdown'
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript'
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript'
  if (filename.endsWith('.css')) return 'css'
  return 'markup'
}
