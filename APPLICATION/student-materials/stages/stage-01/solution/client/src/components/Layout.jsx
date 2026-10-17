import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/issues', label: 'Issues' },
  { to: '/users', label: 'Users' },
  { to: '/issues/new', label: 'Create Issue' },
];

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <h1>SprintBoard</h1>
          <p className="subtitle">Team Issue Management</p>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <span>Shared workspace — no login required for this milestone</span>
      </footer>
    </div>
  );
}
