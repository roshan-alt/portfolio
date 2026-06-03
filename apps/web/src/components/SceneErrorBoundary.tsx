import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { failed: boolean }

/** Prevent 3D load failures from crashing the whole portfolio. */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('3D background disabled:', error.message, info.componentStack)
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}
