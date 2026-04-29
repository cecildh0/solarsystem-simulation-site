/*-----------------------------------------------------------------
 * Final Project 
 * Miniature solar system
 * 
 * Updated additions:
 * *Imported fire particle effect param for planets, makes planet look hot from a distance
 * *Added ability to toggle spinning of planets with spacebar
 * *Added ability to drag earth orbit with shift+click and drag
 * *Additionally, movmement of other plants and moons are simulated togehter with this user-inputted movement of the earth
 * Full solar system is implemented
 * *Press X to toggle whether pluto is included.
 *  It's up to you if pluto's a planet
 * Ring transparency param 
 * 
 * Created by Daniel Cecil
 * three.particle.fire by yomotsu
 * Planet textures from https://www.solarsystemscope.com/textures/
 *  
 * Updated 4/22/2026
 *---------------------------------------------------------------*/

//import three js and all the addons that are used in this script 
import * as THREE from 'three';
import { TW } from 'tw';
import GUI from 'gui';
import particleFire from 'three-particle-fire';
import { makePlanetParams } from './planet.js';

particleFire.install( { THREE: THREE } );

console.log(`Loaded Three.js version ${THREE.REVISION}`);

// for debugging
globalThis.THREE = THREE;
globalThis.TW = TW;

// Create an initial empty Scene
var scene = new THREE.Scene();
globalThis.scene = scene;

// set scene background to stars.jpg
const loader = new THREE.TextureLoader();
loader.load('stars.jpg', function(texture) {
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.repeat.set(2, 2);
    scene.background = texture;
});

// ================================================================
// Build your scene here

const earthParams = {
    name: 'earth',
    radius: 2.4,
    color: 0x3366ff,
    texture: "earth.png",
    ring: false,
    moons: 1,
    moonColor: 0x888888,
    moonTexture: "moon.png",
    firey: false,
};

const marsParams = {
    name: 'mars',
    radius: 1.3,
    color: 0xff5522,
    texture: "mars.jpg",
    ring: false,
    moons: 2,
    moonColor: 0x999999,
    moonTexture: "moon.png",
    firey: false,
};

const saturnParams = {
    name: 'saturn',
    radius: 5.9,
    color: 0xffcc88,
    texture: "saturn.jpg",
    ring: true,
    ringColor: 0x996633,
    ringTexture: "saturn_ring.png",
    ringTransparency: 1,
    moons: 60,
    moonColor: 0xaaaaaa,
    moonTexture: "moon.png",
    firey: false,
};

const sunParams = {
    name: 'sun',
    radius: 18,
    color: 0xffff66,
    texture: "sun.jpg",
    ring: false,
    moons: 0,
    lighting: true,
    lightColor: 0xfad2af,
    moonTexture: "moon.png",
    firey: true,
};

const mercuryParams = {
    name: 'mercury',
    radius: 0.9,
    color: 0x888888,
    texture: "mercury.jpg",
    ring: false,
    moons: 0,
    lighting: false,
    lightColor: 0x888888,
    moonTexture: "moon.png",
    firey: false,
}

const venusParams = {
    name: 'venus',
    radius: 2.2,
    color: 0xffaa88,
    texture: "venus.jpg",
    ring: false,
    moons: 0,
    lighting: false,
    lightColor: 0xffaa88,
    moonTexture: "moon.png",
    firey: false,
}

const jupiterParams = {
    name: 'jupiter',
    radius: 7.0,
    color: 0xffff66,
    texture: "jupiter.jpg",
    ring: true, //will implement transparent ring later
    ringColor: 0x7a3e2b,
    ringTransparency: 0.15,
    moons: 40,
    moonColor: 0xaaaaaa,
    moonTexture: "moon.png",
    firey: false,
}

const uranusParams = {
    name: 'uranus',
    radius: 3.1,
    color: 0x888888,
    texture: "uranus.jpg",
    ring: true, //will implement transparent ring later
    ringColor: 0x2b2b2b,
    ringTransparency: 0.15,
    moons: 15,
    moonColor: 0xaaaaaa,
    moonTexture: "moon.png",
    firey: false,
}

const neptuneParams = {
    name: 'neptune',
    radius: 3.0,
    color: 0x888888,
    texture: "neptune.jpg",
    ring: true, //will implement transparent ring later
    ringColor: 0x3b2f2f,
    ringTransparency: 0.15,
    moons: 8,
    moonColor: 0xaaaaaa,
    moonTexture: "moon.png",
    firey: false,
}

const plutoParams = {
    name: 'pluto',
    radius: 0.4,
    color: 0xaaaaaa,
    texture: "pluto.jpg",
    ring: false,
    moons: 0,
    firey: false,
}
// Globals to hold planet groups for organization. Extra globals can store extra meshes if necessary for spinning or other animations
var sun;
var sunFireUp;
var sunFireDown;

