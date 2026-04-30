import { Link } from 'react-router-dom'
import { useLearningDocumentsPage } from '../hooks/useLearningDocumentsPage'
import { LearningFiltersRow } from './LearningFiltersRow'

export function LearningDocumentsPage() {
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

  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4">{t('common.loading')}</div>
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

      {isFetching && !isLoading ? (
        <p className="text-[13px] text-slate-500">{t('common.loading')}</p>
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
