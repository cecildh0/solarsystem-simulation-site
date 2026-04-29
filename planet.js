
import * as THREE from 'three';
import particleFire from 'three-particle-fire'; 


/* Simple planet module.

Default parameters (example):
const params = {
    radius: 4,            // radius of planet
    color: 0x3366ff,       // color of planet, used if texture is not provided
    texture: undefined,    // optional: filepath to planet texture image

    ring: false,           // true to add a ring
    ringColor: 0x888888,   // color of ring, used if ringTexture not provided
    ringTexture: undefined, // optional: filepath to ring texture image
    ringTransparency: 1 // transparency of ring. 0 is invisible, 1 is visible

    moons: 0,              // number of moons to add
    moonColor: 0x888888,   // color of moon, used if moonTexture not provided
    moonTexture: undefined, // optional: filepath to moon texture image

    lighting: false,       // true to add emissive glow and point light to planet
    lightColor: 0xffffff,     // used if lighting is true   

    firey: false,           // true to add a fire particle effect to the planet 
};

This creates a planet scaled to "radius". If "texture" (string for file path) is provided it is used the texure, otherwise "color" is used.
If "ring" is true a flat ring is added slightly below the planet's equatorial plane (only a bit below for lighting purposes). Ring material may be a color or a texture, depending on if "ringTexture" is provided.
If "moons" > 0, that many moons are added around the planet. Moon material may be a color or a texture, depending on if "moonTexture" is provided.
If "lighting" is true, an emissive glow is added to the planet material, and a point light is added at the planet's position. The color of the light is determined by "lightColor".

Notes:
- The planet's local origin is at the planet's center.
- The planets's natural size (excluding ring or moons) is determined by "radius"
- The function adds the planet (and any rings/moons/lights) to the parent, and returns that parent
- Example usage:
    makePlanetParams(scene, { name: "earth", radius: 4, texture: "earth.png", moons: 1 });
    scene.add(group);
*/

