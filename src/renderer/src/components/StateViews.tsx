interface LoadingProps {
  label?: string
}

/** Spinner used while async data is in flight. */
export function LoadingState({ label = 'Loading…' }: LoadingProps): JSX.Element {
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

interface EmptyProps {
  title?: string
  hint?: string
}

/** Shown when a query succeeds but returns no rows. */
export function EmptyState({ title = 'Nothing here yet', hint }: EmptyProps): JSX.Element {
  return (
    <div className="state state--empty">
      <div className="state__icon" aria-hidden="true">
        📭
      </div>
      <p className="state__title">{title}</p>
      {hint && <p className="state__hint">{hint}</p>}
    </div>
  )
}

interface ErrorProps {
  message: string
  onRetry?: () => void
}

/** Shown when an async call rejects. Offers a Retry when a handler is given. */
export function ErrorState({ message, onRetry }: ErrorProps): JSX.Element {
  return (
    <div className="state state--error" role="alert">
      <div className="state__icon" aria-hidden="true">
        ⚠️
      </div>
      <p className="state__title">Something went wrong</p>
      <p className="state__hint">{message}</p>
      {onRetry && (
        <button className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
