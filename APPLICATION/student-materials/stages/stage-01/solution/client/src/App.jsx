import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';
import IssueDetail from './pages/IssueDetail';
import CreateIssue from './pages/CreateIssue';
import Users from './pages/Users';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="/issues/new" element={<CreateIssue />} />
        <Route path="/issues/:id" element={<IssueDetail />} />
        <Route path="/users" element={<Users />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