function makePlanetParams(parent, params) {
    const r = params.radius;
    const planetGeom = new THREE.SphereGeometry(1, 32, 32);

    let planetMat;
    if (params.texture) {
        const loader = new THREE.TextureLoader();
        planetMat = new THREE.MeshPhongMaterial({ map: loader.load(params.texture) });
    } else {
        planetMat = new THREE.MeshPhongMaterial({ color: params.color });
    }

    const planet = new THREE.Mesh(planetGeom, planetMat);
    planet.scale.set(r, r, r);
    
    planet.name = params.name || 'planet';
    
    parent.add(planet);
    
    if (params.firey) {
        // Fire particle effect from three-particle-fire 
        const fireRadius = r * 2;     
        const fireHeight = r * 0.2;       
        const particleCount = 1000;       
        
        const fireGeometry = new particleFire.Geometry(fireRadius, fireHeight, particleCount);
        const fireMaterial = new particleFire.Material(0xffefc4);
        // I dont really think the depthTest works
        fireMaterial.depthTest = false;
        var fireParticle1 = new THREE.Points( fireGeometry, fireMaterial );
        const fireGeometry2 = new particleFire.Geometry(fireRadius, -fireHeight, particleCount);
        var fireParticle2 = new THREE.Points( fireGeometry2, fireMaterial );
        //Same with this stuff
        fireParticle1.renderOrder = 1;
        fireParticle2.renderOrder = 1;
        fireParticle1.frustumCulled = false;
        fireParticle2.frustumCulled = false;
        
        fireParticle1.name = (params.name || 'planet') + '_fireUp';
        fireParticle2.name = (params.name || 'planet') + '_fireDown';
        planet.add(fireParticle1);
        planet.add(fireParticle2);
    }

    //lighting
    if (params.lighting) {
        // simple emissive glow on the planet material
        if (planet.material) {
            // if a texture is provided, use it as an emissive map so the texture 'glows'
            if (params.texture) {
                const loader = new THREE.TextureLoader();
                planet.material.emissiveMap = loader.load(params.texture);
                planet.material.emissive = new THREE.Color(params.lightColor);
            } else {
                planet.material.emissive = new THREE.Color(params.color);
            }
            // // make the emissive visible and give a stronger glow
            planet.material.emissiveIntensity = 1.5;
            // planet.material.needsUpdate = true;
        }
        // strong point light to reinforce the glow
        const light = new THREE.PointLight(params.lightColor, 5000, 0);
        light.position.copy(planet.position);
        parent.add(light);
    }

    //ring
    if (params.ring) {
        const inner = r * 1.1;
        const outer = r * 2.0;
        const ringGeom = new THREE.RingGeometry(inner, outer, 64);
        const ringOpacity = params.ringTransparency;
        var ringIsTransparent;
        if (ringOpacity < 1) {
            ringIsTransparent = true;
        } else {
            ringIsTransparent = false;
        }

        const pos = ringGeom.attributes.position;
        const uv = ringGeom.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const dist = Math.sqrt(x * x + y * y);
            uv.setY(i, (dist - inner) / (outer - inner)); // radial
            uv.setX(i, Math.atan2(y, x) / (2 * Math.PI) + 0.5); // angular
        }
        uv.needsUpdate = true;

        let ringMat;
        if (params.ringTexture) {
            const ringTex = new THREE.TextureLoader().load(params.ringTexture);
            //ringTex.wrapS = THREE.RepeatWrapping;
            //ringTex.wrapT = THREE.RepeatWrapping;
            ringMat = new THREE.MeshPhongMaterial({
                map: ringTex,
                side: THREE.DoubleSide,
                transparent: ringIsTransparent,
                opacity: ringOpacity
            });
        } else {
            ringMat = new THREE.MeshPhongMaterial({
                color: params.ringColor,
                side: THREE.DoubleSide,
                transparent: ringIsTransparent,
                opacity: ringOpacity
            });
        }
        const ring = new THREE.Mesh(ringGeom, ringMat);
        // ring in the XZ plane (flat around Y axis)
        ring.rotateX(Math.PI / 2);
        // lower the ring slightly so the sun's light actually affects it
        ring.position.y = -r * 0.05;
        ring.name = (params.name || 'planet') + '_ring';
        parent.add(ring);
    }

    //moons
    if (params.moons && params.moons > 0) {
        const moonsGroup = new THREE.Object3D();
        moonsGroup.name = (params.name || 'planet') + '_moons';

        //If a planet has a lot of moons, draw a moon belt instead
        const manyMoons = params.moons > 12;

        // Reuse one moon geometry/material per planet to reduce memory and shader churn.
        const moonGeom = new THREE.SphereGeometry(1, 10, 10);
        let moonMat;
        if (params.moonTexture) {
            const moonTex = new THREE.TextureLoader().load(params.moonTexture);
            moonMat = new THREE.MeshPhongMaterial({ map: moonTex });
        } else {
            moonMat = new THREE.MeshPhongMaterial({ color: params.moonColor || 0x888888 });
        }

        //If the moons are too big its hard to tell a moon apart from a planet
        const maxMoonRadius = 0.5;
        for (let i = 0; i < params.moons; i++) {
            let mr = Math.min(r * 0.25, maxMoonRadius); // Cap
            if (manyMoons) mr = Math.min(r * 0.12, 0.2); // smaller for belt look
            const moon = new THREE.Mesh(moonGeom, moonMat);
            moon.scale.set(mr, mr, mr);
            // Moons are in a circle around XZ plane.
            let distance;
            if (params.ring) {
                distance = r * 2.5;
            } else {
                distance = r * 1.1;
            }
            if (manyMoons) {
                const beltInner = distance * 0.8;
                const beltOuter = distance * 1.2;
                const angle = Math.random() * Math.PI * 2;
                const beltDistance = beltInner + Math.random() * (beltOuter - beltInner);
                moon.position.set(beltDistance * Math.cos(angle), 0, beltDistance * Math.sin(angle));
            } else {
                const angle = (i / params.moons) * Math.PI * 2;
                moon.position.set(distance * Math.cos(angle), 0, distance * Math.sin(angle));
            }
            // Moons numbered
            moon.name = (params.name || 'planet') + '_moon' + i;
            moonsGroup.add(moon);
        }
        
        parent.add(moonsGroup);
    }

    return parent;
}



export { makePlanetParams };
