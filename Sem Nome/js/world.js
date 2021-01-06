//Todas as variaveis para a simulação
let scene, renderer, camera;

//Variáveis básicas para a cidade
let terrainPlane, rua, passeio, passeio2;

//Variáveis utilizadas para a mudança de metrologia na cidade
let sol, luzAmbiente;

//Variáveis usadas para o sistema de ruas da cidade
let passeioMain;

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
    camera.position.set(-270, 60, 40)
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

    rua = new Physijs.BoxMesh(
        new THREE.BoxGeometry(300, 2, 66),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x444444,
            bumpMap: bumpmapTexture,
            bumpScale: 0.20
        })

    );
    scene.add(rua);
    rua.position.set(0, -8, 0)

    //Sidewalk
    passeioMain = new THREE.Object3D()

    bumpmapTexture = new THREE.TextureLoader().load("./textures/Sw_bump_map_temp.jpg")
    passeio = new Physijs.BoxMesh(
        new THREE.BoxGeometry(300, 2, 10),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x999999,
            bumpMap: bumpmapTexture,
            bumpScale: 0.2,
        })

    );

    passeio2 = new Physijs.BoxMesh(
        new THREE.BoxGeometry(300, 2, 10),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x999999,
            bumpMap: bumpmapTexture,
            bumpScale: 0.2,
        })

    );

    passeio.position.set(-5, -7, 36);
    passeio2.position.set(-5, -7, -36);
    passeioMain.add(passeio);
    passeioMain.add(passeio2);
    scene.add(passeioMain);
    console.log("Infraestrutura criada com sucesso!")
}

//Função para criar as luzes da simulação
function createLight() {

    sol = new THREE.DirectionalLight(0xC3C3C3, 0.5);
    scene.add(sol);
    //FIXME:Changes to the position will be needed 
    sol.position.set(0, 2000, 0)
    //Adicionar o target
    scene.add(sol.target)

    //FIXME: REMOVE LATER
    const helper = new THREE.DirectionalLightHelper(sol, 5);
    scene.add(helper);

    //ATENÇÃO TEMP LIGHT
    //FIXME: Change the lighting
    luzAmbiente = new THREE.AmbientLight(0xFFFFFF, 1); // soft white light
    scene.add(luzAmbiente);
    luzAmbiente.position.set(0, 50, 0)

    console.log("Luzes criadas com sucesso")
}

//Função do Render
function renderStuff() {
    requestAnimationFrame(renderStuff);
    renderer.render(scene, camera);
}