// Distances are based on AU proportions, compressed with sqrt(AU) for visibility.
const mercuryDistance = 23;
var mercuryGroup;

const venusDistance = 27;
var venusGroup;

const earthDistance = 30;
var earthGroup;

const marsDistance = 38;
var marsGroup;

const jupiterDistance = 57;
var jupiterGroup;

const saturnDistance = 72;
var saturnGroup;

const uranusDistance = 95;
var uranusGroup;

const neptuneDistance = 115;
var neptuneGroup;

const plutoDistance = 125;
var plutoGroup;


// earth's mesh
var earthMesh;


// pivots for rotating planets around the sun
var mercuryPivot;
var venusPivot;
var earthPivot;
var marsPivot;
var jupiterPivot;
var saturnPivot;
var uranusPivot;
var neptunePivot;
var plutoPivot;

// Orbit rates about the sun
// I honestly dont know how fast every planet spins around the sun so like if I have time to research that I'll
// make it more accurate but I honestly just dont think that part is very interesting
const mercuryOrbitSpeed = 0.7;
const venusOrbitSpeed = 0.6;
const earthOrbitSpeed = 0.8;
const marsOrbitSpeed = 0.5;
const jupiterOrbitSpeed = 0.3;
const saturnOrbitSpeed = 0.2;
const uranusOrbitSpeed = 0.15;
const neptuneOrbitSpeed = 0.1;
const plutoOrbitSpeed = 0.05;
// Spin speeds for planets
const mercurySpinSpeed = 0.4;
const venusSpinSpeed = 0.3;
const earthSpinSpeed = 0.5;
const marsSpinSpeed = 0.3;
const jupiterSpinSpeed = 0.3;
const saturnSpinSpeed = 0.2;
const uranusSpinSpeed = 0.2;
const neptuneSpinSpeed = 0.1;
var plutoSpinSpeed = 0.05;
// Self-spin speed for Earth's mesh (slightly slower than the group). 
// Only the earth's axis is seperated because I think it looks better when its spin is seperate from its moon
const earthSelfSpinSpeed = 0.25;

// Fixed time-step, treated as seconds
const simDt = 0.016;

//Toggle spinning off planets
var planetsSpinning = true;

// Check if earth is being dragged
var draggingEarthOrbit = false;

//Toggle pluto
var plutoExists = false;

//To be honest the whole remaking thing isnt totally necessary unless I 
// decide to add a GUI element or something. But I want to leave the door open for
// that
function remakeSolarSystem() {
    // This just removes pivots but Im not really worried about adding and removing right now so whatever
    if (sun) scene.remove(sun);
    if (mercuryPivot) scene.remove(mercuryPivot);
    if (venusPivot) scene.remove(venusPivot);
    if (earthPivot) scene.remove(earthPivot);
    if (marsPivot) scene.remove(marsPivot);
    if (jupiterPivot) scene.remove(jupiterPivot);
    if (saturnPivot) scene.remove(saturnPivot);
    if (uranusPivot) scene.remove(uranusPivot);
    if (neptunePivot) scene.remove(neptunePivot);
    if(plutoGroup) scene.remove(plutoGroup);
    if (plutoPivot) scene.remove(plutoPivot);

    // Sun
    makePlanetParams(scene, sunParams);
    sun = scene.getObjectByName('sun');
    //sun particles
    sunFireUp = sun.getObjectByName('sun_fireUp');
    sunFireDown = sun.getObjectByName('sun_fireDown');


    // Mercury
    mercuryGroup = new THREE.Object3D();
    mercuryGroup.position.set(mercuryDistance, 0, 0);
    makePlanetParams(mercuryGroup, mercuryParams);
    mercuryPivot = new THREE.Object3D();
    mercuryPivot.add(mercuryGroup);
    scene.add(mercuryPivot);

    // Venus
    venusGroup = new THREE.Object3D();
    venusGroup.position.set(venusDistance, 0, 0);
    makePlanetParams(venusGroup, venusParams);
    venusPivot = new THREE.Object3D();
    venusPivot.add(venusGroup);
    scene.add(venusPivot);

    // Earth 
    earthGroup = new THREE.Object3D();
    earthGroup.position.set(earthDistance, 0, 0);
    makePlanetParams(earthGroup, earthParams);
    earthMesh = earthGroup.getObjectByName(earthParams.name);
    earthPivot = new THREE.Object3D();
    earthPivot.add(earthGroup);
    scene.add(earthPivot);

    // Mars
    marsGroup = new THREE.Object3D();
    marsGroup.position.set(marsDistance, 0, 0);
    makePlanetParams(marsGroup, marsParams);
    marsPivot = new THREE.Object3D();
    marsPivot.add(marsGroup);
    scene.add(marsPivot);

    // Jupiter
    jupiterGroup = new THREE.Object3D();
    jupiterGroup.position.set(jupiterDistance, 0, 0);
    makePlanetParams(jupiterGroup, jupiterParams);
    jupiterPivot = new THREE.Object3D();
    jupiterPivot.add(jupiterGroup);
    scene.add(jupiterPivot);

    // Saturn
    saturnGroup = new THREE.Object3D();
    saturnGroup.position.set(saturnDistance, 0, 0);
    makePlanetParams(saturnGroup, saturnParams);
    saturnPivot = new THREE.Object3D();
    saturnPivot.add(saturnGroup);
    scene.add(saturnPivot);

    // Uranus
    uranusGroup = new THREE.Object3D();
    uranusGroup.position.set(uranusDistance, 0, 0);
    makePlanetParams(uranusGroup, uranusParams);
    uranusPivot = new THREE.Object3D();
    uranusPivot.add(uranusGroup);
    scene.add(uranusPivot);

    // Neptune
    neptuneGroup = new THREE.Object3D();
    neptuneGroup.position.set(neptuneDistance, 0, 0);
    makePlanetParams(neptuneGroup, neptuneParams);
    neptunePivot = new THREE.Object3D();
    neptunePivot.add(neptuneGroup);
    scene.add(neptunePivot);

    //Pluto
    plutoGroup = new THREE.Object3D();
    plutoGroup.position.set(plutoDistance, 0, 0);
    makePlanetParams(plutoGroup, plutoParams);
    plutoPivot = new THREE.Object3D();
    plutoPivot.add(plutoGroup);
    plutoPivot.visible = plutoExists;
    scene.add(plutoPivot);

}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
// directionalLight.position.set(1, 1, 3);
// scene.add(directionalLight);

