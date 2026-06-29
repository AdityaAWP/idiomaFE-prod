import Link from "next/link";
import "./landing.css";

export const metadata = {
  title: "IdiomaMate - Authentic Language Exchange",
  description:
    "Master languages through authentic video conversations. A professional platform for serious learners.",
};

export default function LandingPage() {
  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <div className="logo">IdiomaMate</div>
          <div className="nav-links">
            <Link href="#features">Features</Link>
            <Link href="#methodology">Methodology</Link>
          </div>
          <div className="nav-cta">
            <Link href="/login" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary">
              Register
              <svg
                className="arr"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-deco">fluency</div>
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">
              <div className="pulse"></div>
              <div className="mono">Live Matchmaking Active</div>
            </div>
            <h1 className="display">
              Master languages. <span className="serif-em">Authentically.</span>
            </h1>
            <p className="lead">
              A professional environment engineered for serious learners. Build
              fluency, confidence, and cross-cultural competence{" "}
              <span className="dot">•</span> together.
            </p>
            <div className="hero-cta">
              <Link href="/register" className="btn btn-lg btn-accent">
                Start Speaking Now
                <svg
                  className="arr"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
              <Link href="#features" className="btn btn-lg btn-ghost">
                Explore Platform
              </Link>
            </div>
            <div className="flags">
              <div className="mono">Available</div>
              <div className="flags-row">
                <div className="flag" title="Russian">
                  <img
                    src="/flag_ru.png"
                    alt="Russian"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div className="flag" title="Chinese">
                  <img
                    src="/flag_cn.png"
                    alt="Chinese"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div className="flag" title="Arabic">
                  <img
                    src="/flag_sa.png"
                    alt="Arabic"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div className="flag" title="English">
                  <img
                    src="/flag_uk.png"
                    alt="English"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div className="flag" title="Japanese">
                  <img
                    src="/flag_jp.png"
                    alt="Japanese"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div className="flag" title="Korean">
                  <img
                    src="/flag_ko.png"
                    alt="Korean"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div className="flag" title="Spanish">
                  <img
                    src="/flag_es.png"
                    alt="Spanish"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div className="flag" title="French">
                  <img
                    src="/flag_fr.png"
                    alt="French"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="vcall">
            <div className="vcall-top">
              <div className="who">Room • Advanced Spanish</div>
              <div className="live">Recording</div>
            </div>
            <div className="tiles">
              <div className="tile">
                <div className="name">
                  <div className="mic"></div> You
                </div>
              </div>
              <div className="tile two">
                <div className="name">
                  <div className="mic"></div> Maria G.
                </div>
                <div className="caption">"La parte más difícil fue..."</div>
              </div>
            </div>
            <div className="vcall-bar">
              <div className="ctrl">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
              </div>
              <div className="ctrl">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect>
                </svg>
              </div>
              <div className="ctrl end">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                  <line x1="22" x2="2" y1="2" y2="22"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ticker">
        <div className="ticker-track">
          <div className="ticker-item">
            No more awkward silences <span className="star">✦</span>
          </div>
          <div className="ticker-item">
            Match instantly <span className="star">✦</span>
          </div>
          <div className="ticker-item">
            Practice with natives <span className="star">✦</span>
          </div>
          <div className="ticker-item">
            Dynamic topic cards <span className="star">✦</span>
          </div>
          <div className="ticker-item">
            Build true fluency <span className="star">✦</span>
          </div>
          <div className="ticker-item">
            No more awkward silences <span className="star">✦</span>
          </div>
          <div className="ticker-item">
            Match instantly <span className="star">✦</span>
          </div>
        </div>
      </div>

      <section className="topics" id="features">
        <div className="container">
          <div className="section-head">
            <div className="mono">Live Scaffolding</div>
            <h2 className="h2">Never run out of things to say</h2>
            <p>
              When silence hits, IdiomaMate surfaces contextual topic cards in
              real-time. Explore the topics below — this is exactly what your
              partner sees.
            </p>
          </div>
          <div className="topic-grid">
            <div className="topic">
              <div className="tag">
                <div className="dot-live"></div> Silence detected
              </div>
              <div className="icon">🌏</div>
              <div>
                <h4>Cultural Traditions</h4>
                <p>
                  "What is a tradition from your country that you are most proud
                  of?"
                </p>
              </div>
              <div className="foot">Topic Card</div>
            </div>
            <div className="topic">
              <div className="tag">
                <div className="dot-live"></div> Silence detected
              </div>
              <div className="icon">🍜</div>
              <div>
                <h4>Food & Cuisine</h4>
                <p>
                  "Describe your favourite dish and explain how it is prepared."
                </p>
              </div>
              <div className="foot">Topic Card</div>
            </div>
            <div className="topic">
              <div className="tag">
                <div className="dot-live"></div> Silence detected
              </div>
              <div className="icon">🎬</div>
              <div>
                <h4>Movies & Culture</h4>
                <p>"Which film changed your perspective on life, and why?"</p>
              </div>
              <div className="foot">Topic Card</div>
            </div>
            <div className="topic">
              <div className="tag">
                <div className="dot-live"></div> Silence detected
              </div>
              <div className="icon">✈️</div>
              <div>
                <h4>Travel Dreams</h4>
                <p>
                  "If you could visit any place in the world, where would you
                  go?"
                </p>
              </div>
              <div className="foot">Topic Card</div>
            </div>
            <div className="topic">
              <div className="tag">
                <div className="dot-live"></div> Silence detected
              </div>
              <div className="icon">🤖</div>
              <div>
                <h4>Tech & Future</h4>
                <p>
                  "How do you think AI will change the way we learn languages?"
                </p>
              </div>
              <div className="foot">Topic Card</div>
            </div>
          </div>
        </div>
      </section>

      <section className="arch">
        <div className="container">
          <div className="section-head">
            <div className="mono">Architecture</div>
            <h2 className="h2">
              Structured for <span className="serif-em">success</span>
            </h2>
            <p>
              Casual language apps fail because they lack structure. We provide
              robust scaffolding to eliminate language anxiety and ensure
              productive learning sessions.
            </p>
          </div>

          <div className="feature">
            <div className="feature-visual">
              <div className="viz-match">
                <svg
                  viewBox="0 0 400 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="200"
                    cy="200"
                    r="140"
                    stroke="var(--line)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                  />
                  <circle cx="200" cy="200" r="80" fill="var(--paper)" />
                  <circle
                    cx="200"
                    cy="200"
                    r="70"
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                  <path
                    d="M200 130 V160 M200 240 V270 M130 200 H160 M240 200 H270"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="body">
              <div className="badge">1</div>
              <h3>Precision Matchmaking</h3>
              <p>
                Define proficiency, goals, and icebreakers before a session. Our
                algorithm connects you only with partners who align with your
                learning style.
              </p>
              <Link href="/register" className="lnk">
                Configure your profile
                <svg
                  className="arr"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>

          <div className="feature reverse">
            <div className="feature-visual">
              <div className="viz-scaf">
                <div className="scaf-row">
                  <div className="head">Partner</div>
                  <div className="scaf-bubble them">
                    I went to the store today and... um...
                  </div>
                </div>
                <div className="scaf-hint">
                  <span className="pill">Hint</span> Ask what they bought!
                </div>
                <div
                  className="scaf-row"
                  style={{ alignItems: "flex-end", marginTop: "10px" }}
                >
                  <div className="head">You</div>
                  <div className="scaf-bubble you">
                    What did you end up buying?
                  </div>
                </div>
              </div>
            </div>
            <div className="body">
              <div className="badge">2</div>
              <h3>Dynamic Scaffolding</h3>
              <p>
                Real-time topic suggestions, cultural trivia, and grammar
                prompts activate the moment a conversation stalls—so silence
                never wins.
              </p>
              <Link href="/register" className="lnk">
                See it in action
                <svg
                  className="arr"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="principles" id="methodology">
        <div className="container">
          <div className="section-head">
            <div className="mono">Core Pillars</div>
            <h2 className="h2">Why it works</h2>
            <p>
              We focus on practical conversation and smart matchmaking, giving
              you the perfect environment to build your confidence.
            </p>
          </div>
          <div className="prin-grid">
            <div className="prin">
              <div className="ic">A</div>
              <div>
                <h4>Guided Learning</h4>
                <p>
                  Learn with partners who match your exact level, helping you
                  improve naturally through practical, real-world conversations.
                </p>
              </div>
            </div>
            <div className="prin">
              <div className="ic">B</div>
              <div>
                <h4>No More Awkward Silences</h4>
                <p>
                  Our dynamic topic cards and real-time prompts keep the
                  conversation flowing smoothly, so you never run out of things
                  to say.
                </p>
              </div>
            </div>
            <div className="prin">
              <div className="ic">C</div>
              <div>
                <h4>Distraction-Free Environment</h4>
                <p>
                  A clean, easy-to-use interface designed specifically for
                  focused language practice, free from the noise of typical
                  apps.
                </p>
              </div>
            </div>
            <div className="prin">
              <div className="ic">D</div>
              <div>
                <h4>Genuine Connections</h4>
                <p>
                  Express yourself in an environment built around preventing
                  conversation breakdown and fostering real understanding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="how">
        <div className="container">
          <div className="section-head">
            <div className="mono">The Process</div>
            <h2 className="h2">Journey to fluency</h2>
            <p>Your path to speaking confidently in four simple steps.</p>
          </div>
          <div className="timeline">
            <div className="tstep">
              <div className="num">1</div>
              <h4>Create Profile</h4>
              <p>Set your language goals and proficiency level.</p>
            </div>
            <div className="tstep">
              <div className="num">2</div>
              <h4>Get Matched</h4>
              <p>Our AI finds perfect conversation partners.</p>
            </div>
            <div className="tstep">
              <div className="num">3</div>
              <h4>Practice Live</h4>
              <p>Join interactive sessions with guidance.</p>
            </div>
            <div className="tstep">
              <div className="num">4</div>
              <h4>Track Progress</h4>
              <p>Monitor improvements and celebrate wins.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="mono">Join Today</div>
          <h2 className="display">
            Ready to speak <span className="serif-em">without fear?</span>
          </h2>
          <p className="lead">
            Join IdiomaMate and experience the only language-exchange platform
            built around preventing conversation breakdown.
          </p>
          <div className="row">
            <Link href="/register" className="btn btn-lg btn-accent">
              Get Started — It&apos;s Free
              <svg
                className="arr"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="foot-inner">
            <div className="logo">IdiomaMate</div>
            <div className="foot-links">
              <Link href="#">Platform</Link>
              <Link href="#">Documentation</Link>
              <Link href="#">Privacy</Link>
              <Link href="#">Terms</Link>
            </div>
          </div>
          <div className="foot-bottom">
            <span>
              &copy; {new Date().getFullYear()} IdiomaMate. All rights reserved.
            </span>
            <span>Made for authentic human connections.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
