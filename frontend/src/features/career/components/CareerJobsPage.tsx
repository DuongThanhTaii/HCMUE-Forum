import { useState } from 'react'
import { useCareerJobsPage } from '../hooks/useCareerJobsPage'

export function CareerJobsPage() {
  const { t, jobs, isLoading, isError, isEmpty } = useCareerJobsPage()
  const [brokenLogoIds, setBrokenLogoIds] = useState<Record<string, boolean>>({})

  const markLogoBroken = (jobId: string) => {
    setBrokenLogoIds((prev) => ({ ...prev, [jobId]: true }))
  }

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
          <div className="flex items-start gap-3">
            {job.companyLogoUrl && !brokenLogoIds[job.id] ? (
              <img
                src={job.companyLogoUrl}
                alt={job.displayCompany}
                className="h-10 w-10 rounded border border-slate-200 bg-white object-contain p-1"
                loading="lazy"
                onError={() => markLogoBroken(job.id)}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                {job.displayCompany.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-900">{job.title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {job.displayCompany} · {job.displayCity} · {job.displayWorkMode}
              </p>
            </div>
          </div>
          {job.displayDescription ? <p className="mt-2 text-sm text-slate-700">{job.displayDescription}</p> : null}
          <p className="mt-2 text-sm text-slate-600">{job.displaySalary}</p>
          <p className="mt-2 text-xs text-slate-500">
            {t('career.common.postedAt')}: {job.displayPostedAt}
          </p>
        </article>
      ))}
    </div>
  )
}

