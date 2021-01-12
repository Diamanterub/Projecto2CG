//Todas as variaveis para a simulação
let scene, renderer, camera;

//Variáveis utilizadas para a mudança de metrologia na cidade
let sol, luzAmbiente, solCamera;

let solPotencia = 1;

let luzLampada;


window.onload = function init() {
    //Scene
    scene = new THREE.Scene();

    //Camera
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(-400, 350, -100)
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

    //Variáveis básicas para a simulação
    let terrenoPlano;

    //Criar a mesh do plano 
    terrenoPlano = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000, 2),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x79A43D,
            side: THREE.DoubleSide,
        })
    );

    terrenoPlano.position.set(0, 0, 0);
    terrenoPlano.rotateX(Math.PI / 2);
    scene.add(terrenoPlano);
    //FIXME:Podes alterar isto para olhar para o Carro (YARICK)
    camera.lookAt(terrenoPlano.position);
    console.log("Terreno criado com sucesso!");
}

//Função para criar os detalhes  da simulação
function createParkingLot() {
    //ATENÇÃO todos os bumpmaps e texturas não são as oficiais ainda(APENAS PARA TESTE)
    // Area do parque de estacionamento
    let muro;
    let pavimento;
    let chao = new THREE.Object3D()
    //A texture do bumpMap do pavimento
    let bumpmapPavimento = new THREE.TextureLoader().load("./Textures/Road_bump_map_temp.jpg");
    //Zona do parque de estacionamento
    pavimento = new THREE.Mesh(
        new THREE.BoxGeometry(250, 2, 350),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x444444,
            bumpMap: bumpmapPavimento,
            bumpScale: 0.20
        })

    );
    pavimento.position.set(0, 0, 0)
    pavimento.receiveShadow = true;
    chao.add(pavimento);
    //Area da zona de entregas
    pavimento = new THREE.Mesh(
        new THREE.BoxGeometry(200, 2, 150),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x444444,
            bumpMap: bumpmapPavimento,
            bumpScale: 0.20
        })

    );
    pavimento.position.set(220, 0, -100);
    pavimento.receiveShadow = true;
    chao.add(pavimento);
    scene.add(chao);


    //Walls
    //A texture do bumpMap da parede
    bumpmapTexture = new THREE.TextureLoader().load("./Textures/brickwall_bump_map_temp.jpg");
    let muroObjeto = new THREE.Object3D()


    //Os vários muros que estão presentes no mapa
    muro = new THREE.Mesh(
        new THREE.BoxGeometry(10, 30, 150),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xE06666,
            bumpMap: bumpmapTexture,
            bumpScale: 0.40
        })

    );
    muro.position.set(320, 16, -100)
    muro.castShadow = true;
    muroObjeto.add(muro);


    muro = new THREE.Mesh(
        new THREE.BoxGeometry(450, 30, 10),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xE06666,
            bumpMap: bumpmapTexture,
            bumpScale: 0.40
        })

    );
    muro.position.set(100, 16, -170)
    muro.castShadow = true;
    muroObjeto.add(muro);


    muro = new THREE.Mesh(
        new THREE.BoxGeometry(10, 30, 290),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xE06666,
            bumpMap: bumpmapTexture,
            bumpScale: 0.40
        })

    );
    muro.position.set(-120, 16, 30)
    muro.castShadow = true;
    muroObjeto.add(muro);


    muro = new THREE.Mesh(
        new THREE.BoxGeometry(250, 30, 10),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xE06666,
            bumpMap: bumpmapTexture,
            bumpScale: 0.40
        })

    );
    muro.position.set(0, 16, 170)
    muro.castShadow = true;
    muroObjeto.add(muro);


    scene.add(muroObjeto);


    //Carcela
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

    //Terminal da carcela
    //TODO:Make a better terminal
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

    //Linhas do parque de estacionamento

    let espacoModelo = new THREE.Object3D();
    //Criação do modelo do espaço do parque
    function createParkingLines() {

        let geometriaLinha1 = new THREE.PlaneGeometry(40, 2, 32) // |
        let geometriaLinha2 = new THREE.PlaneGeometry(2, 30, 32) // -
        let materialLinha = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide
        });

        let linha = new THREE.Mesh(geometriaLinha1, materialLinha);
        linha.position.set(-90, 1, 160);
        linha.rotateX(Math.PI / 2)
        espacoModelo.add(linha);
         linha.receiveShadow = true

        linha = new THREE.Mesh(geometriaLinha2, materialLinha)
        linha.position.set(-109, 1, 145);
        linha.rotateX(Math.PI / 2);
        espacoModelo.add(linha);
         linha.receiveShadow = true

        linha = new THREE.Mesh(geometriaLinha1, materialLinha);
        linha.position.set(-90, 1, 130);
        linha.rotateX(Math.PI / 2)
     linha.receiveShadow = true
        espacoModelo.add(linha);
        scene.add(espacoModelo);

    }
    createParkingLines()


    //Criação de várias Linhas do parque
    for (let i = 0; i < 6; i++) {
        let espacoCopiado = new THREE.Object3D();
        espacoCopiado.copy(espacoModelo, true)
        espacoCopiado.position.set(0, 0.1, -30 * i)
        scene.add(espacoCopiado);

        espacoCopiado = new THREE.Object3D();
        espacoCopiado.copy(espacoModelo, true)
        espacoCopiado.position.set(-100, 0.1, 290 - i * 30)
        espacoCopiado.rotateY(Math.PI)
        scene.add(espacoCopiado);

        espacoCopiado = new THREE.Object3D();
        espacoCopiado.copy(espacoModelo, true)
        espacoCopiado.position.set(118, 0.1, -30 * i)
        scene.add(espacoCopiado);

        espacoCopiado = new THREE.Object3D();
        espacoCopiado.copy(espacoModelo, true)
        espacoCopiado.position.set(118, 0.1, -30 * i)
        scene.add(espacoCopiado);

        espacoCopiado = new THREE.Object3D();
        espacoCopiado.copy(espacoModelo, true)
        espacoCopiado.position.set(14, 0.1, 290 - i * 30)
        espacoCopiado.rotateY(Math.PI)
        scene.add(espacoCopiado);
    }

    //TODO:LINHAS DO PARQUE CARGA E DESCARGA

    let linhaDescarga = new THREE.Object3D();
    let geometriaLinha1 = new THREE.PlaneGeometry(170, 2, 32) // |
    let geometriaLinha2 = new THREE.PlaneGeometry(2, 120, 32) // -
    let geometriaLinha3 = new THREE.PlaneGeometry(3, 267, 32) // \ and /
    let materialLinha = new THREE.MeshBasicMaterial({
        color: 0xF1C232,
        side: THREE.DoubleSide
    });

    let linha = new THREE.Mesh(geometriaLinha1, materialLinha);
    linha.rotateX(Math.PI / 2);
    linha.position.set(20, 0, 0);
    linhaDescarga.add(linha);

    linha = new THREE.Mesh(geometriaLinha2, materialLinha);
    linha.rotateX(Math.PI / 2);
    linha.position.set(105, 0, -59);
    linhaDescarga.add(linha);

    linha = new THREE.Mesh(geometriaLinha1, materialLinha);
    linha.rotateX(Math.PI / 2);
    linha.position.set(20, 0, -118);
    linhaDescarga.add(linha);

    linha = new THREE.Mesh(geometriaLinha2, materialLinha);
    linha.rotateX(Math.PI / 2);
    linha.position.set(-66, 0, -59);
    linhaDescarga.add(linha);

    linha = new THREE.Mesh(geometriaLinha3, materialLinha);
    linha.rotateX(Math.PI / 3.55);
    linha.position.set(-66, 0, -118);
    linhaDescarga.add(linha);

    linha = new THREE.Mesh(geometriaLinha3, materialLinha);
    linha.rotateX(Math.PI / -3.54);
    linha.position.set(-66, 0, 0);
    linhaDescarga.add(linha);

    linhaDescarga.position.set(200, 1.1, -40)
    scene.add(linhaDescarga)

    //Road Lamps

    //Objeto 3D
    let posteIluminacaoMod = new THREE.Object3D();

    // Construido por Peças
    //Poste
    let peca = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 1, 44, 32),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x271D1D,
        })
    );
    peca.receiveShadow = true;
    peca.castShadow = true;
    posteIluminacaoMod.add(peca)
    //O conector entre o poste e a lampada
    peca = new THREE.Mesh(
        new THREE.BoxGeometry(9, 1.5, 1),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x271D1D,
        })
    );
    peca.receiveShadow = true;
    peca.castShadow = true;
    peca.position.set(0, 20, 0)
    posteIluminacaoMod.add(peca);
    //Lampada
    for (let i = 0; i < 2; i++) {
        //Caixa da Lampada
        peca = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 3, 5, 32),
            new THREE.MeshPhongMaterial({
                //FIXME: TEMPORARY COLORS
                color: 0x271D1D,
            })
        );
        peca.receiveShadow = true;
        peca.castShadow = true;
        peca.position.set(-5, 20, 0)
        posteIluminacaoMod.add(peca);
    }

    peca.position.set(5, 20, 0)

    for (let i = 0; i < 2; i++) {
        peca = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 2.5, 5, 32),
            new THREE.MeshLambertMaterial({
                //FIXME: TEMPORARY COLORS
                color: 0x271D1D,
                emissive: 0xF1D71D,
            })
        );
        peca.receiveShadow = true;
        peca.castShadow = true;
        peca.position.set(-5, 19, 0)
        posteIluminacaoMod.add(peca);
    }
    peca.position.set(5, 19, 0)
    posteIluminacaoMod.position.set(9, 22, 40)
    scene.add(posteIluminacaoMod)

    let posteIluminacaoCop = new THREE.Object3D();
    posteIluminacaoCop.copy(posteIluminacaoMod, true)
    posteIluminacaoCop.position.set(9, 22, 100)
    scene.add(posteIluminacaoCop);

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

    //Luzes relacionadas as lampadas

    for (let i = 0; i < 2; i++) {
        luzLampada = new THREE.SpotLight(0xFFFFFF, 1, 60, Math.PI / 3, 0.80);
        luzLampada.position.set(0, 40, 41);
        luzLampada.target.position.set(0, -360, 35);
        luzLampada.castShadow = true;
        luzLampada.autoUpdate = true;
        scene.add(luzLampada);
        scene.add(luzLampada.target);

    }
    luzLampada.position.set(15, 40, 41);

    for (let i = 0; i < 2; i++) {
        luzLampada = new THREE.SpotLight(0xFFFFFF, 1, 60, Math.PI / 3, 0.80);
        luzLampada.position.set(5, 40, 100);
        luzLampada.target.position.set(0, -360, 65);
        luzLampada.castShadow = true;
        luzLampada.autoUpdate = true;
        scene.add(luzLampada);
        scene.add(luzLampada.target);
    }
    luzLampada.position.set(15, 40, 100);

    //TODO:Adapt the Lamp Light to the day and night Cycle
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