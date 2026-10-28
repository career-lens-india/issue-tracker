import { useEffect, useState } from 'react';
import { fetchStage, fetchStageFile } from '../api';
import { statusClass, statusLabel } from '../statusLabels';
import CodeViewer from './CodeViewer';

const TAB_DEFS = [
  { id: 'overview', label: 'Overview' },
  { id: 'instructions', label: 'Instructions' },
  { id: 'starter', label: 'Starter', files: 'starter' },
  { id: 'verification', label: 'Verification' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'recapBefore', label: 'Before solution', field: 'recapBeforeSolution' },
  { id: 'solution', label: 'Solution', files: 'solution', completedOnly: true },
  { id: 'recapAfter', label: 'After solution', field: 'recapAfterSolution', completedOnly: true },
];

export default function StageDetail({ stageId, listMeta, onBack }) {
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileError, setFileError] = useState('');

  const meta = listMeta || stage;
  const status = meta?.status || 'COMING_SOON';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      if (status === 'COMING_SOON') {
        setStage(null);
        setLoading(false);
        return;
      }
      try {
        const data = await fetchStage(stageId);
        if (!cancelled) setStage(data.stage);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load stage');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [stageId, status]);

  useEffect(() => {
    if (!selectedFile || !stage) return;
    let cancelled = false;
    async function loadFile() {
      setFileError('');
      try {
        const data = await fetchStageFile(stageId, selectedFile);
        if (!cancelled) setFileContent(data.file.content);
      } catch (err) {
        if (!cancelled) {
          setFileContent('');
          setFileError(err.message || 'Could not load file');
        }
      }
    }
    loadFile();
    return () => {
      cancelled = true;
    };
  }, [selectedFile, stageId, stage]);

  function tabVisible(def) {
    if (def.completedOnly && status !== 'COMPLETED') return false;
    if (def.field && !stage?.[def.field]) return false;
    if (def.files === 'solution' && status !== 'COMPLETED') return false;
    return true;
  }

  const visibleTabs = TAB_DEFS.filter(tabVisible);

  function renderMarkdownBlock(text, emptyLabel) {
    if (!text) {
      return <p className="muted">{emptyLabel}</p>;
    }
    return <pre className="doc-block">{text}</pre>;
  }

  function fileTree(files, category) {
    const filtered = (files || []).filter((f) => f.startsWith(`${category}/`));
    if (!filtered.length) {
      return <p className="muted">No files in this category.</p>;
    }
    return (
      <ul className="file-tree">
        {filtered.map((f) => (
          <li key={f}>
            <button
              type="button"
              className={selectedFile === f ? 'active' : ''}
              onClick={() => setSelectedFile(f)}
            >
              {f.replace(`${category}/`, '')}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  if (loading && status !== 'COMING_SOON') {
    return <p className="center-msg">Loading stage…</p>;
  }

  return (
    <div className="stage-detail">
      <button type="button" className="link-back" onClick={onBack}>← Workshop modules</button>
      <header className="detail-header">
        <p className="stage-order-label">Stage {meta?.order ?? stage?.order}</p>
        <h2>{meta?.title ?? stage?.title}</h2>
        <span className={`badge ${statusClass(status)}`}>{statusLabel(status)}</span>
      </header>

      {status === 'COMING_SOON' && (
        <div className="coming-soon-panel">
          <h3>Coming Soon</h3>
          <p>
            This stage has not been released yet. Check back when your instructor publishes it as Live.
          </p>
        </div>
      )}

      {error && <p className="error-banner">{error}</p>}

      {stage && (
        <>
          {status === 'LIVE' && stage.recapBeforeSolution && (
            <p className="learning-callout">
              Finish the verification checklist, then read <strong>Before solution</strong> to solidify
              what you learned before your instructor marks this stage completed.
            </p>
          )}
          {status === 'COMPLETED' && stage.recapAfterSolution && (
            <p className="learning-callout">
              Compare your work with the <strong>Solution</strong> tab, then read{' '}
              <strong>After solution</strong> to lock in concepts for the next stage.
            </p>
          )}

          <nav className="tab-nav">
            {visibleTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? 'active' : ''}
                onClick={() => {
                  setTab(t.id);
                  setSelectedFile('');
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="tab-panel">
            {tab === 'overview' && (
              <div className="overview">
                <p><strong>Duration:</strong> {stage.durationMinutes} minutes</p>
                <h4>Learning objectives</h4>
                <ul>{stage.learningObjectives.map((o) => <li key={o}>{o}</li>)}</ul>
                <h4>Prerequisites</h4>
                <ul>{stage.prerequisites.map((p) => <li key={p}>{p}</li>)}</ul>
                <h4>Syllabus topics</h4>
                <ul>{stage.syllabusTopics.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            )}
            {tab === 'instructions' && renderMarkdownBlock(stage.instructions, 'No instructions available.')}
            {tab === 'verification' && renderMarkdownBlock(stage.verification, 'No verification checklist.')}
            {tab === 'challenge' && renderMarkdownBlock(stage.challenge, 'No challenge instructions.')}
            {tab === 'recapBefore' &&
              renderMarkdownBlock(
                stage.recapBeforeSolution,
                'Recap notes for this stage are not published yet.'
              )}
            {tab === 'recapAfter' &&
              renderMarkdownBlock(
                stage.recapAfterSolution,
                'Post-solution recap will appear when your instructor marks this stage completed.'
              )}
            {(tab === 'starter' || tab === 'solution') && (
              <div className="files-layout">
                {fileTree(
                  tab === 'starter' ? stage.starterFiles : stage.solutionFiles,
                  tab
                )}
                <div className="file-content">
                  {!selectedFile && <p className="muted">Select a file to view its contents.</p>}
                  {fileError && <p className="error-banner">{fileError}</p>}
                  {selectedFile && fileContent && (
                    <CodeViewer
                      stageId={stageId}
                      filePath={selectedFile}
                      content={fileContent}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
