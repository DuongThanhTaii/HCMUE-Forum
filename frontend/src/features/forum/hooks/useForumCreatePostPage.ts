import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useCreateForumPostMutation,
  useGetForumCategoriesQuery,
  useGetPopularForumTagsQuery,
  useUploadForumAttachmentsMutation,
} from '../api/forum.list.api'

const POST_TYPES = [
  { value: 1, labelKey: 'forum.createPost.types.discussion' as const },
  { value: 2, labelKey: 'forum.createPost.types.question' as const },
]

function uniqueTagList(selected: string[], extra: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of [...selected, ...extra]) {
    const k = t.trim()
    if (!k) continue
    const low = k.toLowerCase()
    if (seen.has(low)) continue
    seen.add(low)
    out.push(k)
  }
  return out
}

export function useForumCreatePostPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: categories = [], isLoading: loadingCategories } = useGetForumCategoriesQuery()
  const { data: popularTags = [], isLoading: loadingTags } = useGetPopularForumTagsQuery({ count: 28 })
  const [createPost, { isLoading: isSubmitting }] = useCreateForumPostMutation()
  const [uploadAttachments, { isLoading: isUploadingAttachments }] = useUploadForumAttachmentsMutation()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState(1)
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [addTagDraft, setAddTagDraft] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])

  const typeOptions = useMemo(
    () => POST_TYPES.map((p) => ({ value: p.value, label: t(p.labelKey) })),
    [t],
  )

  const toggleTag = useCallback((name: string) => {
    setSelectedTagNames((prev) => {
      const low = name.toLowerCase()
      const has = prev.some((x) => x.toLowerCase() === low)
      if (has) {
        return prev.filter((x) => x.toLowerCase() !== low)
      }
      return [...prev, name]
    })
  }, [])

  const addCustomTagFromInput = useCallback(() => {
    const raw = addTagDraft.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean)
    if (raw.length === 0) return
    setCustomTags((prev) => uniqueTagList(prev, raw))
    setAddTagDraft('')
  }, [addTagDraft])

  const onAddTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addCustomTagFromInput()
      }
    },
    [addCustomTagFromInput],
  )

  const removeCustomTag = useCallback((name: string) => {
    setCustomTags((prev) => prev.filter((x) => x.toLowerCase() !== name.toLowerCase()))
  }, [])

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setErrorMessage(null)
      const trimmedTitle = title.trim()
      const trimmedContent = content.trim()
      if (!trimmedTitle || !trimmedContent) {
        setErrorMessage(t('forum.createPost.validation.required'))
        return
      }

      let mergedTags = uniqueTagList(selectedTagNames, customTags)
      const draftPieces = addTagDraft.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean)
      if (draftPieces.length > 0) {
        mergedTags = uniqueTagList(mergedTags, draftPieces)
      }

      try {
        let finalContent = trimmedContent
        const files = attachments.filter((f) => f.size > 0)
        if (files.length > 0) {
          const urls = await uploadAttachments(files).unwrap()
          if (urls.length > 0) {
            const links = urls.map((url) => `- ${url}`).join('\n')
            finalContent = `${trimmedContent}\n\nAttachments:\n${links}`
          }
        }

        await createPost({
          title: trimmedTitle,
          content: finalContent,
          type,
          categoryId: categoryId || undefined,
          tags: mergedTags.length ? mergedTags : undefined,
        }).unwrap()
        navigate('/forum')
      } catch {
        setErrorMessage(t('forum.createPost.validation.submitFailed'))
      }
    },
    [
      addTagDraft,
      attachments,
      categoryId,
      content,
      createPost,
      customTags,
      navigate,
      selectedTagNames,
      title,
      t,
      type,
      uploadAttachments,
    ],
  )

  return {
    t,
    categories,
    loadingCategories,
    popularTags,
    loadingTags,
    title,
    setTitle,
    content,
    setContent,
    type,
    setType,
    categoryId,
    setCategoryId,
    selectedTagNames,
    customTags,
    addTagDraft,
    setAddTagDraft,
    toggleTag,
    addCustomTagFromInput,
    onAddTagKeyDown,
    removeCustomTag,
    typeOptions,
    onSubmit,
    isSubmitting,
    errorMessage,
    attachments,
    setAttachments,
    isUploadingAttachments,
  }
}