// initial setup
remakeSolarSystem();

// ================================================================

// Create a renderer to render the scene
var renderer = new THREE.WebGLRenderer();

// TW.mainInit() initializes TW, adds the canvas to the document,
// enables display of 3D coordinate axes, sets up keyboard controls
TW.mainInit(renderer,scene);

// const gui = new GUI();
// gui.add(params, 'hatHeight', 1, 10).onChange(remakeFigure);
// gui.add(params, 'hatAngle', -Math.PI/2, +Math.PI/2).onChange(remakeFigure);
// gui.add(params, 'headDim', 1, 10).onChange(remakeFigure);
// gui.add(params, 'bodyHeight', 1, 20).onChange(remakeFigure);
// gui.add(params, 'bodyWidth', 1, 10).onChange(remakeFigure);
// gui.addColor(params, 'bodyColor').onChange((val) => body.material.color.setHex(val));
// gui.addColor(params, 'headColor').onChange(remakeFigure);
// gui.addColor(params, 'faceColor').onChange(remakeFigure);
// gui.addColor(params, 'hatColor').onChange((val) => hat.material.color.setHex(val));


// Set up a camera for the scene
var state = TW.cameraSetup(renderer,
                           scene,
                           // This is really big lol
                           {minx: -130, maxx: +130,
                            miny: -30, maxy: 90,
                            minz: -130, maxz: +130});

// TW sets near from scene size (~30); orbit zoom can move the camera inside that and clip the sun and particles.
if (state.cameraObject) {
    state.cameraObject.near = 0.1;
    state.cameraObject.updateProjectionMatrix();
}

// Continue to next (or previous) frame of animation
// Either if animation is unpaused or if the earth is being moved by user
function advanceSimulation(dt, planetsOnly) {
    if (planetsOnly) {
        if (mercuryPivot) mercuryPivot.rotation.y += mercuryOrbitSpeed * dt;
        if (venusPivot) venusPivot.rotation.y += venusOrbitSpeed * dt;
        if (earthPivot) earthPivot.rotation.y += earthOrbitSpeed * dt;
        if (marsPivot) marsPivot.rotation.y += marsOrbitSpeed * dt;
        if (jupiterPivot) jupiterPivot.rotation.y += jupiterOrbitSpeed * dt;
        if (saturnPivot) saturnPivot.rotation.y += saturnOrbitSpeed * dt;
        if (uranusPivot) uranusPivot.rotation.y += uranusOrbitSpeed * dt;
        if (neptunePivot) neptunePivot.rotation.y += neptuneOrbitSpeed * dt;
        if (plutoPivot && plutoExists) plutoPivot.rotation.y += plutoOrbitSpeed * dt;

        if (mercuryGroup) mercuryGroup.rotation.y += mercurySpinSpeed * dt;
        if (venusGroup) venusGroup.rotation.y += venusSpinSpeed * dt;
        if (earthGroup) earthGroup.rotation.y += earthSpinSpeed * dt;
        if (earthMesh) earthMesh.rotation.y += earthSelfSpinSpeed * dt;
        if (marsGroup) marsGroup.rotation.y += marsSpinSpeed * dt;
        if (jupiterGroup) jupiterGroup.rotation.y += jupiterSpinSpeed * dt;
        if (saturnGroup) saturnGroup.rotation.y += saturnSpinSpeed * dt;
        if (uranusGroup) uranusGroup.rotation.y += uranusSpinSpeed * dt;
        if (neptuneGroup) neptuneGroup.rotation.y += neptuneSpinSpeed * dt;
        if (plutoGroup && plutoExists) plutoGroup.rotation.y += plutoSpinSpeed * dt;

    }
    if (sunFireUp && sunFireDown) {
        sunFireUp.material.update(dt);
        sunFireDown.material.update(dt);
    }
}

