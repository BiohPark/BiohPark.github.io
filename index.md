---
layout: home
title: Bioh Park
---

# 👋 Welcome

여기는 Bioh Park의 실험실입니다. 만든 것들을 여기에 하나씩 올립니다.

## Projects

<div class="project-grid">
  <a class="project-card" href="/pages/playground">
    <span class="project-card__eyebrow">Sandbox</span>
    <strong>Playground</strong>
    <p>이것저것 실험하는 공간.</p>
  </a>
  <a class="project-card" href="/pages/about">
    <span class="project-card__eyebrow">Profile</span>
    <strong>About</strong>
    <p>소개.</p>
  </a>
</div>

<style>
.project-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); margin: 2rem 0; }
.project-card { display: block; padding: 1.25rem; border: 1px solid #d8d8d8; border-radius: 8px; text-decoration: none; color: inherit; transition: border-color .15s ease, transform .15s ease; }
.project-card:hover { border-color: #888; transform: translateY(-2px); }
.project-card__eyebrow { display: block; font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; opacity: .6; }
.project-card strong { display: block; margin: .35rem 0 .5rem; font-size: 1.1rem; }
.project-card p { margin: 0; font-size: .9rem; opacity: .75; }
@media (prefers-color-scheme: dark) {
  .project-card { border-color: #3a3a3a; }
  .project-card:hover { border-color: #777; }
}
</style>
