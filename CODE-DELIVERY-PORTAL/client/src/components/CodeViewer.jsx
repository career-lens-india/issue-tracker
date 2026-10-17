import { useState } from 'react';
import { downloadFile } from '../api';

export default function CodeViewer({ stageId, filePath, content, onLoadFile }) {
  const [copyMsg, setCopyMsg] = useState('');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopyMsg('Copied!');
      setTimeout(() => setCopyMsg(''), 2000);
    } catch {
      setCopyMsg('Copy failed');
    }
  }

  return (
    <div className="code-viewer">
      <div className="code-toolbar">
        <span className="code-path">{filePath}</span>
        <div className="code-actions">
          <button type="button" onClick={handleCopy}>Copy</button>
          {copyMsg && <span className="copy-msg">{copyMsg}</span>}
          <button
            type="button"
            onClick={() => downloadFile(stageId, filePath, content)}
          >
            Download
          </button>
          {onLoadFile && (
            <button type="button" className="secondary" onClick={onLoadFile}>
              Refresh
            </button>
          )}
        </div>
      </div>
      <pre className="code-block"><code>{content}</code></pre>
    </div>
  );
}
