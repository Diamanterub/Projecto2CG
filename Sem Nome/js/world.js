//Todas as variaveis para a simulação
let scene, renderer, camera, controls;

let box;

window.onload = function init() {
    'use strict';

    Physijs.scripts.worker = 'js/physi_js/physijs_worker.js';
    Physijs.scripts.ammo = './ammo.js';

    scene = new Physijs.Scene;

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(-60, 30, 0)
    scene.add(camera)

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCSoftShadowMap;


    document.getElementById('canvas-container').appendChild(renderer.domElement);

    renderStuff()
    createTerrain()


}

//Função para criar o terreno da simulação
function createTerrain() {
    terrainPlane = new Physijs.PlaneMesh(
        new THREE.PlaneGeometry(50, 50, 2),
        new THREE.MeshBasicMaterial({
            color: 0x888888,
            side: THREE.DoubleSide,
        })
    );
    terrainPlane.position.set(0, 0, 0);
    terrainPlane.rotateX(Math.PI / 2);
    scene.add(terrainPlane);
    //Podes alterar isto para olhar para o Carro (YARICK)
    camera.lookAt(terrainPlane.position);
    console.log("Terreno criado com sucesso!");

}

//Função do Render
function renderStuff() {
    requestAnimationFrame(renderStuff);
    renderer.render(scene, camera);
}