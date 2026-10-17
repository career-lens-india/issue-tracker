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
        <div className="coming-soon-panel empty-portal">
          <h2>Content not available yet</h2>
          <p>
            Workshop materials will show up here when your instructor publishes the first stage.
            Please check back during the session — you do not need to do anything until content appears.
          </p>
        </div>
      )}
      {!loading && !error && hasReleasedContent && (
        <div className="stage-grid">
          {stages.map((s) => (
            <article key={s.id} className="stage-card">
              <div className="card-top">
                <span className="stage-num">
                  {s.status === 'LIVE' ? 'Current module' : 'Previous module'}
                </span>
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
