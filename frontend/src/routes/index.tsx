import { createFileRoute } from '@tanstack/react-router'
import logo from '../logo.svg'
import '../App.css'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="VidFlow Logo" />
        <h1>Welcome to VidFlow</h1>
        <p>
          Your ultimate platform for seamless video uploads and management.
        </p>
        <a
          className="App-link"
          href="/video/upload"
          target="_self"
          rel="noopener noreferrer"
        >
          Upload Your First Video
        </a>
      </header>
    </div>
  )
}

