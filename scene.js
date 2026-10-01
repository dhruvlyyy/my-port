import * as THREE from './vendor/three.module.min.js';

// Everything here is real geometry. The tube curve also defines the camera journey.
const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch {
  document.body.classList.add('scene-unavailable');
}
if (renderer) init();

function init() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, .015, 150);
  const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
  const materials = {
    rubber: new THREE.MeshPhysicalMaterial({ color: '#591320', roughness: .29, metalness: .06, clearcoat: .45, clearcoatRoughness: .3, side: THREE.DoubleSide }),
    steel: new THREE.MeshStandardMaterial({ color: '#d5d0c7', roughness: .21, metalness: 1 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#eeece6', roughness: .12, metalness: 1 }),
    titanium: new THREE.MeshStandardMaterial({ color: '#766e60', roughness: .3, metalness: .96 }),
    porcelain: new THREE.MeshPhysicalMaterial({ color: '#ece4d5', roughness: .23, metalness: .1, clearcoat: .8 }),
    black: new THREE.MeshStandardMaterial({ color: '#252320', roughness: .55, metalness: .05 }),
    brass: new THREE.MeshStandardMaterial({ color: '#a18352', roughness: .26, metalness: .95 }),
    diaphragm: new THREE.MeshStandardMaterial({ color: '#a8a49b', roughness: .38, metalness: .92 }),
    signal: new THREE.MeshBasicMaterial({ color: '#c18b60', transparent: true, opacity: .65 }),
  };
  // A local studio environment produces reflections without a remote HDR texture.
  const studio = new THREE.Scene();
  studio.background = new THREE.Color('#bcb3a4');
  function softbox(x, y, z, width, height, intensity) {
    const box = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(intensity), side: THREE.DoubleSide }));
    box.position.set(x, y, z); box.lookAt(0, 0, 0); studio.add(box);
  }
  softbox(-7, 5, 4, 5, 12, 4); softbox(6, 2, -4, 4, 12, 2.8);
  softbox(0, 8, 1, 10, 5, 2.2); softbox(4, -2, 6, 2, 9, 1.2);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .08, .1, 50);
  scene.environment = environment.texture;
  pmrem.dispose();
  studio.traverse(object => { object.geometry?.dispose(); if (object.material) object.material.dispose(); });
  scene.add(new THREE.HemisphereLight('#fff5e3', '#675747', 2));
  const key = new THREE.DirectionalLight('#fff4df', 4.5);
  key.position.set(-8, 14, 14); scene.add(key);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -15, right: 15, top: 12, bottom: -22, near: .1, far: 70 });
  key.shadow.bias = -.0008; key.shadow.normalBias = .05;
  const rim = new THREE.DirectionalLight('#ffffff', 2.4); rim.position.set(8, 3, -7); scene.add(rim);
  const fill = new THREE.DirectionalLight('#c6a187', 1.2); fill.position.set(2, -9, 8); scene.add(fill);
  const sculpture = new THREE.Group(); scene.add(sculpture);
  function mesh(geometry, material, parent = sculpture) {
    const object = new THREE.Mesh(geometry, material);
    object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
  }
  function sphere(position, radius, material, parent, scale) {
    const object = mesh(new THREE.SphereGeometry(radius, 20, 14), material, parent);
    object.position.copy(position); if (scale) object.scale.copy(scale); return object;
  }
  function cylinder(a, b, radius, material, parent = sculpture, topRadius = radius) {
    const delta = b.clone().sub(a);
    const object = mesh(new THREE.CylinderGeometry(topRadius, radius, delta.length(), 24), material, parent);
    object.position.copy(a).add(b).multiplyScalar(.5);
    object.quaternion.setFromUnitVectors(V(0, 1), delta.normalize()); return object;
  }
  function tube(points, radius, material, parent = sculpture, segments = 90) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => Array.isArray(p) ? V(...p) : p), false, 'centripetal');
    const object = mesh(new THREE.TubeGeometry(curve, segments, radius, 16, false), material, parent);
    return { object, curve };
  }
  function torus(radius, thickness, material, position, parent = sculpture) {
    const object = mesh(new THREE.TorusGeometry(radius, thickness, 12, 48), material, parent);
    object.position.copy(position); return object;
  }
  // Two connected binaural arms, a rubber Y, and a continuous coiled main tube.
  const leftEar = [[-1.12, 5.8, .1], [-1.9, 5.45, .2], [-2.45, 4.7, .15], [-2.3, 3.4, 0], [-1.25, 2.05, 0]];
  const rightEar = [[1.05, 5.9, .1], [1.7, 6.35, .15], [2.3, 6, 0], [2.65, 4.9, -.1], [2.3, 3.5, 0], [1.05, 2.05, 0]];
  tube(leftEar, .105, materials.chrome); tube(rightEar, .105, materials.chrome);
  sphere(V(-1.12, 5.8, .1), .22, materials.black, sculpture, V(1.5, .75, 1));
  sphere(V(1.05, 5.9, .1), .22, materials.black, sculpture, V(1.5, .75, 1));
  tube([[-1.4, 2.3, 0], [-1, 1.4, .1], [0, .8, .2]], .19, materials.rubber);
  tube([[1.2, 2.3, 0], [.9, 1.4, .1], [0, .8, .2]], .19, materials.rubber);
  sphere(V(0, .8, .2), .235, materials.rubber, sculpture);
  cylinder(V(-1.5, 2.43, 0), V(-1.3, 2.18, 0), .135, materials.steel);
  cylinder(V(1.33, 2.43, 0), V(1.13, 2.18, 0), .135, materials.steel);
  const { curve: thread } = tube([
    [0, .8, .2], [-.7, -.9, .6], [-2.7, -3.1, .8], [-3.45, -5.9, .1],
    [-2.6, -8.25, -.2], [-.5, -8.9, .15], [2, -8.15, 1.1], [3.45, -6.15, .7],
    [3.1, -4.15, -.6], [1.3, -3.45, -.7], [.1, -4.7, -.1], [.9, -7.2, 1], [3.6, -9.5, 1.3],
  ], .18, materials.rubber, sculpture, 240);

  // Turned metal chestpiece with a recessed diaphragm, rim and engraved rings.
  const chestpiece = new THREE.Group(); sculpture.add(chestpiece);
  chestpiece.position.copy(thread.getPoint(1)); chestpiece.rotation.set(.32, -.28, -.28);
  const profile = [V(0, -.28), V(.32, -.28), V(.37, -.2), V(.58, -.15), V(.77, -.04), V(.84, .05), V(.84, .13), V(.79, .19), V(.69, .16), V(.65, .12), V(0, .12)];
  mesh(new THREE.LatheGeometry(profile.map(v => new THREE.Vector2(v.x, v.y)), 64), materials.chrome, chestpiece).rotation.x = Math.PI / 2;
  const diaphragm = mesh(new THREE.CylinderGeometry(.7, .7, .035, 64), materials.diaphragm, chestpiece);
  diaphragm.rotation.x = Math.PI / 2; diaphragm.position.z = -.15;
  torus(.75, .038, materials.black, V(0, 0, -.17), chestpiece);
  torus(.64, .013, materials.chrome, V(0, 0, -.19), chestpiece);
  for (let i = 0; i < 5; i++) torus(.3 + i * .058, .0025, materials.steel, V(0, 0, -.175), chestpiece);
  sphere(V(0, 0, -.18), .045, materials.titanium, chestpiece, V(1, 1, .3));
  cylinder(V(0, -.7, 0), V(0, -1.05, 0), .15, materials.steel, chestpiece);

  // Articulated mechanical hand. Ivory shells sit over dark frames and metal joints.
  const hand = new THREE.Group(); hand.position.set(5.05, -12.25, -.15);
  hand.rotation.set(-.12, -.3, -.23); sculpture.add(hand);
  function shell(width, height, depth, material, position, parent = hand) {
    const object = mesh(new THREE.BoxGeometry(width, height, depth, 1, 1, 1), material, parent);
    // Rounded-box silhouette from a bevelled extruded shape.
    object.geometry.dispose();
    const radius = Math.min(width, height) * .16;
    const shape = new THREE.Shape();
    const x = -width / 2, y = -height / 2;
    shape.moveTo(x + radius, y); shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius); shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius); shape.quadraticCurveTo(x, y, x + radius, y);
    object.geometry = new THREE.ExtrudeGeometry(shape, { depth: depth - .08, bevelEnabled: true, bevelSize: .04, bevelThickness: .04, bevelSegments: 2, steps: 1, curveSegments: 5 });
    object.geometry.translate(0, 0, -depth / 2 + .04); object.position.copy(position); return object;
  }
  shell(2.28, 2.5, .72, materials.titanium, V(0, 0));
  shell(1.95, 2.05, .14, materials.porcelain, V(0, -.08, .47));
  shell(.35, 1.5, .05, materials.rubber, V(.55, -.1, .56));
  shell(1.85, 1.8, .1, materials.porcelain, V(0, -.12, -.44));
  // Palm seams and visible fasteners.
  cylinder(V(-.86, -.8, .56), V(-.86, .7, .56), .012, materials.brass, hand);
  for (const x of [-.79, .79]) for (const y of [-.85, .78]) {
    const screw = torus(.06, .014, materials.chrome, V(x, y, .57), hand);
    cylinder(V(x - .025, y, .58), V(x + .025, y, .58), .009, materials.black, hand);
  }
  function joint(point, radius, parent) {
    sphere(point, radius, materials.black, parent);
    const pivot = cylinder(point.clone().add(V(-radius - .035, 0, 0)), point.clone().add(V(radius + .035, 0, 0)), radius * .72, materials.titanium, parent);
    for (const sign of [-1, 1]) {
      const ring = torus(radius * .57, .024, materials.brass, point.clone().add(V(sign * (radius + .04), 0, 0)), parent);
      ring.rotation.y = Math.PI / 2;
      const cap = cylinder(point.clone().add(V(sign * (radius + .04), 0, 0)), point.clone().add(V(sign * (radius + .06), 0, 0)), radius * .34, materials.chrome, parent);
    }
    return pivot;
  }
  function finger(points, width) {
    const group = new THREE.Group(); hand.add(group);
    const vectors = points.map(p => V(...p));
    vectors.forEach((p, i) => { if (i < vectors.length - 1) joint(p, width * .58, group); });
    for (let i = 0; i < vectors.length - 1; i++) {
      const a = vectors[i], b = vectors[i + 1], direction = b.clone().sub(a).normalize();
      cylinder(a, b, width * .29, materials.titanium, group);
      const center = a.clone().lerp(b, .52), length = a.distanceTo(b) * .72;
      const plate = shell(width, length, width * .66, materials.porcelain, center, group);
      plate.quaternion.setFromUnitVectors(V(0, 1), direction);
      const tendonA = a.clone().add(V(0, 0, -.12)), tendonB = b.clone().add(V(0, 0, -.12));
      cylinder(tendonA, tendonB, .026, materials.brass, group);
    }
    sphere(vectors.at(-1), width * .42, materials.porcelain, group, V(1, 1.3, .8));
    return group;
  }
  const fingers = [];
  for (let i = 0; i < 4; i++) {
    const x = -.86 + i * .57, length = [1.05, 1.2, 1.09, .8][i];
    fingers.push(finger([[x, 1.12, .02], [x, 1.12 + length, .28], [x, 1.55 + length, 1.05], [x, 1.15 + length, 1.68]], .43 - i * .012));
  }
  finger([[-1.05, -.35, .05], [-1.75, .25, .5], [-1.88, 1.07, 1.08], [-1.35, 1.7, 1.45]], .57);
  // Wrist bearing, cuff, split forearm armour, and exposed hydraulic tendons.
  joint(V(0, -1.66, 0), .6, hand);
  cylinder(V(0, -1.5, 0), V(0, -2.85, -.1), .65, materials.titanium, hand);
  const wristRing = torus(.67, .065, materials.chrome, V(0, -2.42, -.08), hand); wristRing.rotation.x = Math.PI / 2;
  shell(1.67, 3.55, .78, materials.porcelain, V(0, -4.15, .14));
  shell(.45, 2.62, .06, materials.rubber, V(.4, -4.15, .6));
  for (const x of [-.82, .82]) cylinder(V(x, -2.6, .08), V(x * .87, -5.85, .04), .07, materials.chrome, hand);
  for (let i = 0; i < 4; i++) shell(.42, .035, .03, materials.titanium, V(-.32, -4.8 - i * .16, .56));
  const handLight = new THREE.PointLight('#e6b392', 2, 9); handLight.position.set(2, -9, 4); scene.add(handLight);

  const floor = mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ color: '#6b5137', opacity: .12 }), scene);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -18.8; floor.castShadow = false;
  // Fine AI orbit lines belong to the hand and quietly echo its mechanical joints.
  const network = new THREE.Group(); network.position.set(4, -10.6, -.8); sculpture.add(network);
  const lineMaterial = new THREE.LineBasicMaterial({ color: '#8c7760', transparent: true, opacity: .25 });
  for (let ring = 0; ring < 3; ring++) {
    const points = [];
    for (let i = 0; i <= 100; i++) { const angle = i / 100 * Math.PI * 2; points.push(V(Math.cos(angle) * (3 + ring * .45), Math.sin(angle) * (1.25 + ring * .3), Math.sin(angle) * .8)); }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial); line.rotation.z = -.45 + ring * .27; network.add(line);
    for (let i = 0; i < 3; i++) sphere(points[12 + i * 28], .035, materials.brass, network);
  }
  const stops = [.2, .48, .76];
  const stationRings = stops.map(t => {
    const point = thread.getPointAt(t);
    const ring = torus(.24, .013, materials.brass, point);
    ring.quaternion.setFromUnitVectors(V(0, 0, 1), thread.getTangentAt(t));
    return ring;
  });
  // Subtle energy thread follows the tube instead of a generic particle field.
  const signal = sphere(thread.getPointAt(0), .045, materials.signal, sculpture);

  let disabled = document.body.classList.contains('motion-off');
  let mobile = innerWidth <= 650;
  let keys = [], raf = 0, dirty = true, visible = true, lastTime = 0;
  let pointerX = 0, pointerY = 0, currentScroll = scrollY;
  const ids = ['home', 'articles', 'article-1', 'article-2', 'article-3', 'work', 'about'];
  function exterior(t, distance = 10) {
    const p = thread.getPointAt(t);
    return { position: p.clone().add(V(mobile ? 0 : 1.7, mobile ? 3 : 1.2, distance)), target: p.clone().add(V(mobile ? -.2 : -3.1, mobile ? 2.4 : .1, 0)) };
  }
  function heroPose() {
    return mobile ? { position: V(.5, 3.4, 28), target: V(1.3, 6.2, 0) } : { position: V(1.2, 1.7, 26.5), target: V(-5.1, -3.8, 0) };
  }
  function handPose() {
    return mobile ? { position: V(6, -8, 18), target: V(4.6, -7.8, .2) } : { position: V(10, -9.7, 18), target: V(.4, -12.1, .4) };
  }
  function measure() {
    mobile = innerWidth <= 650;
    camera.aspect = innerWidth / innerHeight; camera.fov = mobile ? 46 : 40; camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.3 : 1.6)); renderer.setSize(innerWidth, innerHeight);
    keys = ids.map(id => { const el = document.getElementById(id); return { id, top: el.getBoundingClientRect().top + scrollY }; });
    dirty = true; schedule();
  }
  const smooth = t => t * t * (3 - 2 * t);
  function blend(a, b, t) { return { position: a.position.clone().lerp(b.position, t), target: a.target.clone().lerp(b.target, t) }; }
  function poseAt(y) {
    const articleY = keys.slice(2, 5).map(k => k.top + innerHeight * .13);
    const workY = keys[5].top + innerHeight * .13;
    if (disabled) return y < workY - innerHeight * .5 ? heroPose() : handPose();
    if (y <= articleY[0]) return blend(heroPose(), exterior(stops[0], mobile ? 15 : 11.8), smooth(Math.max(0, y / articleY[0])));
    for (let i = 0; i < 2; i++) {
      if (y < articleY[i + 1]) {
        const range = articleY[i + 1] - articleY[i];
        const progress = Math.min(1, Math.max(0, (y - articleY[i] - range * .38) / (range * .62)));
        const travel = smooth(progress), t = THREE.MathUtils.lerp(stops[i], stops[i + 1], travel);
        const outside = exterior(t, mobile ? 15 : 10.8);
        // On desktop the camera enters the actual tube lumen between reading stops.
        if (!mobile && progress > .12 && progress < .88) {
          const immersion = Math.sin((progress - .12) / .76 * Math.PI) ** 4 * .97;
          const point = thread.getPointAt(t), ahead = thread.getPointAt(Math.min(t + .018, 1));
          return blend(outside, { position: point.clone().add(V(0, 0, .025)), target: ahead }, immersion);
        }
        return outside;
      }
    }
    const p = smooth(Math.min(1, Math.max(0, (y - articleY[2] - innerHeight * .38) / (workY - articleY[2] - innerHeight * .38))));
    return blend(exterior(stops[2], mobile ? 15 : 10.8), handPose(), p);
  }
  function render(time) {
    raf = 0;
    if (!visible) return;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, .1) : .016; lastTime = time;
    currentScroll = disabled ? scrollY : THREE.MathUtils.lerp(currentScroll, scrollY, 1 - Math.exp(-dt * 9));
    const pose = poseAt(currentScroll);
    // Pointer movement adds restrained depth without changing the path or hijacking scroll.
    if (!disabled && !mobile) pose.position.add(V(pointerX * .2, pointerY * .12, 0));
    camera.position.copy(pose.position); camera.lookAt(pose.target);
    network.rotation.y = disabled ? 0 : Math.sin(time * .00014) * .09;
    signal.visible = !disabled;
    if (!disabled) signal.position.copy(thread.getPointAt((time * .000035) % 1));
    const workAmount = Math.min(1, Math.max(0, (currentScroll - keys[5].top + innerHeight) / innerHeight));
    handLight.intensity = 1.3 + workAmount * 1.6;
    const afterAbout = currentScroll > keys[6].top + innerHeight * .7;
    if (!afterAbout || dirty) renderer.render(scene, camera);
    dirty = false;
    if ((!disabled && !afterAbout) || Math.abs(currentScroll - scrollY) > .5) schedule();
  }
  function schedule() { if (!raf && visible) raf = requestAnimationFrame(render); }
  addEventListener('scroll', () => { dirty = true; schedule(); }, { passive: true });
  addEventListener('resize', measure);
  addEventListener('pointermove', e => { pointerX = e.clientX / innerWidth - .5; pointerY = e.clientY / innerHeight - .5; if (!disabled) schedule(); }, { passive: true });
  addEventListener('journeymotion', e => { disabled = e.detail.disabled; currentScroll = scrollY; dirty = true; schedule(); });
  addEventListener('journeyapp', e => {
    // Switching apps subtly changes the hand's stance.
    hand.rotation.z = e.detail.app === 'tetris' ? -.13 : -.23;
    dirty = true; schedule();
  });
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; lastTime = 0; if (visible) { dirty = true; schedule(); } else if (raf) { cancelAnimationFrame(raf); raf = 0; } });
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); visible = false; if (raf) cancelAnimationFrame(raf); document.body.classList.remove('scene-ready'); });
  canvas.addEventListener('webglcontextrestored', () => { visible = true; dirty = true; schedule(); document.body.classList.add('scene-ready'); });
  measure();
  document.body.classList.add('scene-ready');
}
