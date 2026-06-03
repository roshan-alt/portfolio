import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Portfolio render error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center bg-[#0a0a0f] text-zinc-300">
          <p className="text-teal-400 font-semibold">Something went wrong</p>
          <p className="text-sm text-zinc-500 max-w-md">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 px-5 py-2 rounded-full bg-teal-500 text-black text-sm font-semibold"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
