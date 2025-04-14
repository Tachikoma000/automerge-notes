import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RepoContext } from '@automerge/automerge-repo-react-hooks'
import repo from './repo'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RepoContext.Provider value={repo}>
      <App />
    </RepoContext.Provider>
  </StrictMode>,
)
