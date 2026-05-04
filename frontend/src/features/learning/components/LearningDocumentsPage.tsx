import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useUploadDocumentMutation } from '../api/learning.api'
import { useAppSelector } from '@shared/hooks/useAppSelector'
import { selectUserId } from '@features/auth/model/auth.slice'
import { useLearningDocumentsPage } from '../hooks/useLearningDocumentsPage'
import { LearningFiltersRow } from './LearningFiltersRow'

export function LearningDocumentsPage() {
  const userId = useAppSelector(selectUserId)
  const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation()
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadCourseId, setUploadCourseId] = useState('')
  const [uploadType, setUploadType] = useState(4)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null)
  const {
    t,
    searchInput,
    setSearchInput,
    facultyId,
    setFacultyId,
    courseId,
    setCourseId,
    faculties,
    courses,
    clearFilters,
    documents,
    page,
    totalPages,
    totalCount,
    goPrev,
    goNext,
    canPrev,
    canNext,
    isLoading,
    isError,
    isEmpty,
    isFetching,
  } = useLearningDocumentsPage()

  async function onSubmitUpload(e: FormEvent) {
    e.preventDefault()
    setUploadFeedback(null)
    if (!userId || !uploadTitle.trim() || !uploadFile) {
      setUploadFeedback(t('learning.messages.fillAllFields'))
      return
    }
    try {
      await uploadDocument({
        title: uploadTitle.trim(),
        description: uploadDescription.trim() || undefined,
        file: uploadFile,
        documentType: uploadType,
        courseId: uploadCourseId || undefined,
      }).unwrap()
      setUploadFeedback(t('learning.uploadPage.uploadSuccess'))
      setUploadTitle('')
      setUploadDescription('')
      setUploadCourseId('')
      setUploadType(4)
      setUploadFile(null)
    } catch {
      setUploadFeedback(t('learning.uploadPage.uploadError'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-b-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        {t('learning.messages.loadError')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-slate-900">
          {t('learning.title')} · {t('learning.documents')}
        </h1>
        <div className="flex flex-wrap gap-3 text-[13px]">
          <Link to="/learning/faculties" className="text-primary hover:underline">
            {t('learning.facultyList')}
          </Link>
          <Link to="/learning/courses" className="text-primary hover:underline">
            {t('learning.courseList')}
          </Link>
        </div>
      </header>

      <LearningFiltersRow
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        facultyId={facultyId}
        onFacultyChange={setFacultyId}
        courseId={courseId}
        onCourseChange={setCourseId}
        faculties={faculties}
        courses={courses}
        onClear={clearFilters}
      />
      <form onSubmit={(e) => void onSubmitUpload(e)} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">{t('learning.uploadDocument')}</h2>
        <input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder={t('learning.uploadPage.titlePlaceholder')} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        <textarea value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder={t('learning.uploadPage.descriptionPlaceholder')} rows={3} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        <div className="grid gap-2 sm:grid-cols-2">
          <select value={uploadCourseId} onChange={(e) => setUploadCourseId(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm">
            <option value="">{t('learning.uploadPage.coursePlaceholder')}</option>
            {courses.map((c) => <option key={c.courseId} value={c.courseId}>{c.name}</option>)}
          </select>
          <select value={uploadType} onChange={(e) => setUploadType(Number(e.target.value))} className="rounded border border-slate-300 px-3 py-2 text-sm">
            <option value={1}>{t('learning.documentTypes.lecture')}</option>
            <option value={2}>{t('learning.documentTypes.assignment')}</option>
            <option value={3}>{t('learning.documentTypes.exam')}</option>
            <option value={4}>{t('learning.documentTypes.reference')}</option>
            <option value={5}>{t('learning.documentTypes.other')}</option>
          </select>
        </div>
        <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs" />
        <button type="submit" disabled={isUploading} className="rounded-md border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60">
          {isUploading ? t('learning.uploadPage.uploading') : t('learning.uploadDocument')}
        </button>
        {uploadFeedback ? <p className="text-sm text-slate-600">{uploadFeedback}</p> : null}
      </form>

      {isFetching && !isLoading ? (
        <div className="inline-flex items-center gap-2 text-[13px] text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-b-primary" />
          <span>{t('common.loading')}</span>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-600">
          {t('learning.messages.noDocuments')}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {documents.map((doc) => (
              <article key={doc.id} className="forum-compact-card p-4">
                <h2 className="text-base font-semibold text-slate-900">
                  <Link to={`/learning/documents/${doc.id}`} className="hover:text-primary">
                    {doc.title}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {doc.displayUploader} · {doc.displayDate}
                  {doc.displayStatusLabel ? (
                    <>
                      {' '}
                      · <span className={`font-medium ${doc.displayStatusClass}`}>{doc.displayStatusLabel}</span>
                    </>
                  ) : null}
                </p>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{doc.displayDescription}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {t('learning.documentCard.downloadsLabel')}: {doc.displayDownloads} ·{' '}
                  {t('learning.documentCard.ratingsLabel')}: {doc.displayRating}
                </p>
                <p className="mt-2 text-[13px]">
                  <Link to={`/learning/documents/${doc.id}`} className="font-medium text-primary hover:underline">
                    {t('learning.documentCard.viewDetail')} →
                  </Link>
                </p>
              </article>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px]"
              aria-label={t('learning.pagination.page')}
            >
              <button
                type="button"
                onClick={goPrev}
                disabled={!canPrev}
                className="rounded-md border border-slate-200 px-2 py-1 font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('learning.pagination.previous')}
              </button>
              <span className="text-slate-600">
                {t('learning.pagination.page')} {page} / {totalPages}
                {totalCount > 0 ? (
                  <span className="text-slate-400"> ({totalCount})</span>
                ) : null}
              </span>
              <button
                type="button"
                onClick={goNext}
                disabled={!canNext}
                className="rounded-md border border-slate-200 px-2 py-1 font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('learning.pagination.next')}
              </button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  )
}
