//Todas as variaveis para a simulação
let scene, renderer, camera;

//Variáveis básicas para a cidade
let terrainPlane, pavimento1, pavimento2, passeio, passeio2;

//Variáveis utilizadas para a mudança de metrologia na cidade
let sol, luzAmbiente, solCamera;

let solPotencia = 1;

//Variáveis usadas para o sistema de ruas da cidade
let passeioMain;

window.onload = function init() {
    //Scene
    scene = new THREE.Scene();

    //Camera
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 650, 200)
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
    createParkingLot()
    createLight();
    createTemporaryCar()
    sunUpdate()


}

//FIXME: Atenção yarick apaga esta função quando meteres o carro real
//TEMPORARY FUNCTION DELETE LATER
function createTemporaryCar() {
    let car = new THREE.Mesh(
        new THREE.BoxGeometry(30, 16, 16),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xFF0000,
        })

    );
    car.receiveShadow = true;
    car.castShadow = true;
    car.position.set(0, 9, 16)
    scene.add(car);
}
//Função para criar o terreno da simulação
function createTerrain() {
    terrainPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000, 2),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x79A43D,
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

//Função para criar os detalhes  da simulação
function createParkingLot() {
    //ATENÇÃO todos os bumpmaps e texturas não são as oficiais ainda(APENAS PARA TESTE)
    // Area do parque de estacionamento
    let muro1, muro2, muro3;
    let chao = new THREE.Object3D()
    let bumpmapTexture = new THREE.TextureLoader().load("./Textures/Road_bump_map_temp.jpg");
    pavimento1 = new THREE.Mesh(
        new THREE.BoxGeometry(250, 2, 350),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x444444,
            bumpMap: bumpmapTexture,
            bumpScale: 0.20
        })

    );
    pavimento1.position.set(0, 0, 0)
    chao.add(pavimento1);
    //Area da zona de entregas
    pavimento2 = new THREE.Mesh(
        new THREE.BoxGeometry(200, 2, 150),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x444444,
            bumpMap: bumpmapTexture,
            bumpScale: 0.20
        })

    );
    pavimento2.position.set(220, 0, -100);
    pavimento1.receiveShadow = true;
    pavimento2.receiveShadow = true;
    chao.add(pavimento2);
    scene.add(chao);


    //Walls
    bumpmapTexture = new THREE.TextureLoader().load("./Textures/brickwall_bump_map_temp.jpg");
    let muroObjeto = new THREE.Object3D()
    muro1 = new THREE.Mesh(
        new THREE.BoxGeometry(10, 30, 150),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xE06666,
            bumpMap: bumpmapTexture,
            bumpScale: 0.40
        })

    );
    muro1.position.set(320, 16, -100)

    muro2 = new THREE.Mesh(
        new THREE.BoxGeometry(450, 30, 10),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xE06666,
            bumpMap: bumpmapTexture,
            bumpScale: 0.40
        })

    );
    muro2.position.set(100, 16, -170)

    muro3 = new THREE.Mesh(
        new THREE.BoxGeometry(10, 30, 290),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xE06666,
            bumpMap: bumpmapTexture,
            bumpScale: 0.40
        })

    );
    muro3.position.set(-120, 16, 30)

    muro4 = new THREE.Mesh(
        new THREE.BoxGeometry(250, 30, 10),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xE06666,
            bumpMap: bumpmapTexture,
            bumpScale: 0.40
        })

    );

    muro4.position.set(0, 16, 170)
    muro1.castShadow = true;
    muro2.castShadow = true;
    muro3.castShadow = true;
    muro4.castShadow = true;
    muroObjeto.add(muro1);
    muroObjeto.add(muro2);
    muroObjeto.add(muro3);
    muroObjeto.add(muro4);
    scene.add(muroObjeto);


    //Portão
    let portaoObjeto = new THREE.Object3D()
    let portaoPoste, portaoTerminal;

    portaoPoste = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 44, 32),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xFFD966,
        })
    );

    portaoPoste.rotateX(Math.PI / 2);
    portaoPoste.position.set(-115, 10, -136)
    scene.add(portaoPoste);

    portaoTerminal = new THREE.Mesh(
        new THREE.BoxGeometry(5, 30, 10),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xB45F06,
        })

    );
    portaoTerminal.position.set(-115, 2, -160)
    portaoObjeto.add(portaoPoste);
    portaoObjeto.add(portaoTerminal);
    scene.add(portaoObjeto);

    console.log("Parking lot criado com sucesso")

}

//Função para criar as luzes da simulação
function createLight() {

    solCamera = new THREE.OrthographicCamera(-300, 300, 300, -300, 1, 1200);
    scene.add(solCamera);

    sol = new THREE.DirectionalLight(0xC3C3C3, solPotencia);
    scene.add(sol);
    scene.add(sol.target)
    sol.position.set(0, 2000, 0)
    //Sombras
    sol.castShadow = true;
    sol.autoUpdate = true;
    sol.shadow.camera = solCamera;

    //Settings importantes para as sombras
    sol.shadow.bias = 0.00020
    sol.shadow.camera.near = 10;
    sol.shadow.camera.far = 2100;

    //FIXME: REMOVE LATER
    // const helper = new THREE.DirectionalLightHelper(sol, 5);
    // scene.add(helper);

    //ATENÇÃO TEMP LIGHT
    //FIXME: Change the lighting
    luzAmbiente = new THREE.AmbientLight(0xEEEEEE, 0.2); // soft white light
    scene.add(luzAmbiente);
    luzAmbiente.position.set(0, 50, 0)

    console.log("Luzes criadas com sucesso")
}

function sunUpdate() {
    //Cada dia e noite demoram 6.6 minutos
    //80 vezes cada if 
    //TODO: O sunPower devia passar a 1 outra vez
    setInterval(() => {
        sol.autoUpdate = true;
        sol.needsUpdate = true;
        if ((sol.position.z < 2000 && sol.position.z >= 0) && (sol.position.y <= 2000 && sol.position.y > 0)) {
            //Day
            sol.position.set(sol.position.x, sol.position.y - 25, sol.position.z + 25);
            solPotencia = solPotencia - 0.0125;
            sol.power = solPotencia * 4 * Math.PI;
        } else if (sol.position.z > 0) {
            //Night
            sol.position.set(sol.position.x, sol.position.y - 25, sol.position.z - 25);
            solPotencia = 0;
            sol.power = solPotencia * 4 * Math.PI;
            sol.castShadow = false;
        } else if (sol.position.z <= 0 && sol.position.y < 0) {
            // Night
            sol.position.set(sol.position.x, sol.position.y + 25, sol.position.z - 25);
            sol.power = solPotencia * 4 * Math.PI;
        } else if ((sol.position.z >= -2000 && sol.position.z < 0) && sol.position.y >= 0) {
            //Day
            sol.position.set(sol.position.x, sol.position.y + 25, sol.position.z + 25);
            solPotencia = solPotencia + 0.0125;
            sol.power = solPotencia * 4 * Math.PI;
            sol.castShadow = true
        }
        console.log(sol.position)

    }, 5000);
}

//Função do Render
function renderStuff() {
    requestAnimationFrame(renderStuff);
    renderer.render(scene, camera);
}