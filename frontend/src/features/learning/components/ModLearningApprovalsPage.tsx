import { useGetDocumentsQuery, useApproveDocumentMutation, useRejectDocumentMutation, useRequestRevisionDocumentMutation } from '../api/learning.api'
import { useState } from 'react'
import { useGetDocumentByIdQuery } from '../api/learning.api'

export function ModLearningApprovalsPage() {
  const { data, isLoading, isError } = useGetDocumentsQuery({ pageNumber: 1, pageSize: 50, status: 2 })
  const [approveDocument, { isLoading: approving }] = useApproveDocumentMutation()
  const [rejectDocument, { isLoading: rejecting }] = useRejectDocumentMutation()
  const [requestRevision, { isLoading: requesting }] = useRequestRevisionDocumentMutation()
  const docs = data?.documents ?? []
  const busy = approving || rejecting || requesting
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [reasonDialog, setReasonDialog] = useState<{ mode: 'reject' | 'revision'; documentId: string } | null>(null)
  const [reasonInput, setReasonInput] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const { data: selectedDocument, isLoading: loadingDetail } = useGetDocumentByIdQuery(selectedDocumentId ?? '', {
    skip: !selectedDocumentId,
  })

  async function onApprove(id: string) {
    setActionError(null)
    await approveDocument({ documentId: id }).unwrap()
  }
  function openReasonDialog(mode: 'reject' | 'revision', documentId: string) {
    setActionError(null)
    setReasonDialog({ mode, documentId })
    setReasonInput('')
  }
  async function submitReasonDialog() {
    if (!reasonDialog) return
    const reason = reasonInput.trim()
    if (reason.length < 10) {
      setActionError('Lý do phải có ít nhất 10 ký tự.')
      return
    }
    if (reasonDialog.mode === 'reject') {
      await rejectDocument({ documentId: reasonDialog.documentId, reason }).unwrap()
    } else {
      await requestRevision({ documentId: reasonDialog.documentId, reason }).unwrap()
    }
    setReasonDialog(null)
    setReasonInput('')
    setActionError(null)
  }

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading...</div>
  if (isError) return <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Không thể tải danh sách tài liệu chờ duyệt.</div>

  return (
    <section className="space-y-3">
      <header className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Kiểm duyệt tài liệu học tập</h2>
        <p className="mt-1 text-sm text-slate-600">Tổng tài liệu chờ duyệt: <span className="font-semibold">{docs.length}</span></p>
      </header>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full table-auto text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Tiêu đề</th>
              <th className="px-3 py-2">Người tải lên</th>
              <th className="px-3 py-2">Ngày tạo</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {docs.map((doc) => (
              <tr key={doc.id}>
                <td className="px-3 py-2">{doc.title}</td>
                <td className="px-3 py-2">{doc.uploaderName ?? doc.uploaderId ?? '-'}</td>
                <td className="px-3 py-2">{doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '-'}</td>
                <td className="px-3 py-2">{doc.status ?? '-'}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedDocumentId(doc.id)} className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Xem</button>
                    <button disabled={busy} onClick={() => void onApprove(doc.id)} className="rounded border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50">Phê duyệt</button>
                    <button disabled={busy} onClick={() => openReasonDialog('reject', doc.id)} className="rounded border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50">Từ chối</button>
                    <button disabled={busy} onClick={() => openReasonDialog('revision', doc.id)} className="rounded border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50">Yêu cầu sửa</button>
                  </div>
                </td>
              </tr>
            ))}
            {docs.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">Không có tài liệu chờ duyệt.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {selectedDocumentId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setSelectedDocumentId(null)}>
          <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900">Chi tiết tài liệu</h3>
              <button type="button" onClick={() => setSelectedDocumentId(null)} className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">Đóng</button>
            </div>
            {loadingDetail ? (
              <p className="mt-3 text-sm text-slate-500">Loading...</p>
            ) : selectedDocument ? (
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="font-medium">Tiêu đề:</span> {selectedDocument.title}</p>
                <p><span className="font-medium">Mô tả:</span> {selectedDocument.description || '-'}</p>
                <p><span className="font-medium">Người tải:</span> {selectedDocument.uploaderDisplayName || selectedDocument.uploaderId}</p>
                <p><span className="font-medium">Tên file:</span> {selectedDocument.fileName}</p>
                <p><span className="font-medium">Trạng thái:</span> {selectedDocument.status}</p>
                <p><span className="font-medium">Ngày tạo:</span> {new Date(selectedDocument.createdAt).toLocaleString()}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button disabled={busy} onClick={() => void onApprove(selectedDocument.id)} className="rounded border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50">Phê duyệt</button>
                  <button disabled={busy} onClick={() => openReasonDialog('reject', selectedDocument.id)} className="rounded border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50">Từ chối</button>
                  <button disabled={busy} onClick={() => openReasonDialog('revision', selectedDocument.id)} className="rounded border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50">Yêu cầu sửa</button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-rose-600">Không tải được chi tiết tài liệu.</p>
            )}
          </div>
        </div>
      ) : null}
      {reasonDialog ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setReasonDialog(null)}>
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-slate-900">
              {reasonDialog.mode === 'reject' ? 'Nhập lý do từ chối' : 'Nhập yêu cầu chỉnh sửa'}
            </h3>
            <textarea
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              rows={5}
              className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              placeholder={reasonDialog.mode === 'reject' ? 'Ví dụ: Nội dung chưa đúng định dạng, thiếu nguồn tham khảo...' : 'Ví dụ: Cần bổ sung mô tả chi tiết và cập nhật file phiên bản mới...'}
            />
            {actionError ? <p className="mt-2 text-sm text-rose-600">{actionError}</p> : null}
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setReasonDialog(null)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Hủy</button>
              <button type="button" disabled={busy} onClick={() => void submitReasonDialog()} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60">
                {busy ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
