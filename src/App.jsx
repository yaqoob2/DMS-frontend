import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FileExplorer from './pages/FileExplorer';
import FileDetails from './pages/FileDetails';
import DeletedItems from './pages/DeletedItems';
import StorageDashboard from './pages/StorageDashboard';
import SearchPage from './pages/SearchPage';
import ActivityPage from './pages/ActivityPage';
import UserManagement from './pages/UserManagement';
import FolderPermissions from './pages/FolderPermissions';
import DeletedItems from './pages/DeletedItems';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/files" element={<FileExplorer />} />
              <Route path="/files/:id" element={<FileDetails />} />

              <Route path="/trash" element={<DeletedItems />} />

              <Route path="/users" element={<UserManagement />} />
              <Route path="/permissions" element={<FolderPermissions />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/storage" element={<StorageDashboard />} />
              <Route path="/search" element={<SearchPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}