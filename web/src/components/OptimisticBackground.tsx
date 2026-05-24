import './OptimisticBackground.css'

export function OptimisticBackground() {
  return (
    <div className="optimistic-bg" aria-hidden>
      <div className="optimistic-bg__gradient" />
      <div className="optimistic-bg__blob optimistic-bg__blob--peach" />
      <div className="optimistic-bg__blob optimistic-bg__blob--sky" />
      <div className="optimistic-bg__blob optimistic-bg__blob--pink" />
    </div>
  )
}
