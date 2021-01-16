//Todas as variaveis para a simulação
let scene, renderer, camera;

//Variáveis utilizadas para a mudança de metrologia na cidade
let sol, luzAmbiente, solCamera;
let solPotencia = 1;
let luzLampada;
var render_stats;
let posteIluminacaoMod;
let skyColor = 0x4488ee;
// Init
window.onload = function init() {
    // Cena
    scene = new THREE.Scene();
    //Camera
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(-400, 350, -100)
    scene.add(camera)
    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCSoftShadowMap;
    // Controlos (Remover após adicionar o carro e respetiva camera)
    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', function () {
        renderer.render(scene, camera);
    });
    //
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    // Funções para a criação do mundo
    renderStuff()
    criarAmbiente()
    areaJogavel()
    criarLoja()
    createLight()
    sunUpdate()
}
// Funçao que cria o ambiente
function criarAmbiente() {
    // Textura do Plano 
    // Semelhante ao projeto que serviu-nos de inspiração
    // Fonte : https://gist.githubusercontent.com/brunosimon/389129c84e8488e30bf8ed0d5e9fc12b/raw/7003eb44ded762dd53a662674c221bfbe0082a58/folio-2019-medium-article-floor.js
    const topoEsq = new THREE.Color(0xbcf797);
    const topoDir = new THREE.Color(0x87d955);
    const baixoDir = new THREE.Color(0x90c96d);
    const baixoEsq = new THREE.Color(0x88db56);
    const dataCor = new Uint8Array([
        Math.round(baixoEsq.r * 255), Math.round(baixoEsq.g * 255), Math.round(baixoEsq.b * 255),
        Math.round(baixoDir.r * 255), Math.round(baixoDir.g * 255), Math.round(baixoDir.b * 255),
        Math.round(topoEsq.r * 255), Math.round(topoEsq.g * 255), Math.round(topoEsq.b * 255),
        Math.round(topoDir.r * 255), Math.round(topoDir.g * 255), Math.round(topoDir.b * 255)
    ]);
    const texturaSolo = new THREE.DataTexture(dataCor, 2, 2, THREE.RGBFormat);
    texturaSolo.magFilter = THREE.LinearFilter;
    texturaSolo.needsUpdate = true;
    // Plano
    let plano = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10), new THREE.MeshPhongMaterial({map: texturaSolo, side: THREE.DoubleSide}));
    plano.position.set(0, 0, 0);
    plano.rotation.x = (Math.PI / 2);
    scene.add(plano);
    //Skybox
    let skybox = new THREE.Mesh(new THREE.SphereGeometry(1000, 1000, 10, 10), new THREE.MeshBasicMaterial({color: skyColor, side: THREE.DoubleSide}));
    scene.add(skybox);
}

