import { Link, useSearchParams } from 'react-router-dom'
import { useLearningCoursesPageBody } from '../hooks/useLearningCoursesPage'

function LearningCoursesPageInner() {
  const {
    t,
    faculties,
    facultyFromUrl,
    setFacultyFilter,
    semesterInput,
    setSemesterInput,
    courses,
    isLoading,
    isError,
    isEmpty,
  } = useLearningCoursesPageBody()

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">{t('common.loading')}</div>
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
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-semibold text-slate-900">{t('learning.coursesPage.title')}</h1>
        <p className="mt-1 text-sm text-slate-600">{t('learning.coursesPage.subtitle')}</p>
        <p className="mt-2 text-[13px]">
          <Link to="/learning/faculties" className="text-primary hover:underline">
            {t('learning.facultyList')}
          </Link>
          {' · '}
          <Link to="/learning/documents" className="text-primary hover:underline">
            {t('learning.documentList')}
          </Link>
        </p>
      </header>

      <section className="forum-compact-card flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[180px] flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {t('learning.filters.selectFaculty')}
          </span>
          <select
            value={facultyFromUrl}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[13px] outline-none ring-primary focus:ring-2"
          >
            <option value="">{t('learning.filters.allFaculties')}</option>
            {faculties.map((f) => (
              <option key={f.facultyId} value={f.facultyId}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[140px] flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {t('learning.filters.semester')}
          </span>
          <input
            type="text"
            value={semesterInput}
            onChange={(e) => setSemesterInput(e.target.value)}
            placeholder={t('learning.filters.allSemesters')}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[13px] outline-none ring-primary focus:ring-2"
          />
        </label>
      </section>

      {isEmpty ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-600">
          {t('learning.messages.noCourses')}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {courses.map((c) => (
            <li key={c.courseId} className="forum-compact-card flex flex-col gap-2 p-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{c.name}</h2>
                <p className="text-[12px] text-slate-500">
                  {c.code} · {c.semester}
                </p>
                <p className="mt-1 line-clamp-2 text-[13px] text-slate-600">{c.description}</p>
              </div>
              <div className="text-[13px] text-slate-600">
                {t('learning.coursesPage.credits')} <strong>{c.credits}</strong> · {c.documentCount}{' '}
                {t('learning.coursesPage.documentsCount')}
              </div>
              <div>
                <Link
                  to={`/learning/documents?courseId=${c.courseId}`}
                  className="inline-block rounded-md border border-primary px-2.5 py-1 text-[13px] font-medium text-primary hover:bg-primary/5"
                >
                  {t('learning.coursesPage.viewDocuments')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Remount inner content when faculty filter changes so semester input/query resets without effects. */
export function LearningCoursesPage() {
  const [searchParams] = useSearchParams()
  const facultyKey = searchParams.get('facultyId') ?? '__all__'
  return <LearningCoursesPageInner key={facultyKey} />
}
