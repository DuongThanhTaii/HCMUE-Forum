import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetCoursesQuery, useGetFacultiesQuery } from '../api/learning.api'

/** Body hook — mount inside a parent keyed by faculty URL param so semester state resets when faculty changes. */
export function useLearningCoursesPageBody() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const facultyFromUrl = searchParams.get('facultyId') ?? ''
  const [semesterInput, setSemesterInput] = useState('')
  const [debouncedSemester, setDebouncedSemester] = useState('')

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSemester(semesterInput.trim()), 400)
    return () => window.clearTimeout(id)
  }, [semesterInput])

  const { data: faculties = [], isLoading: loadingFaculties } = useGetFacultiesQuery()

  const queryArgs = useMemo(
    () => ({
      ...(facultyFromUrl ? { facultyId: facultyFromUrl } : {}),
      ...(debouncedSemester ? { semester: debouncedSemester } : {}),
    }),
    [facultyFromUrl, debouncedSemester],
  )

  const { data: courses = [], isLoading, isError } = useGetCoursesQuery(queryArgs)

  const setFacultyFilter = useCallback(
    (facultyId: string) => {
      setSearchParams(
        (prev) => {
          const n = new URLSearchParams(prev)
          if (facultyId) n.set('facultyId', facultyId)
          else n.delete('facultyId')
          return n
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return {
    t,
    faculties,
    facultyFromUrl,
    setFacultyFilter,
    semesterInput,
    setSemesterInput,
    courses,
    isLoading: isLoading || loadingFaculties,
    isError,
    isEmpty: !(isLoading || loadingFaculties) && !isError && courses.length === 0,
  }
}
