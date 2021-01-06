//Todas as variaveis para a simulação
let scene, renderer, camera, controls;

//Variáveis básicas para a cidade
let terrainPlane, road, sideWalk;

//Variáveis utilizadas para a mudança de metrologia na cidade
let sun, ambientLight;

//Variáveis usadas para o sistema de ruas da cidade
let roadMaster, swMaster

window.onload = function init() {
    'use strict';

    Physijs.scripts.worker = 'js/physi_js/physijs_worker.js';
    Physijs.scripts.ammo = './ammo.js';

    //Scene Physi.js
    scene = new Physijs.Scene;
    //Gravidade da scene
    scene.setGravity(0, -5, 0);

    //Camera
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(-270, 60,40)
    scene.add(camera)

    //Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCSoftShadowMap;


    document.getElementById('canvas-container').appendChild(renderer.domElement);

    //Creating the world
    renderStuff()
    createTerrain()
    createInfrastructure()
    createLight();
    createTemporaryCar()


}

//FIXME: Atenção yarick apaga esta função quando meteres o carro real
//TEMPORARY FUNCTION DELETE LATER
function createTemporaryCar() {
    let car = new Physijs.BoxMesh(
        new THREE.BoxGeometry(30, 16, 16),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xFF0000,
        })

    );
    car.position.set(0, 1, 16)
    scene.add(car);
}
//Função para criar o terreno da simulação
function createTerrain() {
    terrainPlane = new Physijs.PlaneMesh(
        new THREE.PlaneGeometry(500, 500, 2),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x79A43D,
            side: THREE.DoubleSide,
        })
    );

    terrainPlane.position.set(0, -8, 0);
    terrainPlane.rotateX(Math.PI / 2);
    scene.add(terrainPlane);
    //Podes alterar isto para olhar para o Carro (YARICK)
    camera.lookAt(terrainPlane.position);
    console.log("Terreno criado com sucesso!");

}

//Função para criar o terreno da simulação
function createInfrastructure() {
    //ATENÇÃO todos os bumpmaps e texturas não são as oficiais ainda(APENAS PARA TESTE)
    //Road
    let bumpmapTexture = new THREE.TextureLoader().load("./Textures/Road_bump_map_temp.jpg");

    road = new Physijs.BoxMesh(
        new THREE.BoxGeometry(300, 2, 66),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x444444,
            bumpMap: bumpmapTexture,
            bumpScale: 0.20
        })

    );
    scene.add(road);
    road.position.set(0, -8, 0)

    //Sidewalk
    swMaster = new THREE.Object3D()

    bumpmapTexture = new THREE.TextureLoader().load("./textures/Sw_bump_map_temp.jpg")
    sideWalk = new Physijs.BoxMesh(
        new THREE.BoxGeometry(300, 2, 10),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x999999,
            bumpMap: bumpmapTexture,
            bumpScale: 0.2,
        })

    );

    sideWalk2 = new Physijs.BoxMesh(
        new THREE.BoxGeometry(300, 2, 10),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x999999,
            bumpMap: bumpmapTexture,
            bumpScale: 0.2,
        })

    );

    sideWalk.position.set(-5, -7, 36);
    sideWalk2.position.set(-5, -7, -36);
    swMaster.add(sideWalk);
    swMaster.add(sideWalk2);
    scene.add(swMaster);
    console.log("Infraestrutura criada com sucesso!")
}

//Função para criar as luzes da simulação
function createLight() {


    sun = new THREE.DirectionalLight(0xC3C3C3, 0.5);
    scene.add(sun);
    //FIXME:Changes to the position will be needed 
    sun.position.set(0, 2000, 0)
    //Adicionar o target
    scene.add(sun.target)

    //FIXME: REMOVE LATER
    const helper = new THREE.DirectionalLightHelper(sun, 5);
    scene.add(helper);

    //ATENÇÃO TEMP LIGHT
    //FIXME: Change the lighting
    ambientLight = new THREE.AmbientLight(0xFFFFFF, 1); // soft white light
    scene.add(ambientLight);
    ambientLight.position.set(0, 50, 0)

    console.log("Luzes criadas com sucesso")
}

//Função do Render
function renderStuff() {
    requestAnimationFrame(renderStuff);
    renderer.render(scene, camera);
}