import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Editor from '@monaco-editor/react';
import './styles.css';

const API_URL = 'http://127.0.0.1:8000';

const starterCode = {
  python: `print("Hello, World")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Abhijeet");
    }
}`
};

function App() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(starterCode.python);
  const [output, setOutput] = useState('Ready. Click Run to execute your code.');
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);
  const [running, setRunning] = useState(false);

  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);

  const monacoLanguage = useMemo(
    () => (language === 'java' ? 'java' : 'python'),
    [language]
  );

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      const response = await fetch(`${API_URL}/files`);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(`Could not load files. ${err.message}`);
    }
  }

  async function openFile(filename) {
    try {
      const response = await fetch(
        `${API_URL}/files/${encodeURIComponent(filename)}`
      );
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Could not open file');
      }
      setCurrentFile(filename);
      setCode(data.code || '');
      if (filename.endsWith('.py')) setLanguage('python');
      else if (filename.endsWith('.java')) setLanguage('java');
      setOutput(`Opened ${filename}`);
      setError('');
      setStatus(null);
    } catch (err) {
      setError(`Could not open file. ${err.message}`);
    }
  }

  async function createFile() {
    const filename = newFileName.trim();
    if (!filename) return;
    if (!filename.endsWith('.py') && !filename.endsWith('.java')) {
      setError('Use .py or .java file extension.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Could not create file');
      }
      setNewFileName('');
      setShowNewFile(false);
      await loadFiles();
      await openFile(filename);
    } catch (err) {
      setError(`Could not create file. ${err.message}`);
    }
  }

  async function saveFile() {
    if (!currentFile) {
      setError('No file selected.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/files`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: currentFile, code })
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Could not save file');
      }
      setOutput(`✓ ${currentFile} saved successfully.`);
      setError('');
      setStatus(0);
      await loadFiles();
    } catch (err) {
      setError(`Could not save file. ${err.message}`);
      setStatus(null);
    }
  }

  function changeLanguage(value) {
    setLanguage(value);
    if (!currentFile) setCode(starterCode[value]);
    setOutput('Ready. Click Run to execute your code.');
    setError('');
    setStatus(null);
  }

  async function runCode() {
    setRunning(true);
    setOutput('Running...');
    setError('');
    setStatus(null);
    try {
      const response = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ? JSON.stringify(data.detail) : 'Request failed');
      }
      setOutput(data.output || '');
      setError(data.error || '');
      setStatus(data.status);
    } catch (err) {
      setOutput('');
      setError(`Could not connect to backend. ${err.message}`);
      setStatus(null);
    } finally {
      setRunning(false);
    }
  }

  function clearOutput() {
    setOutput('');
    setError('');
    setStatus(null);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo">&lt;/&gt;</div>
          <div><h1>MY_Editor</h1><span>Web Code Editor</span></div>
        </div>
        <div className="toolbar">
          <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          {currentFile && <span className="current-file">{currentFile}</span>}
          <button className="save-btn" onClick={saveFile} disabled={!currentFile}>💾 Save</button>
          <button className="run-btn" onClick={runCode} disabled={running}>
            {running ? 'Running...' : '▶ Run'}
          </button>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="panel-title-row">
            <div className="panel-title">EXPLORER</div>
            <button onClick={loadFiles} title="Refresh files">↻</button>
          </div>
          <div className="folder">📁 workspace</div>

          {!showNewFile ? (
            <button className="new-file-btn" onClick={() => setShowNewFile(true)}>＋ New File</button>
          ) : (
            <div className="new-file-box">
              <input
                autoFocus
                value={newFileName}
                placeholder="example.py"
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createFile();
                  if (e.key === 'Escape') { setShowNewFile(false); setNewFileName(''); }
                }}
              />
              <div className="new-file-actions">
                <button onClick={createFile}>Create</button>
                <button onClick={() => { setShowNewFile(false); setNewFileName(''); }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="file-list">
            {files.length === 0 ? <div className="empty-files">No files yet</div> : files.map((file) => (
              <div key={file} className={`file ${currentFile === file ? 'active' : ''}`} onClick={() => openFile(file)}>
                {file.endsWith('.py') ? '🐍' : file.endsWith('.java') ? '☕' : '📄'} {file}
              </div>
            ))}
          </div>

          <div className="info-box">
            <strong>Backend</strong>
            <span>FastAPI :8000</span>
            <span>POST /run</span>
            <span>GET /files</span>
            <span>POST /files</span>
            <span>PUT /files</span>
          </div>
        </aside>

        <section className="editor-panel">
          <div className="tabbar">
            <span>{currentFile || 'Untitled'}</span>
            <span className="language-pill">{language}</span>
          </div>
          <div className="editor-wrap">
            <Editor
              height="100%"
              language={monacoLanguage}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value ?? '')}
              options={{
                minimap: { enabled: false }, fontSize: 15, automaticLayout: true,
                padding: { top: 14 }, scrollBeyondLastLine: false, tabSize: 4,
                wordWrap: 'on', lineNumbers: 'on', cursorBlinking: 'smooth'
              }}
            />
          </div>
        </section>
      </main>

      <section className="terminal">
        <div className="terminal-header">
          <div className="terminal-tabs"><span className="selected">TERMINAL</span><span>OUTPUT</span></div>
          <button onClick={clearOutput}>Clear</button>
        </div>
        <div className="terminal-body">
          {output && <pre className="output">{output}</pre>}
          {error && <pre className="error">{error}</pre>}
          {status !== null && <div className={status === 0 ? 'success-status' : 'error-status'}>Process exited with code {status}</div>}
        </div>
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
