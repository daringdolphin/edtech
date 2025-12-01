/*
<ai_context>
Client component for the paper editor.
Handles TipTap editor state, auto-save, title editing, and question block management.
</ai_context>
*/

"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Loader2, MoreHorizontal, Trash2 } from "lucide-react"

import { SelectPaper, SelectPaperBlock } from "@/db/schema"
import { updatePaperAction, deletePaperAction } from "@/actions/db/papers-actions"
import {
  addQuestionToPaperAction,
  updatePaperBlockAction,
  deletePaperBlockAction
} from "@/actions/db/paper-blocks-actions"
import { WorksheetEditor } from "@/components/editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type {
  QuestionType,
  QuestionBlockDoc,
  QuestionBlockOverrides
} from "@/types"

interface PaperEditorProps {
  paper: SelectPaper
  initialBlocks?: SelectPaperBlock[]
}

export function PaperEditor({ paper, initialBlocks = [] }: PaperEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(paper.title)
  const [content, setContent] = useState<Record<string, unknown>>(
    (paper.contentDoc as Record<string, unknown>) || {}
  )
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Question blocks state
  const [blocks, setBlocks] = useState<SelectPaperBlock[]>(initialBlocks)
  const blockSaveTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map())

  // Auto-save with debounce
  const saveChanges = useCallback(
    async (newTitle: string, newContent: Record<string, unknown>) => {
      setIsSaving(true)
      try {
        const { isSuccess } = await updatePaperAction(paper.id, {
          title: newTitle,
          contentDoc: newContent
        })

        if (isSuccess) {
          setLastSaved(new Date())
        }
      } catch (error) {
        console.error("Failed to save:", error)
        toast.error("Failed to save changes")
      } finally {
        setIsSaving(false)
      }
    },
    [paper.id]
  )

  // Debounced save on content change
  const handleContentChange = useCallback(
    (newContent: Record<string, unknown>) => {
      setContent(newContent)

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveChanges(title, newContent)
      }, 1000)
    },
    [title, saveChanges]
  )

  // Debounced save on title change
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle)

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveChanges(newTitle, content)
      }, 1000)
    },
    [content, saveChanges]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      // Cleanup block save timeouts
      blockSaveTimeoutRef.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  // Handle adding a question block
  const handleAddQuestionBlock = useCallback(
    async (questionType: QuestionType): Promise<SelectPaperBlock | null> => {
      try {
        const result = await addQuestionToPaperAction({
          paperId: paper.id,
          questionType
        })

        if (result.isSuccess && result.data) {
          // Add to local state
          setBlocks(prev => [...prev, result.data])
          return result.data
        } else {
          toast.error(result.message || "Failed to add question")
          return null
        }
      } catch (error) {
        console.error("Error adding question block:", error)
        toast.error("Failed to add question")
        return null
      }
    },
    [paper.id]
  )

  // Handle question block content change (debounced)
  const handleQuestionBlockChange = useCallback(
    (blockId: number, blockDoc: QuestionBlockDoc) => {
      // Update local state immediately (optimistic)
      setBlocks(prev =>
        prev.map(block =>
          block.id === blockId ? { ...block, blockDoc } : block
        )
      )

      // Clear existing timeout for this block
      const existingTimeout = blockSaveTimeoutRef.current.get(blockId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Debounce the save
      const timeout = setTimeout(async () => {
        try {
          const result = await updatePaperBlockAction({
            blockId,
            blockDoc
          })

          if (!result.isSuccess) {
            toast.error("Failed to save question changes")
          }
        } catch (error) {
          console.error("Error saving question block:", error)
          toast.error("Failed to save question changes")
        }
      }, 1000)

      blockSaveTimeoutRef.current.set(blockId, timeout)
    },
    []
  )

  // Handle question block overrides change (debounced)
  const handleQuestionBlockOverridesChange = useCallback(
    (blockId: number, overrides: Partial<QuestionBlockOverrides>) => {
      // Update local state immediately
      setBlocks(prev =>
        prev.map(block =>
          block.id === blockId
            ? {
                ...block,
                overrides: { ...(block.overrides as QuestionBlockOverrides), ...overrides }
              }
            : block
        )
      )

      // Clear existing timeout for this block
      const existingTimeout = blockSaveTimeoutRef.current.get(blockId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Debounce the save
      const timeout = setTimeout(async () => {
        try {
          const result = await updatePaperBlockAction({
            blockId,
            overrides
          })

          if (!result.isSuccess) {
            toast.error("Failed to save question settings")
          }
        } catch (error) {
          console.error("Error saving question overrides:", error)
          toast.error("Failed to save question settings")
        }
      }, 500)

      blockSaveTimeoutRef.current.set(blockId, timeout)
    },
    []
  )

  // Handle question block deletion
  const handleQuestionBlockDelete = useCallback(async (blockId: number) => {
    // Remove from local state immediately (optimistic)
    setBlocks(prev => prev.filter(block => block.id !== blockId))

    // Clear any pending save for this block
    const existingTimeout = blockSaveTimeoutRef.current.get(blockId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      blockSaveTimeoutRef.current.delete(blockId)
    }

    try {
      const result = await deletePaperBlockAction(blockId)

      if (!result.isSuccess) {
        toast.error("Failed to delete question")
        // TODO: Could restore the block on failure
      }
    } catch (error) {
      console.error("Error deleting question block:", error)
      toast.error("Failed to delete question")
    }
  }, [])

  const handleDelete = async () => {
    const { isSuccess } = await deletePaperAction(paper.id)
    if (isSuccess) {
      toast.success("Paper deleted")
      router.push("/papers")
    } else {
      toast.error("Failed to delete paper")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4">
          <Link href="/papers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Papers
            </Button>
          </Link>

          <div className="flex-1">
            <Input
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              className="h-8 max-w-md border-none bg-transparent px-2 text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Untitled Paper"
            />
          </div>

          <div className="flex items-center gap-2">
            {isSaving ? (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Check className="h-3 w-3" />
                <span>Saved</span>
              </div>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => saveChanges(title, content)}
                  disabled={isSaving}
                >
                  Save now
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete paper
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <WorksheetEditor
            content={content}
            onUpdate={handleContentChange}
            placeholder="Start writing your worksheet..."
            paperId={paper.id}
            questionBlocks={blocks}
            onAddQuestionBlock={handleAddQuestionBlock}
            onQuestionBlockChange={handleQuestionBlockChange}
            onQuestionBlockOverridesChange={handleQuestionBlockOverridesChange}
            onQuestionBlockDelete={handleQuestionBlockDelete}
          />
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this paper?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              paper and all its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PaperEditor

