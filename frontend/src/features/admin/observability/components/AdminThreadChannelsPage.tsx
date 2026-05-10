import { useCallback, useMemo, useState } from 'react'
import { Layers, ShieldAlert } from 'lucide-react'
import { useAdminThreadChannelsPage } from '../hooks/useAdminThreadChannelsPage'
import type { ThreadChannelDto, UpsertThreadChannelRequest } from '../../types/admin.types'

type DraftOverrides = Partial<UpsertThreadChannelRequest>

const emptyCreate: UpsertThreadChannelRequest = {
  code: '',
  name: '',
  description: null,
  displayOrder: 0,
  isActive: true,
  allowPinnedComments: true,
  allowAcceptedAnswers: true,
  allowModeratorActions: true,
}

function toUpsert(channel: ThreadChannelDto): UpsertThreadChannelRequest {
  return {
    code: channel.code,
    name: channel.name,
    description: channel.description || null,
    displayOrder: channel.displayOrder,
    isActive: channel.isActive,
    allowPinnedComments: channel.allowPinnedComments,
    allowAcceptedAnswers: channel.allowAcceptedAnswers,
    allowModeratorActions: channel.allowModeratorActions,
  }
}

type DiffRow = { field: string; before: string; after: string }

function buildDiff(before: UpsertThreadChannelRequest, after: UpsertThreadChannelRequest, labels: Record<string, string>): DiffRow[] {
  const keys = Object.keys(before) as (keyof UpsertThreadChannelRequest)[]
  const rows: DiffRow[] = []
  for (const key of keys) {
    const b = before[key]
    const a = after[key]
    const bv = typeof b === 'boolean' ? (b ? 'true' : 'false') : String(b ?? '')
    const av = typeof a === 'boolean' ? (a ? 'true' : 'false') : String(a ?? '')
    if (bv !== av) {
      rows.push({ field: labels[key] ?? String(key), before: bv, after: av })
    }
  }
  return rows
}

function formatUpsertValue(v: unknown): string {
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (v === null || v === undefined) return ''
  return String(v)
}

function buildCreatePreview(after: UpsertThreadChannelRequest, labels: Record<string, string>): DiffRow[] {
  const keys = Object.keys(after) as (keyof UpsertThreadChannelRequest)[]
  return keys.map((key) => ({
    field: labels[key] ?? String(key),
    before: '—',
    after: formatUpsertValue(after[key]) || '—',
  }))
}

function normalizeUpsert(u: UpsertThreadChannelRequest): UpsertThreadChannelRequest {
  return {
    ...u,
    code: u.code.trim(),
    name: u.name.trim(),
    description: u.description?.trim() || null,
  }
}

function PolicyBadge({ active, label, onLabel, offLabel }: { active: boolean; label: string; onLabel: string; offLabel: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {label}: {active ? onLabel : offLabel}
    </span>
  )
}

type ConfirmState =
  | { mode: 'idle' }
  | { mode: 'update'; id: string; name: string; before: UpsertThreadChannelRequest; after: UpsertThreadChannelRequest; diffs: DiffRow[] }
  | { mode: 'create'; after: UpsertThreadChannelRequest; diffs: DiffRow[] }

