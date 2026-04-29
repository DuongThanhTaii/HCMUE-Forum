export type CareerJob = {
  id: string
  title: string
  companyName?: string | null
  city?: string | null
  isRemote?: boolean
  createdAt?: string
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
}

export type CareerSearchParams = {
  page?: number
  pageSize?: number
  searchTerm?: string
  city?: string
}

