import {
  Flag,
  MapPin,
  Trash2,
  X,
} from "lucide-react"

export default function MyReportsPanel({
  reports = [],
  onDelete,
  isOpen,
  onClose,
}) {
  if (!isOpen) return null

  return (
    <div
      className="
        fixed
        right-5
        top-[145px]
        z-[1600]
        w-[380px]
        max-w-[calc(100vw-40px)]
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-2xl
      "
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Flag
              size={19}
              className="text-orange-600"
            />
            <h2 className="font-bold text-gray-900">
              Reports History
            </h2>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Your flagged areas
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 hover:bg-gray-100"
        >
          <X size={19} />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-4">
        {reports.length === 0 ? (
          <div className="py-10 text-center">
            <Flag
              size={32}
              className="mx-auto mb-3 text-gray-300"
            />

            <p className="text-sm font-semibold text-gray-700">
              No reports yet
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Your flagged areas will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {report.category || "Other"}
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      {report.description ||
                        "User reported issue."}
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-semibold uppercase text-orange-700">
                    {report.status || "active"}
                  </span>
                </div>

                {report.address && (
                  <div className="mt-3 flex items-start gap-2">
                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 text-orange-500"
                    />

                    <p className="text-xs text-gray-600">
                      {report.address}
                    </p>
                  </div>
                )}

                <p className="mt-2 text-[11px] text-gray-400">
                  {report.occurred_at
                    ? new Date(
                        report.occurred_at
                      ).toLocaleString()
                    : "Recently reported"}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    onDelete(report)
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={15} />
                  Delete Flag
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}