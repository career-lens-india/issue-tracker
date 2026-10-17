import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import StudentAccessGate from './components/StudentAccessGate';

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand">SprintBoard Portal</Link>
        <nav>
          <Link to="/">Workshop</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </header>
      <main className="site-main">
        <Routes>
          <Route
            path="/"
            element={
              <StudentAccessGate>
                <HomePage />
              </StudentAccessGate>
            }
          />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <small>Student materials served from the workshop content packages. Solutions appear only for Completed stages.</small>
      </footer>
    </div>
  );
}
