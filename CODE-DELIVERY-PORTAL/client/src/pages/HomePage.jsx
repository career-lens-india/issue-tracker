import { useEffect, useState } from 'react';
import { fetchStages } from '../api';
import { statusClass, statusLabel } from '../statusLabels';
import StageDetail from '../components/StageDetail';

export default function HomePage() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchStages();
        if (!cancelled) setStages(data.stages);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load stages');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedMeta = stages.find((s) => s.id === selectedId);

  if (selectedId) {
    return (
      <StageDetail
        stageId={selectedId}
        listMeta={selectedMeta}
        onBack={() => setSelectedId('')}
      />
    );
  }

  const hasReleasedContent = stages.length > 0;

  return (
    <div className="home-page">
      <header className="hero">
        <h1>SprintBoard workshop</h1>
        <p>
          Your instructor releases coding exercises here when the class is ready.
          Open any available module below to view instructions and starter code.
        </p>
      </header>
      {loading && <p className="center-msg">Loading…</p>}
      {error && <p className="error-banner">{error}</p>}
      {!loading && !error && !hasReleasedContent && (
        <div className="coming-soon-panel empty-portal setup-guide">
          <h2>Set up your machine while you wait</h2>
          <p className="muted">
            Stage modules appear here when your instructor publishes them. If nothing is live yet,
            install the tools below from scratch so you are ready for Stage 1.
          </p>

          <h3>1. Install Node.js and npm</h3>
          <ol>
            <li>
              Download the <strong>LTS</strong> installer from{' '}
              <a href="https://nodejs.org/" target="_blank" rel="noreferrer">
                nodejs.org
              </a>{' '}
              (includes npm).
            </li>
            <li>Close and reopen your terminal after installing.</li>
            <li>Confirm both are available:</li>
          </ol>
          <pre className="setup-cmd">{`node -v
npm -v`}</pre>
          <p className="muted">You should see version numbers (for example Node 20.x and npm 10.x).</p>

          <h3>2. Create a new React app with Vite</h3>
          <p>Pick a folder where you keep projects, then run:</p>
          <pre className="setup-cmd">{`npm create vite@latest sprintboard-app -- --template react
cd sprintboard-app
npm install
npm run dev`}</pre>
          <p>
            Open the URL Vite prints (usually <code>http://localhost:5173</code>). You should see the
            default Vite + React page. This <code>sprintboard-app</code> folder is where you will
            apply each stage&apos;s starter code during the workshop.
          </p>

          <h3>3. When content goes live</h3>
          <p>
            Refresh this page. Open <strong>Stage 1</strong>, read the instructions, and copy starter
            files into your <code>sprintboard-app</code> project as directed.
          </p>
        </div>
      )}
      {!loading && !error && hasReleasedContent && (
        <div className="stage-grid">
          {stages.map((s) => (
            <article key={s.id} className="stage-card">
              <div className="card-top">
                <span className="stage-num">Stage {s.order}</span>
                <span className={`badge ${statusClass(s.status)}`}>{statusLabel(s.status)}</span>
              </div>
              <h3>{s.title}</h3>
              <p className="objective">{s.learningObjectives?.[0]}</p>
              <p className="meta-line">{s.durationMinutes} min · {s.prerequisites?.[0]}</p>
              <button type="button" onClick={() => setSelectedId(s.id)}>Open module</button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
