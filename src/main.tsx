import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import repo from './repo';

// Import layouts
import RootLayout from './components/layout/RootLayout';

// Import pages
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Editor from './pages/Editor';
import Settings from './pages/Settings';

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'files',
        element: <Files />,
      },
      {
        path: 'editor/:docId',
        element: <Editor />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RepoContext.Provider value={repo}>
      <RouterProvider router={router} />
    </RepoContext.Provider>
  </React.StrictMode>,
);