// Função para criar a área onde o utilizador vai movimentar o carro
function areaJogavel() {
    let pavimento, pavimento_material;
    let solo = new THREE.Object3D();
    // Textura do Bump Map do Pavimento
    let bumpMapPavimento = new THREE.TextureLoader().load("./Textures/Road_bump_map_temp.jpg");
    // Material do Pavimento
    pavimento_material = new THREE.MeshPhongMaterial({color: 0x101010, bumpMap: bumpMapPavimento, bumpScale: 0.08});
    // Zona do Parque de Estacionamento
    pavimento = new THREE.Mesh(new THREE.BoxGeometry(200, 0.8, 400), pavimento_material);
    pavimento.position.set(-100, 0.6, 0);
    pavimento.receiveShadow = true;
    solo.add(pavimento);
    // Área das Entregas
    pavimento = new THREE.Mesh(new THREE.BoxGeometry(200, 0.8, 200), pavimento_material);
    pavimento.position.set(100, 0.6, -100);
    pavimento.receiveShadow = true;
    solo.add(pavimento);
    scene.add(solo);
    // Muro
    // Textura do Bump Map do Muro
    bumpMapMuro = new THREE.TextureLoader().load("./Textures/brickwall_bump_map_temp.jpg");
    let muro = new THREE.Object3D()
    let muro_material = new THREE.MeshPhongMaterial({color: 0xcccccc, bumpMap: bumpMapMuro, bumpScale: 0.16});
        // Muros (Exteriores)
        let n_muros = 4, sub_muro, muro_geometry;
        for (let i = 0; i < n_muros; i++) {
            muro_geometry = new THREE.BoxGeometry((i % 2 == 0 ? 10 : (i == 1 ? 200 : 400)), 22, i % 2 == 0 ? (i == 0 ? 300 : 200) : 10);
            sub_muro = new THREE.Mesh(muro_geometry, muro_material);
            sub_muro.position.set(i % 2 == 0 ? (i == 0 ? -195 : 195) : (i == 1 ? -100 : 0), 12, i % 2 == 0 ? (i == 0 ? 50 : -100) : (i == 1 ? 195 : -195))
            sub_muro.castShadow = true;
            muro.add(sub_muro);
        }
        // Muros (Interiores)
            //Muro da ala das cargas e descargas
            let muro_i_geometry = new THREE.BoxGeometry(10, 22, 100);
            let muro_i = new THREE.Mesh(muro_i_geometry, muro_material);
            muro_i.position.set(5, 12, -50);
            muro_i.castShadow = true;
            muro.add(muro_i);
            //Muro laterais ao estacionamento
            let n_muros_laterais = 2, muro_lateral, muro_lateral_g;
            for(let i = 0; i < n_muros_laterais; i++) {
                muro_lateral_g = new THREE.BoxGeometry(70, 22, 10);
                muro_lateral = new THREE.Mesh(muro_lateral_g, muro_material);
                muro_lateral.position.set(i ==0 ? -165 : -25, 12, -105);
                muro.add(muro_lateral);
            }
    scene.add(muro);
    // Passeio
        // Passeio a frente do estacionamento
        let n_passeios = 2, passeio, passeio_g, passeio_m;
        passeio_m = new THREE.MeshPhongMaterial({color: 0x606060});
        for (let i = 0; i < n_passeios; i++){
            passeio_g = new THREE.PlaneGeometry(19, 290);
            passeio = new THREE.Mesh(passeio_g, passeio_m);
            passeio.position.set(i == 0 ? -180.5 : -9.5, 1.06, 45);
            passeio.rotation.x = -Math.PI / 2;
            scene.add(passeio);
        }
        // Passeio lateral ao estacionamento
        for (let i = 0; i < (n_passeios * 2); i++){
            passeio_g = new THREE.PlaneGeometry(41, 9)
            passeio = new THREE.Mesh(passeio_g, passeio_m);
            passeio.position.set(i % 2 == 0 ? -150.5 : -39.5, 1.06, i < 2 ? -95.5 : 185.5);
            passeio.rotation.x = -Math.PI / 2;
            scene.add(passeio);
        }
    //Carcela
    let portaoObjeto = new THREE.Object3D()
    let portaoPoste, portaoTerminalPrincipal;
    portaoPoste = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 76, 32),
        new THREE.MeshPhongMaterial({
            //FIXME:TEMPORARY COLORS
            color: 0xd06429
        }));

    portaoPoste.castShadow = true;
    portaoPoste.receiveShadow = true;

    portaoPoste.rotateX(Math.PI / 2);
    portaoPoste.position.set(-156, 12, -148)
    portaoObjeto.add(portaoPoste);

    //Terminal Principal da carcela
    portaoTerminalPrincipal = new THREE.Mesh(
        new THREE.BoxGeometry(5, 16, 5),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x323232,
        })

    );

    portaoTerminalPrincipal.castShadow = true;
    portaoTerminalPrincipal.receiveShadow = true;

    portaoTerminalPrincipal.position.set(-156, 9, -186)
    portaoObjeto.add(portaoTerminalPrincipal);
    let portaoESTerminal = new THREE.Object3D
    //Terminal da entrada e Saida no parque
    let corpoterminal = new THREE.Mesh(
        new THREE.BoxGeometry(8, 10, 2),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0xb9ba10,
        })
    )

    corpoterminal.receiveShadow = true;
    portaoESTerminal.add(corpoterminal)

    let ecraterminal = new THREE.Mesh(
        new THREE.BoxGeometry(6, 4, 1),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x323232,
        })
    )
    ecraterminal.position.set(0, 1, 1)
    ecraterminal.receiveShadow = true;
    portaoESTerminal.add(ecraterminal)

    //leitor infravermelhos
    let leitorTerminal = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 0.5),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x5d0011,
        })
    )

    leitorTerminal.position.set(2, -3, 1)
    portaoESTerminal.add(leitorTerminal)

    // A case do leitor infravermelhos
    leitorTerminal = new THREE.Mesh(
        new THREE.BoxGeometry(2, 3, 0.5),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x000000,
        })
    )

    leitorTerminal.receiveShadow = true;
    leitorTerminal.position.set(2, -3, 0.9)
    portaoESTerminal.add(leitorTerminal)

    //Para dar o ticket
    leitorTerminal = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 0.1, 32),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x000000,
            side: THREE.DoubleSide
        })
    )
    leitorTerminal.receiveShadow = true;
    leitorTerminal.position.set(-1.5, -3, 1.1)
    portaoESTerminal.add(leitorTerminal)


    portaoESTerminal.position.set(-100, 10, -10)
    portaoObjeto.add(portaoESTerminal);
    portaoESTerminal.position.set(-130, 14, -189)
    portaoObjeto.add(portaoESTerminal);

    let portaoETerminal = new THREE.Object3D();
    portaoETerminal.copy(portaoESTerminal, true);
    portaoObjeto.add(portaoETerminal);
    portaoETerminal.rotateY(Math.PI);
    portaoETerminal.position.set(-180, 14, -101);


    scene.add(portaoObjeto);


    // Linhas do parque de estacionamento
    let areaEstacionamento = new THREE.Object3D();
    let areaEstacionamento2 = new THREE.Object3D();
    // Criação do modelo do espaço do parque
    let n_linhas = 3, linha, linha_geometry, linha_material;
    for (let i = 0; i < n_linhas; i++) {
        linha_geometry = new THREE.PlaneGeometry(i % 2 == 0 ? 40 : 2, i % 2 == 0 ? 2 : 32);
        linha_material = new THREE.MeshPhongMaterial({color: 0xf4f4f4});
        linha = new THREE.Mesh(linha_geometry, linha_material);
        linha.receiveShadow = true;
        linha.rotation.x = -Math.PI / 2;
        linha.position.set(i % 2 == 0 ? -150 : -170, 1.05, i % 2 == 0 ? (i == 0 ? 180 : 150) : 165);
        areaEstacionamento.add(linha);
    }
    scene.add(areaEstacionamento);
    let test = new THREE.Object3D;
    for (let i = 0; i < 8; i++) {
        let areaEstacionamentoCopia = new THREE.Object3D();
        areaEstacionamentoCopia.copy(areaEstacionamento, true);
        areaEstacionamento.position.set(0, 0, -30 * (i + 1));
        test.add(areaEstacionamentoCopia);
    }
    scene.add(test);
    // Criação do modelo do espaço do parque 2
    let n_linhas2 = 3, linha2, linha_geometry2, linha_material2;
    for (let i = 0; i < n_linhas2; i++) {
        linha_geometry2 = new THREE.PlaneGeometry(i % 2 == 0 ? 40 : 2, i % 2 == 0 ? 2 : 32);
        linha_material2 = new THREE.MeshPhongMaterial({color: 0xf4f4f4});
        linha2 = new THREE.Mesh(linha_geometry2, linha_material2);
        linha2.receiveShadow = true;
        linha2.rotation.x = -Math.PI / 2;
        linha2.position.set(i % 2 == 0 ? -40 : -20, 1.05, i % 2 == 0 ? (i == 0 ? 180 : 150) : 165);
        areaEstacionamento2.add(linha2);
    }
    scene.add(areaEstacionamento2);
    let test2 = new THREE.Object3D;
    for (let i = 0; i < 8; i++) {
        let areaEstacionamentoCopia2 = new THREE.Object3D();
        areaEstacionamentoCopia2.copy(areaEstacionamento2, true);
        areaEstacionamento2.position.set(0, 0, -30 * (i + 1));
        test2.add(areaEstacionamentoCopia2);
    }
    scene.add(test2);



    /*let linhaDescarga = new THREE.Object3D();
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
    scene.add(linhaDescarga)*/

    //Lampadas

    //Objeto 3D
    posteIluminacaoMod = new THREE.Object3D();

    // Construido por Peças
    //Poste
    let peca = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 1, 44, 32),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x5c5656,
        })
    );
    peca.receiveShadow = true;
    peca.castShadow = true;
    posteIluminacaoMod.add(peca)
    //O conector entre o poste e a lampada
    peca = new THREE.Mesh(
        new THREE.BoxGeometry(14, 1.5, 1),
        new THREE.MeshPhongMaterial({
            //FIXME: TEMPORARY COLORS
            color: 0x5c5656,
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
                color: 0x5c5656,
            })
        );
        peca.receiveShadow = true;
        peca.castShadow = true;
        peca.position.set(-8, 20, 0)
        posteIluminacaoMod.add(peca);
    }

    peca.position.set(8, 20, 0)

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
        peca.position.set(-8, 19.6, 0)
        posteIluminacaoMod.add(peca);
    }
    peca.position.set(8, 19.6, 0)
    posteIluminacaoMod.position.set(-50, 23, 40)
    scene.add(posteIluminacaoMod)

    console.log("Parking lot criado com sucesso")

}
// Função para a criação da loja
function criarLoja() {
    let baseLoja, paredeLoja, telhadoLoja, frontalLoja, vidroLoja, interiorLoja, portaLoja, anuncioLoja, garagemLoja;
    // Base da Loja
    let baseLoja_g = new THREE.BoxGeometry(200, 0.8, 200);
    let baseLoja_m = new THREE.MeshPhongMaterial({
        color: 0xf2b716
    });
    baseLoja = new THREE.Mesh(baseLoja_g, baseLoja_m);
    baseLoja.position.set(100, 0.6, 100);
    scene.add(baseLoja);
    // Parede da Loja
    paredeLoja = new THREE.Object3D();
    // Parede Exterior
    for (let i = 0; i < 3; i++) {
        let ex_paredeLoja_g = new THREE.BoxGeometry(i % 2 == 0 ? 190 : 10, 40, i % 2 == 0 ? 10 : 200);
        let ex_paredeLoja_m = new THREE.MeshPhongMaterial({
            color: 0xf2b716
        });
        let ex_paredeLoja = new THREE.Mesh(ex_paredeLoja_g, ex_paredeLoja_m);
        ex_paredeLoja.position.set(i % 2 == 0 ? 105 : 195, 21, i % 2 == 0 ? (i == 0 ? 5 : 195) : 100);
        paredeLoja.add(ex_paredeLoja);
    }
    // Parede Interior
    let in_paredeLoja_g = new THREE.BoxGeometry(10, 40, 180);
    let in_paredeLoja_m = new THREE.MeshPhongMaterial({
        color: 0xf2b716
    });
    let in_paredeLoja = new THREE.Mesh(in_paredeLoja_g, in_paredeLoja_m);
    in_paredeLoja.position.set(115, 21, 100);
    paredeLoja.add(in_paredeLoja);
    scene.add(paredeLoja);
    // Telhado da Loja
    let telhadoLoja_g = new THREE.BoxGeometry(210, 4, 210);
    let telhadoLoja_m = new THREE.MeshPhongMaterial({
        color: 0x202020
    });
    telhadoLoja = new THREE.Mesh(telhadoLoja_g, telhadoLoja_m);
    telhadoLoja.position.set(100, 43, 100);
    scene.add(telhadoLoja);
    // Frontal da Loja
    frontalLoja = new THREE.Object3D();
    // Postes
    for (let i = 0; i < 3; i++) {
        let poste_frontalLoja_g = new THREE.BoxGeometry(10, 40, i == 1 ? 60 : 10);
        let poste_frontalLoja_m = new THREE.MeshPhongMaterial({
            color: 0xf2b716
        });
        let poste_frontalLoja = new THREE.Mesh(poste_frontalLoja_g, poste_frontalLoja_m);
        poste_frontalLoja.position.set(5, 21, i % 2 == 0 ? (i == 0 ? 5 : 45) : 170);
        frontalLoja.add(poste_frontalLoja);
    }
    // Parte Superior
    let sup_frontalLoja_g = new THREE.BoxGeometry(10, 10, 180);
    let sup_frontalLoja_m = new THREE.MeshPhongMaterial({
        color: 0xf2b716
    });
    let sup_frontalLoja = new THREE.Mesh(sup_frontalLoja_g, sup_frontalLoja_m);
    sup_frontalLoja.position.set(5, 36, 100);
    frontalLoja.add(sup_frontalLoja);
    // Parte Inferior
    let inf_frontalLoja_g = new THREE.BoxGeometry(10, 4, 90);
    let inf_frontalLoja_m = new THREE.MeshPhongMaterial({
        color: 0xf2b716
    });
    let inf_frontalLoja = new THREE.Mesh(inf_frontalLoja_g, inf_frontalLoja_m);
    inf_frontalLoja.position.set(5, 3, 95);
    frontalLoja.add(inf_frontalLoja);
    scene.add(frontalLoja);
    // Vidro da Loja
    vidroLoja = new THREE.Object3D();
    // Armação
    let n_armacoes = 4,
        armacao, armacao_g, armacao_m;
    for (let i = 0; i < n_armacoes; i++) {
        armacao_g = new THREE.BoxGeometry(6, i % 2 == 0 ? 2 : 26, i % 2 == 0 ? 90 : 2);
        armacao_m = new THREE.MeshPhongMaterial({
            color: 0x202020
        });
        armacao = new THREE.Mesh(armacao_g, armacao_m);
        armacao.position.set(5, i % 2 == 0 ? (i == 0 ? 6 : 30) : 19, i % 2 == 0 ? 95 : (i == 1 ? 51 : 139));
        vidroLoja.add(armacao);
    }
    // Vidro
    let vidro_g = new THREE.BoxGeometry(2, 26, 86);
    let vidro_m = new THREE.MeshPhongMaterial({
        color: 0x9ce9ff,
        transparent: true,
        opacity: 0.8
    });
    let vidro = new THREE.Mesh(vidro_g, vidro_m);
    vidro.position.set(5, 19, 95);
    vidroLoja.add(vidro);
    scene.add(vidroLoja);
    // Interior Loja
    interiorLoja = new THREE.Object3D();
    let n_prateleiras = 12,
        prateleira, prateleira_g, prateleira_m;
    for (let i = 0; i < (n_prateleiras / 3); i++) { //4
        for (let j = 0; j < (n_prateleiras / 4); j++) { //3
            prateleira_g = new THREE.BoxGeometry(10, 14, 40);
            prateleira_m = new THREE.MeshPhongMaterial({
                color: 0x404040
            });
            prateleira = new THREE.Mesh(prateleira_g, prateleira_m);
            prateleira.position.set(35 + (i * 20), 8, 40 + (j * 60));
            interiorLoja.add(prateleira);
        }
    }
    scene.add(interiorLoja);
    // Porta da Loja
    portaLoja = new THREE.Object3D();
    // Armação da Porta
    let n_armacoes_porta = 5,
        armacao_porta, armacao_porta_g, armacao_porta_m;
    for (let i = 0; i < n_armacoes_porta; i++) {
        armacao_porta_g = new THREE.BoxGeometry(8, i % 2 == 0 ? 30 : (i == 1 ? 1 : 2), i % 2 == 0 ? 2 : 30);
        armacao_porta_m = new THREE.MeshPhongMaterial({
            color: 0x202020
        });
        armacao_porta = new THREE.Mesh(armacao_porta_g, armacao_porta_m);
        armacao_porta.position.set(5, i % 2 == 0 ? 16 : (i == 1 ? 1.5 : 30), i % 2 == 0 ? (i == 0 ? 11 : (i == 2 ? 25 : 39)) : 25);
        portaLoja.add(armacao_porta);
    }
    // Vidro da Porta
    let n_vidros_porta = 2,
        vidro_porta, vidro_porta_g, vidro_porta_m;
    for (let i = 0; i < n_vidros_porta; i++) {
        vidro_porta_g = new THREE.BoxGeometry(2, 27, 12);
        vidro_porta_m = new THREE.MeshPhongMaterial({
            color: 0x9ce9ff,
            transparent: true,
            opacity: 0.8
        });
        vidro_porta = new THREE.Mesh(vidro_porta_g, vidro_porta_m);
        vidro_porta.position.set(5, 15.5, i == 0 ? 18 : 32);
        portaLoja.add(vidro_porta);
    }
    scene.add(portaLoja);
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
            skyColor = Ox332299;
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
            skyColor = 0x4488ee;
            sol.position.set(sol.position.x, sol.position.y + 25, sol.position.z + 25);
            solPotencia = solPotencia + 0.0125;
            sol.power = solPotencia * 4 * Math.PI;
            sol.castShadow = true
        }
        console.log(sol.position)

    }, 5000);
}

// Função do Render
function renderStuff() {
    requestAnimationFrame(renderStuff);
    renderer.render(scene, camera);
}