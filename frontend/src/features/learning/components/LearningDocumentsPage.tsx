import { useLearningDocumentsPage } from '../hooks/useLearningDocumentsPage'

export function LearningDocumentsPage() {
  const { t, documents, isLoading, isError, isEmpty } = useLearningDocumentsPage()

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

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-600">
        {t('learning.messages.noDocuments')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <article key={doc.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold text-slate-900">{doc.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {doc.displayUploader} · {doc.displayDate}
          </p>
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
            {doc.displayDescription}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {t('learning.documentCard.downloadsLabel')}: {doc.displayDownloads} · {t('learning.documentCard.ratingsLabel')}:{' '}
            {doc.displayRating}
          </p>
        </article>
      ))}
    </div>
  )
}

