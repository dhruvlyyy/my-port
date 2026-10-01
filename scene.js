import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { chapterPose, interpolatePose } from './camera-path.js';

const canvas = document.getElementById('scene');
const stage = document.getElementById('stage');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
catch { document.body.classList.add('scene-unavailable'); }
if (renderer) start().catch(error => {
  document.body.classList.remove('scene-ready');
  document.body.classList.add('scene-unavailable');
  console.error('The model could not be displayed:', error);
});

async function start() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 80);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const studio = new THREE.Scene();
  studio.background = new THREE.Color('#9f998e');
  function softbox(position, width, height, strength) {
    const box = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(strength), side: THREE.DoubleSide }));
    box.position.fromArray(position); box.lookAt(0, 0, 0); studio.add(box);
  }
  softbox([-4, 4, 6], 4, 8, 4); softbox([5, 1, 3], 1.6, 7, 3); softbox([0, 3, -5], 5, 5, 2.2);
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromScene(studio, .035, .1, 60);
  scene.environment = environment.texture; generator.dispose();
  studio.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
  scene.add(new THREE.HemisphereLight('#fff1d9', '#7f6b53', 1.5));
  const key = new THREE.DirectionalLight('#fff4e4', 3.2);
  key.position.set(-5, 7, 7); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -7, near: .1, far: 30 });
  key.shadow.normalBias = .025; scene.add(key);
  const rim = new THREE.DirectionalLight('#e4e9ff', 2.2); rim.position.set(4, 4, -5); scene.add(rim);
  const fill = new THREE.DirectionalLight('#fff0dc', .8); fill.position.set(3, -3, 5); scene.add(fill);
  const sculpture = new THREE.Group(); scene.add(sculpture);
  const loader = new GLTFLoader();
  const models = await Promise.all([loader.loadAsync('./assets/models/stethoscope.glb'), loader.loadAsync('./assets/models/hand.glb')]);
  let meshCount = 0, triangleCount = 0;
  models.forEach(model => {
    model.scene.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true; object.receiveShadow = true; meshCount++;
      triangleCount += (object.geometry.index?.count || object.geometry.attributes.position.count) / 3;
      if (object.material) {
        object.material.envMapIntensity = 1.1;
        if (object.material.name === 'Mirror steel') object.material.roughness = .19;
      }
    });
    sculpture.add(model.scene);
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: '#705541', opacity: .14 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -5.55; shadow.receiveShadow = true; scene.add(shadow);
  const chapters = ['home', 'articles', 'article-1', 'article-2', 'article-3', 'work', 'about'];
  let points = [], mobile = false, disabled = document.body.classList.contains('motion-off');
  let frame = 0, visible = true, previousTime = 0, y = scrollY;
  let pointer = [0, 0], pointerCurrent = [0, 0];
  function measure() {
    mobile = innerWidth <= 650;
    const { width, height } = stage.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75)); renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
    points = chapters.map(id => {
      const el = document.getElementById(id);
      return { id, y: el.getBoundingClientRect().top + scrollY + (id === 'home' ? 0 : innerHeight * .10) };
    });
    schedule();
  }
  function poseAt(position) {
    if (position <= points[0].y) return chapterPose('home', mobile);
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i], b = points[i + 1];
      if (position <= b.y) {
        const progress = (position - a.y) / (b.y - a.y);
        const hold = i === 0 ? .15 : .38;
        if (disabled) return chapterPose(progress < .7 ? a.id : b.id, mobile);
        return interpolatePose(chapterPose(a.id, mobile), chapterPose(b.id, mobile), Math.max(0, Math.min(1, (progress - hold) / (1 - hold))));
      }
    }
    return chapterPose('about', mobile);
  }
  function schedule() { if (!frame && visible) frame = requestAnimationFrame(render); }
  function render(time) {
    frame = 0; if (!visible) return;
    const dt = previousTime ? Math.min((time - previousTime) / 1000, .05) : .016; previousTime = time;
    const weight = disabled ? 1 : 1 - Math.exp(-dt * 16);
    y += (scrollY - y) * weight;
    const pose = poseAt(y);
    pointerCurrent = pointerCurrent.map((value, i) => value + (pointer[i] - value) * weight);
    const pan = disabled || mobile ? [0, 0] : pointerCurrent;
    camera.position.set(pose.position[0] + pan[0] * .12, pose.position[1] + pan[1] * .08, pose.position[2]);
    camera.lookAt(...pose.target); sculpture.rotation.y = pose.rotation;
    renderer.render(scene, camera);
    if (Math.abs(y - scrollY) > .25 || (!disabled && pointerCurrent.some((v, i) => Math.abs(v - pointer[i]) > .002))) schedule();
  }
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', measure);
  new ResizeObserver(measure).observe(stage);
  addEventListener('pointermove', event => {
    if (mobile || disabled) return;
    pointer = [event.clientX / innerWidth - .5, .5 - event.clientY / innerHeight]; schedule();
  }, { passive: true });
  addEventListener('journeymotion', event => { disabled = event.detail.disabled; y = scrollY; schedule(); });
  addEventListener('journeyapp', schedule);
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden; previousTime = 0;
    if (visible) schedule(); else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); visible = false; cancelAnimationFrame(frame); frame = 0; document.body.classList.remove('scene-ready'); });
  canvas.addEventListener('webglcontextrestored', () => { visible = true; schedule(); document.body.classList.add('scene-ready'); });
  window.__portfolioScene = { ready: true, meshCount, triangleCount, models: ['stethoscope', 'robotic-hand'] };
  measure(); document.body.classList.add('scene-ready');
}
