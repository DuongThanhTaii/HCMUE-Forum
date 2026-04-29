import { useCareerJobsPage } from '../hooks/useCareerJobsPage'

export function CareerJobsPage() {
  const { t, jobs, isLoading, isError, isEmpty } = useCareerJobsPage()

  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4">{t('common.loading')}</div>
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        {t('career.messages.loadError')}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-600">
        {t('career.messages.noJobs')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <article key={job.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold text-slate-900">{job.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {job.displayCompany} · {job.displayCity} · {job.displayWorkMode}
          </p>
          <p className="mt-2 text-sm text-slate-600">{job.displaySalary}</p>
          <p className="mt-2 text-xs text-slate-500">
            {t('career.common.postedAt')}: {job.displayPostedAt}
          </p>
        </article>
      ))}
    </div>
  )
}

