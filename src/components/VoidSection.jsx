import React from 'react';
import '../styles/void.css';

/**
 * VoidSection — Chapter 00: The Void
 * 
 * Semantic narrative anchor for Chapter 00.
 * The visual 3D particle wordmark ("GWD", "CLUB", "GET WORK DONE"),
 * ignition flash, orbit satellite, and tagline are handled by the
 * WebGL cinematic engine in BackgroundWorld.
 * 
 * Accessible headings and metadata remain fully preserved for SEO and screen-readers.
 */
export default function VoidSection({ onEnter }) {
  return (
    <section id="void" className="void-section" aria-label="Chapter 00: The Void">
      {/* Screen-reader and accessible DOM content for SEO and semantics */}
      <div className="sr-only">
        <h1>GWD CLUB</h1>
        <p>GET WORK DONE</p>
        <p>EVERY STORY HAS A BEGINNING.</p>
        <button type="button" onClick={onEnter}>
          SCROLL TO ENTER
        </button>
      </div>

      {/* Invisible clickable trigger area for user interaction */}
      <div
        className="void-interactive-layer"
        onClick={onEnter}
        role="button"
        tabIndex={0}
        aria-label="Enter the GWD Journey"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEnter();
          }
        }}
      />
    </section>
  );
}
