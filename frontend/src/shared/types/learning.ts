export type LearningDocument = {
  id: string
  title: string
  description?: string | null
  uploaderName?: string | null
  averageRating?: number
  totalDownloads?: number
  createdAt?: string
}

export type LearningSearchParams = {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
}

