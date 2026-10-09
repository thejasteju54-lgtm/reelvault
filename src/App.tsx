import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { SavedReels } from './pages/SavedReels';
import { Favorites } from './pages/Favorites';
import { Archive } from './pages/Archive';
import { Tags } from './pages/Tags';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="saved" element={<SavedReels />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="archive" element={<Archive />} />
              <Route path="tags" element={<Tags />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
