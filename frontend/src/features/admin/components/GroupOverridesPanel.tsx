import { useTranslation } from 'react-i18next'

type GroupOverridesPanelProps = {
  isGroupSourceAvailable: boolean
}

export function GroupOverridesPanel({ isGroupSourceAvailable }: GroupOverridesPanelProps) {
  const { t } = useTranslation()
  if (isGroupSourceAvailable) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        {t('admin.overridesPage.groups.available')}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      {t('admin.overridesPage.groups.unavailable')}
    </div>
  )
}