export function AdminThreadChannelsPage() {
  const { t, channels, isLoading, isError, submitCreate, submitUpdate, isCreating, isUpdating } =
    useAdminThreadChannelsPage()
  const [overrides, setOverrides] = useState<Record<string, DraftOverrides>>({})
  const [createDraft, setCreateDraft] = useState<UpsertThreadChannelRequest>(emptyCreate)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState>({ mode: 'idle' })

  const fieldLabels = useMemo(
    () => ({
      code: t('admin.threadChannelsPage.fields.code'),
      name: t('admin.threadChannelsPage.fields.name'),
      description: t('admin.threadChannelsPage.fields.description'),
      displayOrder: t('admin.threadChannelsPage.fields.displayOrder'),
      isActive: t('admin.threadChannelsPage.fields.isActive'),
      allowPinnedComments: t('admin.threadChannelsPage.fields.allowPin'),
      allowAcceptedAnswers: t('admin.threadChannelsPage.fields.allowAccepted'),
      allowModeratorActions: t('admin.threadChannelsPage.fields.allowMod'),
    }),
    [t],
  )

  const getMerged = useCallback(
    (channel: ThreadChannelDto): UpsertThreadChannelRequest => ({
      ...toUpsert(channel),
      ...(overrides[channel.id] ?? {}),
    }),
    [overrides],
  )

  const isChannelDirty = (channel: ThreadChannelDto) => {
    const merged = getMerged(channel)
    const base = toUpsert(channel)
    return buildDiff(base, merged, fieldLabels).length > 0
  }

  const openUpdateConfirm = (channel: ThreadChannelDto) => {
    const before = toUpsert(channel)
    const after = normalizeUpsert(getMerged(channel))
    const diffs = buildDiff(before, after, fieldLabels)
    if (diffs.length === 0) {
      setFeedback(t('admin.threadChannelsPage.messages.noChanges'))
      return
    }
    if (!after.code.trim() || !after.name.trim()) {
      setFeedback(t('admin.threadChannelsPage.messages.codeNameRequired'))
      return
    }
    setConfirm({ mode: 'update', id: channel.id, name: channel.name, before, after, diffs })
  }

  const openCreateConfirm = () => {
    const after = normalizeUpsert(createDraft)
    if (!after.code.trim() || !after.name.trim()) {
      setFeedback(t('admin.threadChannelsPage.messages.codeNameRequired'))
      return
    }
    const diffs = buildCreatePreview(after, fieldLabels)
    setConfirm({ mode: 'create', after, diffs })
  }

  const runConfirmed = async () => {
    if (confirm.mode === 'idle') return
    setFeedback(null)
    try {
      if (confirm.mode === 'update') {
        await submitUpdate(confirm.id, confirm.after)
        setOverrides((prev) => ({ ...prev, [confirm.id]: {} }))
        setFeedback(t('admin.threadChannelsPage.messages.saved', { name: confirm.after.name }))
      } else {
        await submitCreate(confirm.after)
        setCreateDraft(emptyCreate)
        setFeedback(t('admin.threadChannelsPage.messages.created'))
      }
      setConfirm({ mode: 'idle' })
    } catch {
      setFeedback(t('admin.threadChannelsPage.messages.saveFailed'))
    }
  }

  const setOverride = <K extends keyof UpsertThreadChannelRequest>(
    id: string,
    key: K,
    value: UpsertThreadChannelRequest[K],
  ) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), [key]: value },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-rose-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          <h3 className="font-semibold">{t('admin.threadChannelsPage.messages.loadError')}</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-rose-100 p-2 text-rose-700">
            <Layers className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t('admin.threadChannelsPage.title')}</h1>
            <p className="mt-1 text-sm text-slate-600">{t('admin.threadChannelsPage.subtitle')}</p>
          </div>
        </div>
      </header>

      {feedback ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">{feedback}</p>
      ) : null}

      <section className="space-y-4">
        {channels.map((channel) => {
          const draft = getMerged(channel)
          const dirty = isChannelDirty(channel)
          return (
            <article
              key={channel.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition-colors ${
                dirty ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-500">{draft.code}</span>
                  <span className="text-base font-semibold text-slate-900">{draft.name}</span>
                  {draft.isActive ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      {t('admin.threadChannelsPage.badges.active')}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {t('admin.threadChannelsPage.badges.inactive')}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <PolicyBadge
                    active={draft.allowPinnedComments}
                    label={t('admin.threadChannelsPage.policyLabels.pin')}
                    onLabel={t('admin.threadChannelsPage.policy.on')}
                    offLabel={t('admin.threadChannelsPage.policy.off')}
                  />
                  <PolicyBadge
                    active={draft.allowAcceptedAnswers}
                    label={t('admin.threadChannelsPage.policyLabels.accepted')}
                    onLabel={t('admin.threadChannelsPage.policy.on')}
                    offLabel={t('admin.threadChannelsPage.policy.off')}
                  />
                  <PolicyBadge
                    active={draft.allowModeratorActions}
                    label={t('admin.threadChannelsPage.policyLabels.mod')}
                    onLabel={t('admin.threadChannelsPage.policy.on')}
                    offLabel={t('admin.threadChannelsPage.policy.off')}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  {t('admin.threadChannelsPage.fields.code')}
                  <input
                    value={draft.code}
                    onChange={(e) => setOverride(channel.id, 'code', e.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  {t('admin.threadChannelsPage.fields.name')}
                  <input
                    value={draft.name}
                    onChange={(e) => setOverride(channel.id, 'name', e.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  {t('admin.threadChannelsPage.fields.displayOrder')}
                  <input
                    type="number"
                    value={draft.displayOrder}
                    onChange={(e) => setOverride(channel.id, 'displayOrder', Number(e.target.value) || 0)}
                    className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                  />
                </label>
                <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(e) => setOverride(channel.id, 'isActive', e.target.checked)}
                  />
                  {t('admin.threadChannelsPage.fields.isActive')}
                </label>
              </div>
              <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-slate-600">
                {t('admin.threadChannelsPage.fields.description')}
                <textarea
                  value={draft.description ?? ''}
                  onChange={(e) => setOverride(channel.id, 'description', e.target.value || null)}
                  rows={2}
                  className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                />
              </label>

              <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-100 pt-3">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.allowPinnedComments}
                    onChange={(e) => setOverride(channel.id, 'allowPinnedComments', e.target.checked)}
                  />
                  {t('admin.threadChannelsPage.fields.allowPin')}
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.allowAcceptedAnswers}
                    onChange={(e) => setOverride(channel.id, 'allowAcceptedAnswers', e.target.checked)}
                  />
                  {t('admin.threadChannelsPage.fields.allowAccepted')}
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.allowModeratorActions}
                    onChange={(e) => setOverride(channel.id, 'allowModeratorActions', e.target.checked)}
                  />
                  {t('admin.threadChannelsPage.fields.allowMod')}
                </label>
                <button
                  type="button"
                  disabled={!dirty || isUpdating}
                  onClick={() => openUpdateConfirm(channel)}
                  className="ml-auto rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('admin.threadChannelsPage.actions.reviewSave')}
                </button>
              </div>
            </article>
          )
        })}
      </section>

      <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-5">
        <h2 className="text-sm font-semibold text-slate-900">{t('admin.threadChannelsPage.create.title')}</h2>
        <p className="mt-1 text-xs text-slate-600">{t('admin.threadChannelsPage.create.hint')}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            {t('admin.threadChannelsPage.fields.code')}
            <input
              value={createDraft.code}
              onChange={(e) => setCreateDraft((p) => ({ ...p, code: e.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            {t('admin.threadChannelsPage.fields.name')}
            <input
              value={createDraft.name}
              onChange={(e) => setCreateDraft((p) => ({ ...p, name: e.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            {t('admin.threadChannelsPage.fields.displayOrder')}
            <input
              type="number"
              value={createDraft.displayOrder}
              onChange={(e) => setCreateDraft((p) => ({ ...p, displayOrder: Number(e.target.value) || 0 }))}
              className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={createDraft.isActive}
              onChange={(e) => setCreateDraft((p) => ({ ...p, isActive: e.target.checked }))}
            />
            {t('admin.threadChannelsPage.fields.isActive')}
          </label>
        </div>
        <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-slate-600">
          {t('admin.threadChannelsPage.fields.description')}
          <textarea
            value={createDraft.description ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, description: e.target.value || null }))}
            rows={2}
            className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={createDraft.allowPinnedComments}
              onChange={(e) => setCreateDraft((p) => ({ ...p, allowPinnedComments: e.target.checked }))}
            />
            {t('admin.threadChannelsPage.fields.allowPin')}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={createDraft.allowAcceptedAnswers}
              onChange={(e) => setCreateDraft((p) => ({ ...p, allowAcceptedAnswers: e.target.checked }))}
            />
            {t('admin.threadChannelsPage.fields.allowAccepted')}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={createDraft.allowModeratorActions}
              onChange={(e) => setCreateDraft((p) => ({ ...p, allowModeratorActions: e.target.checked }))}
            />
            {t('admin.threadChannelsPage.fields.allowMod')}
          </label>
          <button
            type="button"
            disabled={isCreating}
            onClick={() => openCreateConfirm()}
            className="ml-auto rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {t('admin.threadChannelsPage.create.review')}
          </button>
        </div>
      </section>

      {confirm.mode !== 'idle' ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="thread-channel-confirm-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h2 id="thread-channel-confirm-title" className="text-lg font-semibold text-slate-900">
              {confirm.mode === 'update'
                ? t('admin.threadChannelsPage.confirm.updateTitle', { name: confirm.name })
                : t('admin.threadChannelsPage.confirm.createTitle')}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{t('admin.threadChannelsPage.confirm.subtitle')}</p>

            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">{t('admin.threadChannelsPage.confirm.field')}</th>
                    <th className="px-3 py-2">{t('admin.threadChannelsPage.confirm.before')}</th>
                    <th className="px-3 py-2">{t('admin.threadChannelsPage.confirm.after')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {confirm.diffs.map((row) => (
                    <tr key={row.field}>
                      <td className="px-3 py-2 font-medium text-slate-800">{row.field}</td>
                      <td className="px-3 py-2 text-rose-700 line-through decoration-slate-400">{row.before || '—'}</td>
                      <td className="px-3 py-2 font-medium text-emerald-800">{row.after || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm({ mode: 'idle' })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={isCreating || isUpdating}
                onClick={() => void runConfirmed()}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {t('admin.threadChannelsPage.confirm.apply')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
