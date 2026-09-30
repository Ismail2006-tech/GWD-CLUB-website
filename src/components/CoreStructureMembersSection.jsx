import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LEADERSHIP, MEMBERS_DATA } from '../data/gwdData';
import '../styles/structure.css';

export default function CoreStructureMembersSection() {
  const [selectedLeaderId, setSelectedLeaderId] = useState(LEADERSHIP[0].id);
  const networkCanvasRef = useRef(null);

  // Chapter 06 — Core Team Photo Cinematic Left + Right -> Center Reveal
  const coreTeamImgRef = useRef(null);
  const coreTeamFrameRef = useRef(null);
  const leftGlowRef = useRef(null);
  const rightGlowRef = useRef(null);
  const coreRevealRafRef = useRef(null);
  const coreRevealProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const coreRevealStartedRef = useRef(false);
  const coreRevealCompletedRef = useRef(false);

  const selectedLeader = LEADERSHIP.find(l => l.id === selectedLeaderId) || LEADERSHIP[0];

  // Cinematic Left + Right -> Center photo reveal
  const applyCoreRevealFrame = useCallback((progress) => {
    const img = coreTeamImgRef.current;
    const leftGlow = leftGlowRef.current;
    const rightGlow = rightGlowRef.current;
    if (!img) return;

    if (progress <= 0) {
      const mask = 'linear-gradient(to right, transparent 0%, transparent 100%)';
      img.style.webkitMaskImage = mask;
      img.style.maskImage = mask;
      img.style.opacity = '1';
      img.style.transform = 'scale(1.018)';
      if (leftGlow) leftGlow.style.opacity = '0';
      if (rightGlow) rightGlow.style.opacity = '0';
      return;
    }

    if (progress >= 0.985) {
      // Seamless complete reveal — zero split, zero seam
      const finalMask = 'linear-gradient(to right, black 0%, black 100%)';
      img.style.webkitMaskImage = finalMask;
      img.style.maskImage = finalMask;
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
      img.style.filter = 'brightness(1) contrast(1.05)';
      img.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      if (leftGlow) {
        leftGlow.style.opacity = '0';
        leftGlow.style.transition = 'opacity 0.4s ease';
      }
      if (rightGlow) {
        rightGlow.style.opacity = '0';
        rightGlow.style.transition = 'opacity 0.4s ease';
      }
      return;
    }

    // Eased progress (cubic smooth in-out)
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    // Reach moves from 0% at outer edges toward 51% in the center
    const reach = eased * 51;
    const feather = 8.5;

    const leftSolid = Math.max(0, reach - feather).toFixed(2);
    const leftFade = Math.min(50, reach + feather).toFixed(2);
    const rightFade = Math.max(50, 100 - (reach + feather)).toFixed(2);
    const rightSolid = Math.min(100, 100 - (reach - feather)).toFixed(2);

    // Left revealed -> feather -> dark center -> feather -> Right revealed
    const mask = `linear-gradient(to right, black 0%, black ${leftSolid}%, transparent ${leftFade}%, transparent ${rightFade}%, black ${rightSolid}%, black 100%)`;

    img.style.webkitMaskImage = mask;
    img.style.maskImage = mask;
    img.style.opacity = '1';

    // Cinematic camera push settle and lighting
    const scale = (1.018 - eased * 0.018).toFixed(4);
    const brightness = (0.90 + eased * 0.10).toFixed(3);
    const contrast = (1.07 - eased * 0.02).toFixed(3);
    img.style.transform = `scale(${scale})`;
    img.style.filter = `brightness(${brightness}) contrast(${contrast})`;

    // Subtle crimson scanning filaments at the leading edges
    const glowOpacity = Math.sin(progress * Math.PI) * 0.55;
    if (leftGlow) {
      leftGlow.style.opacity = glowOpacity.toFixed(2);
      leftGlow.style.left = `${Math.min(50, reach).toFixed(2)}%`;
    }
    if (rightGlow) {
      rightGlow.style.opacity = glowOpacity.toFixed(2);
      rightGlow.style.right = `${Math.min(50, reach).toFixed(2)}%`;
    }
  }, []);

  useEffect(() => {
    const frame = coreTeamFrameRef.current;
    const img = coreTeamImgRef.current;
    if (!frame || !img) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      coreRevealCompletedRef.current = true;
      applyCoreRevealFrame(1);
      return;
    }

    // Start completely hidden in darkness
    applyCoreRevealFrame(0);

    const updateScrollProgress = () => {
      if (coreRevealCompletedRef.current) return;
      const rect = frame.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Start when top enters at 90% of viewport height
      // Target 100% when center reaches 50% of viewport height
      const startTrigger = windowHeight * 0.90;
      const endTrigger = windowHeight * 0.50;

      if (rect.top <= startTrigger) {
        const raw = (startTrigger - rect.top) / (startTrigger - endTrigger);
        const clamped = Math.max(0, Math.min(1, raw));
        if (clamped > targetProgressRef.current) {
          targetProgressRef.current = clamped;
        }
        if (!coreRevealStartedRef.current && clamped > 0.01) {
          coreRevealStartedRef.current = true;
        }
      }
    };

    const runLoop = () => {
      if (coreRevealCompletedRef.current) return;

      if (coreRevealStartedRef.current) {
        const diff = targetProgressRef.current - coreRevealProgressRef.current;
        // Glide smoothly with user scroll or smooth forward pace
        const forwardStep = Math.max(diff * 0.14, 0.007);
        coreRevealProgressRef.current = Math.min(1, coreRevealProgressRef.current + forwardStep);

        applyCoreRevealFrame(coreRevealProgressRef.current);

        if (coreRevealProgressRef.current >= 0.985) {
          coreRevealProgressRef.current = 1;
          coreRevealCompletedRef.current = true;
          applyCoreRevealFrame(1);
          window.removeEventListener('scroll', updateScrollProgress);
          window.removeEventListener('resize', updateScrollProgress);
          return;
        }
      }

      coreRevealRafRef.current = requestAnimationFrame(runLoop);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateScrollProgress();
            if (!coreRevealStartedRef.current) {
              coreRevealStartedRef.current = true;
              targetProgressRef.current = Math.max(targetProgressRef.current, 0.2);
            }
          }
        });
      },
      { threshold: [0, 0.1, 0.25, 0.5] }
    );

    observer.observe(frame);
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });

    updateScrollProgress();
    coreRevealRafRef.current = requestAnimationFrame(runLoop);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
      if (coreRevealRafRef.current) cancelAnimationFrame(coreRevealRafRef.current);
    };
  }, [applyCoreRevealFrame]);

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

          {/* Chapter 06 — Core Team Cinematic Photo Reveal (Left + Right -> Center) */}
          <div
            ref={coreTeamFrameRef}
            className="core-team-group-frame"
            data-cursor="image"
            tabIndex={0}
            aria-label="GWD Core Team photograph"
          >
            <div className="group-photo-viewport">
              <img
                ref={coreTeamImgRef}
                src="/photos/core-team.png"
                alt="GWD Club Core Team — all 9 members"
                className="core-team-photo"
                loading="eager"
                decoding="async"
              />
              <div ref={leftGlowRef} className="reveal-light-bar left" aria-hidden="true" />
              <div ref={rightGlowRef} className="reveal-light-bar right" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* 07 — THE MEMBERS (The Digital Archive) */}
      <div id="members" className="members-archive-stage">
        <div className="section-container">
          <header className="members-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 07</span>
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
