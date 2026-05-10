import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FileExplorer from './pages/FileExplorer';
import FileDetails from './pages/FileDetails';

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

              <Route path="/users" element={<Navigate to="/dashboard" replace />} />
              <Route path="/permissions" element={<Navigate to="/dashboard" replace />} />
              <Route path="/activity" element={<Navigate to="/dashboard" replace />} />
              <Route path="/storage" element={<Navigate to="/dashboard" replace />} />
              <Route path="/search" element={<Navigate to="/dashboard" replace />} />
              <Route path="/trash" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}