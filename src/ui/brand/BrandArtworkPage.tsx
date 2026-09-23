'use client';

import { useEffect, useState } from 'react';
import { BRANDS } from '@/lib/brand/brands';
import {
  HEROES,
  TEXTURES,
  OG_CARD,
  SAMPLE_ISSUES,
  ISSUE_IMAGES,
  resolveHero,
  resolveLoop,
  resolveIssueImage,
} from '@/lib/brand/artwork';
import { LOGO_CONCEPTS } from '@/lib/brand/logo-concepts';
import { MarkIcon } from '@/ui/brand/MarkIcon';

function BrandArtworkPage() {
  const [heroByDirection, setHeroByDirection] = useState<Record<string, string>>({});
  const [loopByDirection, setLoopByDirection] = useState<Record<string, boolean>>({});
  const [issueImages, setIssueImages] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const hero: Record<string, string> = {};
      const loop: Record<string, boolean> = {};
      for (const direction of BRANDS) {
        hero[direction.id] = resolveHero(direction.id, localStorage.getItem(`hero:${direction.id}`));
        loop[direction.id] = resolveLoop(localStorage.getItem(`loop:${direction.id}`));
      }
      setHeroByDirection(hero);
      setLoopByDirection(loop);
      const issues: Record<string, string> = {};
      for (const issue of SAMPLE_ISSUES) {
        issues[issue.slug] = resolveIssueImage(issue.slug, localStorage.getItem(`issue:${issue.slug}`));
      }
      setIssueImages(issues);
    } catch {}
  }, []);

  function applyHero(directionId: string, heroId: string) {
    try {
      localStorage.setItem(`hero:${directionId}`, heroId);
    } catch {}
    setHeroByDirection((prev) => ({ ...prev, [directionId]: heroId }));
  }

  function toggleLoop(directionId: string) {
    const next = !(loopByDirection[directionId] ?? true);
    try {
      localStorage.setItem(`loop:${directionId}`, next ? '1' : '0');
    } catch {}
    setLoopByDirection((prev) => ({ ...prev, [directionId]: next }));
  }

  function applyIssueImage(slug: string, optionId: string) {
    try {
      localStorage.setItem(`issue:${slug}`, optionId);
    } catch {}
    setIssueImages((prev) => ({ ...prev, [slug]: optionId }));
  }

  return (
    <div className="wrap brand-compare-body">
      <h1>Artwork comparison</h1>
      <p className="lead">
        Internal only — placeholders standing in for real generated imagery and video, so the picker and state model
        can be judged before the real programme exists.
      </p>

      <section className="brand-compare-section">
        <h2>Heroes</h2>
        {BRANDS.map((direction) => (
          <div key={direction.id} className="artwork-direction-group">
            <p className="eyebrow">{direction.label}</p>
            <div className="artwork-grid">
              {HEROES[direction.id]?.map((option) => (
                <div className="artwork-card" key={option.id}>
                  <div className="artwork-swatch" style={{ background: option.swatch }} />
                  <div className="artwork-card-footer">
                    <span>{option.label}</span>
                    <button
                      type="button"
                      className="button button-dark"
                      aria-pressed={heroByDirection[direction.id] === option.id}
                      onClick={() => applyHero(direction.id, option.id)}
                    >
                      {heroByDirection[direction.id] === option.id ? 'In use' : 'Use as hero'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="brand-compare-section">
        <h2>Video loops</h2>
        <div className="artwork-grid">
          {BRANDS.map((direction) => (
            <div className="artwork-card" key={direction.id}>
              <div
                className="artwork-swatch artwork-loop"
                data-loop={loopByDirection[direction.id] ?? true ? 'on' : 'off'}
                style={{ background: HEROES[direction.id]?.[0]?.swatch }}
              />
              <div className="artwork-card-footer">
                <span>{direction.label} — 8s loop</span>
                <button type="button" className="button button-dark" onClick={() => toggleLoop(direction.id)}>
                  {(loopByDirection[direction.id] ?? true) ? 'Loop on' : 'Loop off'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-compare-section">
        <h2>Issue images</h2>
        {SAMPLE_ISSUES.map((issue) => (
          <div key={issue.slug} className="artwork-direction-group">
            <p className="eyebrow">{issue.label}</p>
            <div className="artwork-grid">
              {ISSUE_IMAGES[issue.slug]?.map((option) => (
                <div className="artwork-card" key={option.id}>
                  <div className="artwork-swatch" style={{ background: option.swatch }} />
                  <div className="artwork-card-footer">
                    <span>{option.label}</span>
                    <button
                      type="button"
                      className="button button-dark"
                      aria-pressed={issueImages[issue.slug] === option.id}
                      onClick={() => applyIssueImage(issue.slug, option.id)}
                    >
                      {issueImages[issue.slug] === option.id ? 'In use' : 'Use as hero'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="form-note">
          Reference only — the live Insights list has no image slot in its current design, so this pick isn&rsquo;t
          rendered on the public site yet.
        </p>
      </section>

      <section className="brand-compare-section">
        <h2>Logos</h2>
        <div className="logo-grid">
          {LOGO_CONCEPTS.map((concept) => (
            <div className={`logo-card logo-card-${concept.layout}`} key={concept.id}>
              <MarkIcon mark={concept.mark} size={40} />
              <span className="logo-card-wordmark">Intergenerational Justice Fund</span>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-compare-section">
        <h2>Textures</h2>
        <div className="artwork-grid">
          {TEXTURES.map((texture) => (
            <div className="artwork-card" key={texture.id}>
              <div className="artwork-swatch" style={{ background: texture.swatch }} />
              <div className="artwork-card-footer">
                <span>{texture.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-compare-section">
        <h2>Social card (OG)</h2>
        <div className="artwork-grid">
          <div className="artwork-card">
            <div className="artwork-swatch artwork-og" style={{ background: OG_CARD.swatch }} />
            <div className="artwork-card-footer">
              <span>{OG_CARD.label}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PreviewPage() {
  if (process.env.NEXT_PUBLIC_BRAND_CHOOSER !== 'true') return null;
  return <BrandArtworkPage />;
}
