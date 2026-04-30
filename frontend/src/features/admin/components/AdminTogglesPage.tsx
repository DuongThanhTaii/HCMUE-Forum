import { EndpointToggleRow } from './EndpointToggleRow'
import { useAdminLogsPage } from '../hooks/useAdminLogsPage'

export function AdminTogglesPage() {
  const { t, toggles, isTogglesLoading, isTogglesError, isSetToggleLoading, submitToggle } = useAdminLogsPage()

  if (isTogglesLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4">{t('common.loading')}</div>
  }

  if (isTogglesError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        {t('admin.togglesPage.messages.loadError', { defaultValue: 'Failed to load endpoint toggles.' })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-slate-900">
          {t('admin.togglesPage.title', { defaultValue: 'Endpoint toggles' })}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('admin.togglesPage.subtitle', {
            defaultValue: 'Temporarily enable or disable protected admin endpoints.',
          })}
        </p>
      </header>
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        {toggles.map((toggle) => (
          <EndpointToggleRow key={toggle.endpointKey} toggle={toggle} isSubmitting={isSetToggleLoading} onSubmit={submitToggle} />
        ))}
        {!toggles.length ? <p className="text-sm text-slate-500">{t('admin.togglesPage.messages.empty', { defaultValue: 'No toggles found.' })}</p> : null}
      </section>
    </div>
  )
}
