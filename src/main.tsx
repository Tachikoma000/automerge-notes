import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { RepoContext } from '@automerge/automerge-repo-react-hooks'
import repo from './repo'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RepoContext.Provider value={repo}>
      <App />
    </RepoContext.Provider>
  </React.StrictMode>,
)
