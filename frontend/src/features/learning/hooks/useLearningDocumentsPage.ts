import { useTranslation } from 'react-i18next'
import { useGetDocumentsQuery } from '../api/learning.api'

function formatDate(value: string | undefined, locale: string) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString(locale)
}

export function useLearningDocumentsPage() {
  const { i18n, t } = useTranslation()
  const { data, isLoading, isError } = useGetDocumentsQuery({ pageNumber: 1, pageSize: 20 })
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US'

  const documents =
    data?.map((doc) => ({
      ...doc,
      displayUploader: doc.uploaderName ?? t('learning.documentCard.unknownUploader'),
      displayDate: formatDate(doc.createdAt, locale),
      displayDescription: doc.description ?? t('learning.documentCard.noDescription'),
      displayDownloads: doc.totalDownloads ?? 0,
      displayRating: doc.averageRating ?? 0,
    })) ?? []

  return {
    t,
    documents,
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && documents.length === 0,
  }
}
