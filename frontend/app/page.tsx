import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="landing-shell">
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          <span className="brand-mark">SA</span>
          <span>AI Study Assistant</span>
        </Link>
        <div className="navbar-links">
          <Link href="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link href="/upload" className="navbar-link">
            Upload
          </Link>
        </div>
      </nav>

      <div className="container">
        <header className="hero-grid">
          <div className="hero-copy">
          <p className="hero-kicker">OS, DBMS, DSA, CN</p>
          <h1 className="hero-title">Study in one calm workspace.</h1>
          <p className="hero-subtitle">
            Turn your notes into mindmaps, explanations, and questions. Stay in
            context with a focused tutor panel that keeps you moving.
          </p>
          <div className="hero-actions">
            <Link href="/dashboard" className="btn-primary">
              Open dashboard
            </Link>
            <Link href="/topic/demo-topic" className="btn-secondary">
              Try with sample topic
            </Link>
          </div>
          <p className="hero-meta">
            Designed for Indian CSE students who want clarity without clutter.
          </p>
          </div>

          <div className="hero-visual">
            <div className="mindmap-preview">
              <div className="mindmap-preview-header">Sample mindmap</div>
              <ul className="mindmap-list">
                <li>
                  Process Scheduling
                  <ul>
                    <li>FCFS</li>
                    <li>
                      SJF
                      <ul>
                        <li>Preemptive</li>
                        <li>Burst estimation</li>
                      </ul>
                    </li>
                    <li>Round Robin</li>
                    <li>Priority + Aging</li>
                  </ul>
                </li>
              </ul>
              <div className="mindmap-preview-footer">
                Nodes tagged with definitions, algorithms, and examples.
              </div>
            </div>

            <div className="preview-stack">
              <div className="preview-card">
                <div className="preview-card-title">Explanation</div>
                <p>
                  Simple explanation plus a quick analogy to make the intuition
                  stick.
                </p>
              </div>
              <div className="preview-card">
                <div className="preview-card-title">Quick quiz</div>
                <p>
                  One question at a time with difficulty tags and clean answers.
                </p>
              </div>
              <div className="preview-card">
                <div className="preview-card-title">Tutor</div>
                <div className="preview-chat">
                  <span className="preview-chat-role">Tutor</span>
                  Think of scheduling like a queue at a canteen.
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="how-section">
          <h2 className="section-title">How it works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-index">1</div>
              <h3>Paste notes</h3>
              <p>
                Drop raw notes or lecture summaries. The system cleans and
                structures them.
              </p>
            </div>
            <div className="step-card">
              <div className="step-index">2</div>
              <h3>Generate mindmap</h3>
              <p>
                Visualize relationships between core ideas, examples, and common
                pitfalls.
              </p>
            </div>
            <div className="step-card">
              <div className="step-index">3</div>
              <h3>Study and practice</h3>
              <p>
                Read explanations, flip through questions, and ask the tutor when
                stuck.
              </p>
            </div>
          </div>
        </section>

        <section className="landing-note">
          <p className="footnote">
            This tool does not do homework for you. It teaches you how to think.
          </p>
        </section>
      </div>
    </div>
  );
}