// Animation for unpaused, do next frame and continue until the animation is stopped
function animate() {
    requestAnimationFrame(animate);
    if (!draggingEarthOrbit) {
        if (planetsSpinning) {
            advanceSimulation(simDt, true);
        } else {
            advanceSimulation(simDt, false);
        }
    }
}
animate();




// ================================================================
// mouse handling: Shift + drag on Earth 

// Sensitivity of earth orbit dragging
const earthOrbitDragSensitivity = 0.004;

const raycaster = new THREE.Raycaster();

// Convert mouse position to NDC, for raycasting
function convertMousePositionToNDC(event, domElement) {
    const rect = domElement.getBoundingClientRect();
    const xNDC = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const yNDC = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return new THREE.Vector2(xNDC, yNDC);
}

// Check if the earth mesh is being hit by the mouse
function pickEarthMesh(ndc) {
    if (!earthMesh || !state.cameraObject) return null;
    raycaster.setFromCamera(ndc, state.cameraObject);
    const hits = raycaster.intersectObject(earthMesh, false);
    return hits.length > 0 ? hits[0] : null;
}

// Set the orbit controls enabled or disabled
function setOrbitControlsEnabled(enabled) {
    if (state.cameraControls) state.cameraControls.enabled = enabled;
}

// Check if the earth mesh is clicked and held by the mouse
function onPointerDownEarth(evt) {
    if (evt.button !== 0 || !evt.shiftKey) return;
    const canvas = renderer.domElement;
    if (evt.target !== canvas) return;
    const ndc = convertMousePositionToNDC(evt, canvas);
    if (!pickEarthMesh(ndc)) return;
    draggingEarthOrbit = true;
    canvas.setPointerCapture(evt.pointerId);
    setOrbitControlsEnabled(false);
}

// Move the earth orbit (and all other movements corresponding to where the earth would be if it were spinning)
function onPointerMoveEarth(evt) {
    if (!draggingEarthOrbit || !earthPivot) return;
    const dThetaEarth = evt.movementX * earthOrbitDragSensitivity;
    // Simulate all orbits and spins together
    const dSimTime = dThetaEarth / earthOrbitSpeed;
    advanceSimulation(dSimTime, true);
}

// Stop dragging the earth orbit
function onPointerUpEarth(evt) {
    if (!draggingEarthOrbit) return;
    draggingEarthOrbit = false;
    const canvas = renderer.domElement;
    if (canvas.hasPointerCapture(evt.pointerId)) {
        canvas.releasePointerCapture(evt.pointerId);
    }
    setOrbitControlsEnabled(true);
}

// Toggle spinning of planets with spacebar
function onKeyDownToggleSpin(evt) {
    if (evt.code !== 'Space' && evt.key !== ' ') return;
    if (evt.repeat) return;
    evt.preventDefault();
    planetsSpinning = !planetsSpinning;
}

// Toggle Pluto visibility with X key
function onKeyDownTogglePluto(evt) {
    if (evt.code !== 'KeyX' && evt.key.toLowerCase() !== 'x') return;
    if (evt.repeat) return;
    plutoExists = !plutoExists;
    if (plutoPivot) plutoPivot.visible = plutoExists;
}

const canvas = renderer.domElement;
canvas.addEventListener('pointerdown', onPointerDownEarth);
canvas.addEventListener('pointermove', onPointerMoveEarth);
canvas.addEventListener('pointerup', onPointerUpEarth);
canvas.addEventListener('pointercancel', onPointerUpEarth);
window.addEventListener('keydown', onKeyDownToggleSpin);
window.addEventListener('keydown', onKeyDownTogglePluto);

// ================================================================

// window.addEventListener( 'resize', function () {

//   var width  = window.innerWidth;
//   var height = window.innerHeight;

//   camera.aspect = width / height;
//   camera.updateProjectionMatrix();
//   renderer.setSize( width, height );
//   if (sunFireUp && sunFireDown) {
//     sunFireUp.material.setPerspective( camera.fov, height );
//     sunFireDown.material.setPerspective( camera.fov, height );
//   }

// } );

