import React, { useEffect, useRef, useState } from 'react';
import { LEADERSHIP, MEMBERS_DATA } from '../data/gwdData';
import '../styles/structure.css';

export default function CoreStructureMembersSection() {
  const [selectedLeaderId, setSelectedLeaderId] = useState(LEADERSHIP[0].id);
  const networkCanvasRef = useRef(null);

  const selectedLeader = LEADERSHIP.find(l => l.id === selectedLeaderId) || LEADERSHIP[0];

  // Interactive Living Constellation Network for 07 - THE STRUCTURE
  useEffect(() => {
    const canvas = networkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Root GWD Center Node
    const rootNode = { x: width * 0.5, y: height * 0.45, label: "GWD CLUB", r: 12, isRoot: true };

    // Leadership Nodes arranged radially
    const leaderNodes = LEADERSHIP.map((lead, i) => {
      const angle = (i / LEADERSHIP.length) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(width, height) * 0.32;
      return {
        id: lead.id,
        name: lead.name,
        position: lead.position,
        x: rootNode.x + Math.cos(angle) * radius,
        y: rootNode.y + Math.sin(angle) * radius,
        r: 7,
        baseAngle: angle,
        orbitRadius: radius,
        isLeader: true
      };
    });

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      // Update positions with subtle floating
      leaderNodes.forEach((node, i) => {
        const float = Math.sin(time + i) * 5;
        node.x = rootNode.x + Math.cos(node.baseAngle) * (node.orbitRadius + float);
        node.y = rootNode.y + Math.sin(node.baseAngle) * (node.orbitRadius + float);
      });

      // Draw connections from root to all leaders
      leaderNodes.forEach((node) => {
        const isSelected = node.id === selectedLeaderId;
        ctx.beginPath();
        ctx.moveTo(rootNode.x, rootNode.y);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = isSelected ? '#ff1b3c' : 'rgba(0, 81, 46, 0.18)';
        ctx.lineWidth = isSelected ? 2.5 : 1;
        if (isSelected) {
          ctx.shadowColor = '#ff1b3c';
          ctx.shadowBlur = 14;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
      });

      // Draw Root Node
      ctx.save();
      ctx.beginPath();
      ctx.arc(rootNode.x, rootNode.y, rootNode.r + Math.sin(time * 2) * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ff1b3c';
      ctx.shadowColor = '#ff1b3c';
      ctx.shadowBlur = 20;
      ctx.fill();

      // Root label
      ctx.font = '600 11px Orbitron, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(rootNode.label, rootNode.x, rootNode.y + 26);
      ctx.restore();

      // Draw Leader Nodes
      leaderNodes.forEach((node) => {
        const isSelected = node.id === selectedLeaderId;
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? node.r + 4 : node.r, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#ff1b3c' : 'rgba(0, 81, 46, 0.75)';
        ctx.shadowColor = isSelected ? '#ff1b3c' : 'rgba(0, 81, 46, 0.3)';
        ctx.shadowBlur = isSelected ? 18 : 4;
        ctx.fill();

        // Node Title
        ctx.font = isSelected ? '600 10px Space Grotesk, monospace' : '400 9px Space Grotesk, monospace';
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(242, 242, 242, 0.45)';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + (isSelected ? 22 : 16));
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    // Canvas cursor feedback on hover
    const handleCanvasMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const isOverNode = leaderNodes.some((node) => {
        const dist = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2);
        return dist <= node.r + 14;
      });
      canvas.style.cursor = isOverNode ? 'pointer' : 'default';
    };

    // Canvas click to select node
    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      leaderNodes.forEach((node) => {
        const dist = Math.sqrt((clickX - node.x) ** 2 + (clickY - node.y) ** 2);
        if (dist <= node.r + 14) {
          setSelectedLeaderId(node.id);
        }
      });
    };

    canvas.addEventListener('mousemove', handleCanvasMouseMove, { passive: true });
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animId);
    };
  }, [selectedLeaderId]);

  return (
    <section id="structure-and-members" className="structure-flow" aria-label="Chapters 06, 07, 08: Core Team, Structure, and Members">
      {/* 06 — THE CORE TEAM */}
      <div id="core-team" className="core-team-stage">
        <div className="section-container">
          <header className="core-team-header">
            <div className="chapter-eyebrow center">
              <span className="eyebrow-idx">CHAPTER 06</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">THE COLLECTIVE FORCE</span>
            </div>

            <h2 className="core-team-statement reveal-title">
              ONE CLUB<span className="title-accent-dot">.</span>
              <br />
              MANY MINDS<span className="title-accent-dot">.</span>
            </h2>
          </header>

          {/* Group Photo Monolith Frame */}
          <div className="core-team-group-frame" data-cursor="image" tabIndex={0} aria-label="GWD Core Team photograph placeholder">
            <div className="group-frame-corner c-tl" />
            <div className="group-frame-corner c-tr" />
            <div className="group-frame-corner c-bl" />
            <div className="group-frame-corner c-br" />

            <div className="group-photo-viewport">
              <div className="group-placeholder-box">
                <div className="group-scan-line" />
                <div className="group-icon">
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="strict-photo-label large">[PHOTO — GWD CORE TEAM]</span>
                <span className="photo-ratio-hint">WIDE CINEMATIC COMPOSITION // 16:9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 07 — THE STRUCTURE (Living Constellation Network) */}
      <div id="structure" className="living-structure-stage">
        <div className="section-container">
          <header className="structure-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 07</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">THE LIVING CONSTELLATION</span>
            </div>

            <h2 className="structure-title reveal-title">THE STRUCTURE<span className="title-accent-dot">.</span></h2>
            <p className="structure-desc">
              GWD functions as an interconnected organism. Explore the constellation of leadership and domain branches.
            </p>
          </header>

          <div className="constellation-viewer">
            {/* Interactive Network Canvas */}
            <div className="constellation-canvas-frame">
              <canvas ref={networkCanvasRef} className="network-canvas" />
              <div className="canvas-interaction-hint">INTERACTIVE CONSTELLATION // CLICK NODES TO INSPECT</div>
            </div>

            {/* Active Branch Inspector Panel */}
            <div className="branch-inspector-panel">
              <div className="inspector-badge">BRANCH INSPECTOR</div>
              <div className="inspector-leader-info">
                <span className="ins-pos">{selectedLeader.position}</span>
                <h3 className="ins-name">{selectedLeader.name}</h3>
                <span className="ins-domain">DOMAIN: {selectedLeader.branch.toUpperCase()}</span>
              </div>

              <div className="ins-connections">
                <span className="conn-title">CONNECTED DOMAIN NETWORK</span>
                <p className="conn-desc">
                  This branch coordinates execution across creative, operational, and technical squads within GWD Club.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 08 — THE MEMBERS (The Digital Archive) */}
      <div id="members" className="members-archive-stage">
        <div className="section-container">
          <header className="members-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 08</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">THE EXPANDING COLLECTIVE</span>
            </div>

            <h2 className="members-title reveal-title">THE MEMBERS<span className="title-accent-dot">.</span></h2>
            <p className="members-desc">
              The builders, creators, and contributors powering the heartbeat of GWD.
            </p>
          </header>

          {/* Asymmetric Editorial Archive Grid */}
          <div className="members-editorial-grid">
            {MEMBERS_DATA.map((member, i) => (
              <div
                key={member.id}
                className={`member-editorial-card card-variant-${i % 3}`}
                data-cursor="image"
                tabIndex={0}
                aria-label={`Member: ${member.placeholderName}, ${member.team}`}
              >
                <div className="member-photo-frame">
                  <div className="member-placeholder-box">
                    <span className="member-placeholder-tag">{member.photoPlaceholder}</span>
                  </div>
                </div>

                <div className="member-meta-block">
                  <span className="member-team-tag">{member.team}</span>
                  <h4 className="member-title">{member.placeholderName}</h4>
                </div>
              </div>
            ))}
          </div>

          <div className="members-notice-archive">
            <span className="notice-tag">ARCHIVE STATUS</span>
            <p className="notice-text">
              Member roster and domain photographs will be cataloged progressively as real submissions are verified.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
