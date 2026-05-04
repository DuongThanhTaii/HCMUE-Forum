import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetCoursesQuery, useGetFacultiesQuery } from '@features/learning/api/learning.api'
import type { OverrideEffect, PermissionDto, PermissionOverrideDto } from '../../types/admin.types'

type AddOverrideFormProps = {
  permissions: PermissionDto[]
  overrides: PermissionOverrideDto[]
  isSubmitting: boolean
  onSubmit: (input: {
    permissionId: string
    scopeType: string
    scopeValue: string | null
    effect: OverrideEffect
    reason: string
    expiresAtUtc: string
  }) => Promise<void>
}

export function AddOverrideForm({ permissions, overrides, isSubmitting, onSubmit }: AddOverrideFormProps) {
  const { t } = useTranslation()
  const [permissionId, setPermissionId] = useState('')
  const [scopeType, setScopeType] = useState('Global')
  const [scopeValue, setScopeValue] = useState('')
  const [effect, setEffect] = useState<OverrideEffect>('Deny')
  const [reason, setReason] = useState('')
  const [expiresAtUtc, setExpiresAtUtc] = useState('')
  const { data: faculties = [] } = useGetFacultiesQuery()
  const { data: coursesPaged } = useGetCoursesQuery({ page: 1, pageSize: 500 })
  const courses = coursesPaged?.items ?? []

  const normalizedScopeValue = scopeType === 'Global' ? null : scopeValue || null
  const existingAtScope = overrides.find(
    (item) =>
      item.permissionId === permissionId &&
      item.scopeType.toLowerCase() === scopeType.toLowerCase() &&
      (item.scopeValue ?? null) === normalizedScopeValue,
  )

  const filteredPermissions = permissions.filter((permission) => {
    if (permission.id === permissionId) return true
    return !overrides.some(
      (item) =>
        item.permissionId === permission.id &&
        item.scopeType.toLowerCase() === scopeType.toLowerCase() &&
        (item.scopeValue ?? null) === normalizedScopeValue,
    )
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!permissionId) return
    await onSubmit({
      permissionId,
      scopeType,
      scopeValue: scopeType === 'Global' ? null : scopeValue,
      effect,
      reason,
      expiresAtUtc,
    })
    setReason('')
    setExpiresAtUtc('')
  }

  return (
    <form className="space-y-3 rounded-xl border border-slate-200 bg-white p-4" onSubmit={(event) => void submit(event)}>
      <h3 className="text-sm font-semibold text-slate-900">{t('admin.overridesPage.form.title')}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          {t('admin.overridesPage.form.permission')}
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={permissionId}
            onChange={(event) => setPermissionId(event.target.value)}
            required
          >
            <option value="">{t('admin.overridesPage.form.selectPermission')}</option>
            {filteredPermissions.map((permission) => (
              <option key={permission.id} value={permission.id}>
                {permission.code}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('admin.overridesPage.form.effect')}
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={effect}
            onChange={(event) => setEffect(event.target.value as OverrideEffect)}
          >
            <option value="Allow">{t('admin.overridesPage.form.effectOptions.allow')}</option>
            <option value="Deny">{t('admin.overridesPage.form.effectOptions.deny')}</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('admin.overridesPage.form.scopeType')}
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={scopeType}
            onChange={(event) => {
              setScopeType(event.target.value)
              setScopeValue('')
            }}
          >
            <option value="Global">{t('admin.overridesPage.form.scopeTypeOptions.global')}</option>
            <option value="Faculty">{t('admin.overridesPage.form.scopeTypeOptions.faculty')}</option>
            <option value="Course">{t('admin.overridesPage.form.scopeTypeOptions.course')}</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('admin.overridesPage.form.scopeValue')}
          {scopeType === 'Global' ? (
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value=""
              disabled
              placeholder={t('admin.overridesPage.form.scopeValuePlaceholderGlobal')}
            />
          ) : null}
          {scopeType === 'Faculty' ? (
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={scopeValue}
              onChange={(event) => setScopeValue(event.target.value)}
              required
            >
              <option value="">Chọn khoa</option>
              {faculties.map((faculty) => (
                <option key={faculty.facultyId} value={faculty.facultyId}>
                  {faculty.name}
                </option>
              ))}
            </select>
          ) : null}
          {scopeType === 'Course' ? (
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={scopeValue}
              onChange={(event) => setScopeValue(event.target.value)}
              required
            >
              <option value="">Chọn môn học</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.name}
                </option>
              ))}
            </select>
          ) : null}
        </label>
      </div>
      <p className="text-xs text-slate-500">
        {permissionId
          ? existingAtScope
            ? `Hiệu lực hiện tại tại phạm vi này: ${existingAtScope.effect} (đã có ghi đè).`
            : 'Hiệu lực hiện tại: đang theo role/group mặc định (chưa có ghi đè tại phạm vi này).'
          : 'Chọn quyền để xem hiệu lực hiện tại.'}
      </p>
      <label className="block text-sm font-medium text-slate-700">
        {t('admin.overridesPage.form.reason')}
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t('admin.overridesPage.form.reasonPlaceholder')}
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        {t('admin.overridesPage.form.expiresAt')}
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={expiresAtUtc}
          onChange={(event) => setExpiresAtUtc(event.target.value)}
          placeholder={t('admin.overridesPage.form.expiresAtPlaceholder')}
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting || !permissionId}
      >
        {t('admin.overridesPage.form.submit')}
      </button>
    </form>
  )
}
