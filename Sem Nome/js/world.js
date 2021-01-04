//Todas as variaveis para a simulação
let scene, renderer, camera, controls;

let terrainPlane, road;

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
    createInfrastructure()
    createLight();


}

//Função para criar o terreno da simulação
function createTerrain() {
    terrainPlane = new Physijs.PlaneMesh(
        new THREE.PlaneGeometry(50, 50, 2),
        // FIXME: Change to PHONG MATERIAL AFTER LIGHTS
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

//Função para criar o terreno da simulação
function createInfrastructure() {
    //ATENÇÃO todos os bumpmaps e texturas não são as oficiais ainda(APENAS PARA TESTE)
    let bumpmapTexture = new THREE.TextureLoader().load("./Textures/Road_bump_map_temp.jpg");

    road = new Physijs.BoxMesh(
        new THREE.BoxGeometry(50, 0, 10),
        new THREE.MeshPhongMaterial({
            color: 0xD8F6E5,
            bumpMap: bumpmapTexture,
            bumpScale: 0.20
        })

    );
    scene.add(road);
    road.position.set(0, 0, 0)
    console.log("Infraestrutura criada com sucesso!")
}

//Função para criar as luzes da simulação
function createLight() {

    //ATENÇÃO TEMP LIGHT
    const light = new THREE.AmbientLight(0x404040, 1); // soft white light
    scene.add(light);
    light.position.set(0, 5, 0)
    console.log("Luzes criadas com sucesso")

}

//Função do Render
function renderStuff() {
    requestAnimationFrame(renderStuff);
    renderer.render(scene, camera);
}