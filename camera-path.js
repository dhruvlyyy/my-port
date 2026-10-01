// Product-view camera poses keep real model coordinates consistent on every viewport.
export function chapterPose(id, mobile = false) {
  const poses = {
    home: { target: [.45, -.80, .15], position: [4.05, 1.25, 15.9], rotation: -.08 },
    articles: { target: [.1, .9, .05], position: [2.7, 2.1, 12.4], rotation: .06 },
    'article-1': { target: [-.2, 1.65, .1], position: [2.3, 2.55, 9.6], rotation: .12 },
    'article-2': { target: [-.25, -.85, .1], position: [2.45, -.1, 8.4], rotation: -.07 },
    'article-3': { target: [1.22, -1.95, .15], position: [3.25, -1.1, 8.15], rotation: .08 },
    work: { target: [1.92, -3.45, .18], position: [4.35, -2.70, 7.7], rotation: -.06 },
    about: { target: [1.92, -3.45, .18], position: [4.35, -2.70, 7.7], rotation: -.06 },
  };
  const p = poses[id] || poses.home;
  return { target: [...p.target], position: mobile ? [p.target[0] + 2, p.target[1] + 1.0, p.position[2] * 1.04] : [...p.position], rotation: p.rotation };
}
export function interpolatePose(a, b, progress) {
  const t = progress * progress * (3 - 2 * progress);
  return { target: a.target.map((v, i) => v + (b.target[i] - v) * t), position: a.position.map((v, i) => v + (b.position[i] - v) * t), rotation: a.rotation + (b.rotation - a.rotation) * t };
}
