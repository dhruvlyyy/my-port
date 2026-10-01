(() => {
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let motionOff = motionQuery.matches;
  const toggle = document.getElementById('motion-toggle');
  const setMotion = value => {
    motionOff = value;
    document.body.classList.toggle('motion-off', motionOff);
    toggle.setAttribute('aria-pressed', String(motionOff));
    toggle.setAttribute('aria-label', motionOff ? 'Enable animated journey' : 'Disable animated journey');
    document.getElementById('motion-state').textContent = motionOff ? 'off' : 'on';
    window.dispatchEvent(new CustomEvent('journeymotion', { detail: { disabled: motionOff } }));
  };
  setMotion(motionOff);
  toggle.addEventListener('click', () => setMotion(!motionOff));
  motionQuery.addEventListener('change', e => setMotion(e.matches));
  document.getElementById('year').textContent = new Date().getFullYear();

  const chapters = [...document.querySelectorAll('.chapter')];
  const links = [...document.querySelectorAll('.journey-nav a')];
  let scheduled = false;
  function updateReading() {
    scheduled = false;
    document.querySelector('.site-header').classList.toggle('scrolled', scrollY > 35);
    const max = document.documentElement.scrollHeight - innerHeight;
    document.getElementById('progress').style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
    let active = chapters[0];
    for (const chapter of chapters) if (chapter.getBoundingClientRect().top <= innerHeight * .48) active = chapter;
    document.getElementById('chapter-label').textContent = active.dataset.chapter;
    for (const link of links) {
      const current = link.hash === `#${active.id}`;
      link.classList.toggle('current', current);
      if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    }
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); } }, { passive: true });
  addEventListener('resize', updateReading);
  updateReading();

  const tabs = [...document.querySelectorAll('[role=tab]')];
  function selectTab(tab, focus = false) {
    for (const candidate of tabs) {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      document.getElementById(candidate.getAttribute('aria-controls')).hidden = !selected;
    }
    if (focus) tab.focus();
    window.dispatchEvent(new CustomEvent('journeyapp', { detail: { app: tab.dataset.app } }));
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      const index = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (index !== null) { e.preventDefault(); selectTab(tabs[index], true); }
    });
  });
})();
