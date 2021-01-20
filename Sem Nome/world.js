//Todas as variaveis para a simulação
let scene, renderer, camera;
let luzDirecional, hemisphereLight;
let luz_frontal_esq, luz_frontal_dir, luz_traseira_esq, luz_traseira_dir;
let objetos; 
let curvaLuz;
let position = 0;
let mudancaCiclo = true;
let corAmbiente, valorCorRGB = 0;
let boost = 1;
let trocar_camera = false;
let carro = {
    frente: false, direita: false
};
let Rx1, Rx2; // Rodas Frontais
let lampadaParque = []
// Init
window.onload = function init() {
    // Cena
    scene = new THREE.Scene();
    //Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
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
    criarAmbiente()
    areaJogavel()
    criarLoja()
    criarLuzes()
    criarCarro()
    render()
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
    let plano = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1500, 10, 10), new THREE.MeshPhongMaterial({map: texturaSolo, side: THREE.DoubleSide}));
    plano.position.set(0, 0, 0);
    plano.receiveShadow = true;
    plano.rotation.x = (Math.PI / 2);
    scene.add(plano);
    // Skybox
    let skybox = new THREE.Mesh(new THREE.SphereGeometry(1500, 1500, 10, 10), new THREE.MeshBasicMaterial({color: 0x59acbd, side: THREE.DoubleSide}));
    scene.add(skybox);
    // Árvores (Isto está a pedreiro)
    let arvore = new THREE.Object3D();
    let tronco_g = new THREE.CylinderGeometry(5, 5, 20, 5);
    let tronco_m = new THREE.MeshPhongMaterial({color: 0x3b2d07, shininess: 0});
    let tronco = new THREE.Mesh(tronco_g, tronco_m);
    tronco.position.set(0, 11, 300);
    tronco.castShadow = true;
    tronco.receiveShadow = true;
    arvore.add(tronco);
    let folhas_g = new THREE.SphereGeometry(18, 12, 12);
    let folhas_m = new THREE.MeshPhongMaterial({color: 0x5b944d, shininess: 0.1});
    let folhas = new THREE.Mesh(folhas_g, folhas_m);
    folhas.position.set(0,34,300);
    folhas.castShadow = true;
    folhas.receiveShadow = true;
    arvore.add(folhas);
    scene.add(arvore)
    let arvore2 = new THREE.Object3D();
    arvore2.copy(arvore, true);
    arvore2.position.set(100, 0, -600);
    scene.add(arvore2);
    let arvore3 = new THREE.Object3D();
    arvore3.copy(arvore, true);
    arvore3.position.set(260, 0, -300);
    scene.add(arvore3);
    let arvore4 = new THREE.Object3D();
    arvore4.copy(arvore, true);
    arvore4.position.set(-260, 0, -400);
    scene.add(arvore4);
    let arvore5 = new THREE.Object3D();
    arvore5.copy(arvore, true);
    arvore5.position.set(-300, 0, -680);
    scene.add(arvore5);
    let arvore6 = new THREE.Object3D();
    arvore6.copy(arvore, true);
    arvore6.position.set(200, 0, 100);
    scene.add(arvore6);
}

// Função para criar a área onde o utilizador vai movimentar o carro
function areaJogavel() {
    let pavimento, pavimento_material;
    let solo = new THREE.Object3D();
    // Textura do Bump Map do Pavimento
    let bumpMapPavimento = new THREE.TextureLoader().load("./Textures/Road_bump_map_temp.jpg");
    // Material do Pavimento
    pavimento_material = new THREE.MeshPhongMaterial({color: 0x101010, bumpMap: bumpMapPavimento, bumpScale: 0.08, shininess: 0});
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
    //bumpMapMuro = new THREE.TextureLoader().load("./Textures/brickwall_bump_map_temp.jpg");
    let muro = new THREE.Object3D()
    let muro_material = new THREE.MeshPhongMaterial({color: 0xcccccc, shininess: 0}); //bumpMap: bumpMapMuro, bumpScale: 0.16});
        // Muros (Exteriores)
        let n_muros = 4, sub_muro, muro_geometry;
        for (let i = 0; i < n_muros; i++) {
            muro_geometry = new THREE.BoxGeometry((i % 2 == 0 ? 10 : (i == 1 ? 200 : 400)), 22, i % 2 == 0 ? (i == 0 ? 300 : 200) : 10);
            sub_muro = new THREE.Mesh(muro_geometry, muro_material);
            sub_muro.position.set(i % 2 == 0 ? (i == 0 ? -195 : 195) : (i == 1 ? -100 : 0), 12, i % 2 == 0 ? (i == 0 ? 50 : -100) : (i == 1 ? 195 : -195))
            sub_muro.castShadow = true;
            sub_muro.receiveShadow = true;
            muro.add(sub_muro);
        }
        // Muros (Interiores)
            //Muro da ala das cargas e descargas
            let muro_i_geometry = new THREE.BoxGeometry(10, 22, 100);
            let muro_i = new THREE.Mesh(muro_i_geometry, muro_material);
            muro_i.position.set(5, 12, -50);
            muro_i.castShadow = true;
            muro_i.receiveShadow = true;
            muro.add(muro_i);
            //Muro laterais ao estacionamento
            let n_muros_laterais = 2, muro_lateral, muro_lateral_g;
            for(let i = 0; i < n_muros_laterais; i++) {
                muro_lateral_g = new THREE.BoxGeometry(70, 22, 10);
                muro_lateral = new THREE.Mesh(muro_lateral_g, muro_material);
                muro_lateral.position.set(i ==0 ? -165 : -25, 12, -105);
                muro_lateral.castShadow = true;
                muro_lateral.receiveShadow = true;
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
            passeio.receiveShadow = true;
            scene.add(passeio);
        }
        // Passeio lateral ao estacionamento
        for (let i = 0; i < (n_passeios * 2); i++){
            passeio_g = new THREE.PlaneGeometry(41, 9)
            passeio = new THREE.Mesh(passeio_g, passeio_m);
            passeio.position.set(i % 2 == 0 ? -150.5 : -39.5, 1.06, i < 2 ? -95.5 : 185.5);
            passeio.rotation.x = -Math.PI / 2;
            passeio.receiveShadow = true;
            scene.add(passeio);
        }
    // Terminal
    let terminal = new THREE.Object3D(); 
        // Cancela
        let cancela, caixa_terminal;
        cancela = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 54, 32), new THREE.MeshPhongMaterial({color: 0xd06429}));
        cancela.castShadow = true;
        cancela.receiveShadow = true;
        cancela.rotateX(Math.PI / 2);
        cancela.position.set(-165, 12, -147)
        terminal.add(cancela);
        // Caixa da cancela
        caixa_terminal = new THREE.Mesh(new THREE.BoxGeometry(6, 14, 6), new THREE.MeshPhongMaterial({color: 0x323232}));
        caixa_terminal.castShadow = true;
        caixa_terminal.receiveShadow = true;
        caixa_terminal.position.set(-165, 8, -177)
        terminal.add(caixa_terminal);

        //Terminal da entrada e saída do parque de estacionamento
        let terminalES = new THREE.Object3D();
        let corpoterminal = new THREE.Mesh(new THREE.BoxGeometry(8, 10, 2), new THREE.MeshPhongMaterial({color: 0xedc72d}));
        corpoterminal.receiveShadow = true;
        corpoterminal.castShadow = true;
        terminalES.add(corpoterminal);

        // Ecra do terminal
        let ecraterminal = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 1), new THREE.MeshPhongMaterial({color: 0x323232}));
        ecraterminal.position.set(0, 1, 1)
        ecraterminal.receiveShadow = true;
        ecraterminal.castShadow = true;
        terminalES.add(ecraterminal);
        // Leitor infravermelhos

        let leitorTerminal = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.5), new THREE.MeshPhongMaterial({color: 0x5d0011}));
        leitorTerminal.position.set(2, -3, 1.1);
        leitorTerminal.receiveShadow = true;
        leitorTerminal.castShadow = true;
        terminalES.add(leitorTerminal);
        // A case do leitor infravermelhos

        let leitorCaseTerminal = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.5), new THREE.MeshPhongMaterial({color: 0x000000}));
        leitorCaseTerminal.receiveShadow = true;
        leitorCaseTerminal.castShadow = true;
        leitorCaseTerminal.position.set(2, -3, 1);
        terminalES.add(leitorCaseTerminal);
        //Para dar o ticket	
        let leitorTerminalTicket = new THREE.Mesh(	
            new THREE.PlaneGeometry(2, 0.1, 32),	
            new THREE.MeshPhongMaterial({	
                color: 0x000000,	
                side: THREE.DoubleSide	
            })	
        )	
        leitorTerminalTicket.receiveShadow = true;	
        leitorTerminalTicket.position.set(-1.5, -3, 1.1)	
        terminalES.add(leitorTerminalTicket)

        terminalES.position.set(-144, 14, -189);
        terminal.add(terminalES);
        let portaoETerminal = new THREE.Object3D();
        portaoETerminal.copy(terminalES, true);
        terminal.add(portaoETerminal);
        portaoETerminal.rotateY(Math.PI);
        portaoETerminal.position.set(-186, 14, -111);
    scene.add(terminal);
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
    let lugaresEstacionamento = new THREE.Object3D;
    for (let i = 0; i < 8; i++) {
        let areaEstacionamentoCopia = new THREE.Object3D();
        areaEstacionamentoCopia.copy(areaEstacionamento, true);
        areaEstacionamento.position.set(0, 0, -30 * (i + 1));
        lugaresEstacionamento.add(areaEstacionamentoCopia);
    }
    scene.add(lugaresEstacionamento);
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
    let lugaresEstacionamento2 = new THREE.Object3D;
    for (let i = 0; i < 8; i++) {
        let areaEstacionamentoCopia2 = new THREE.Object3D();
        areaEstacionamentoCopia2.copy(areaEstacionamento2, true);
        areaEstacionamento2.position.set(0, 0, -30 * (i + 1));
        lugaresEstacionamento2.add(areaEstacionamentoCopia2);
    }
    scene.add(lugaresEstacionamento2);
    // Poste de iluminação
    let posteIluminacaoMod = new THREE.Object3D();
    // Poste
    let peca = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 44, 32), new THREE.MeshPhongMaterial({color: 0x5c5656, shininess: 0}));
    peca.receiveShadow = true;
    peca.castShadow = true;
    posteIluminacaoMod.add(peca);
    // Conector entre o poste e lampada
    peca = new THREE.Mesh(new THREE.BoxGeometry(14, 1.5, 1), new THREE.MeshPhongMaterial({color: 0x5c5656}));
    peca.receiveShadow = true;
    peca.castShadow = true;
    peca.position.set(0, 20, 0)
    posteIluminacaoMod.add(peca);
    //Lampada
    for (let i = 0; i < 2; i++) {
        //Caixa da Lampada
        peca = new THREE.Mesh(new THREE.CylinderGeometry(1, 3, 5, 32), new THREE.MeshPhongMaterial({color: 0x5c5656}));
        peca.receiveShadow = true;
        peca.castShadow = true;
        peca.position.set(i==0?-8:8, 20, 0)
        posteIluminacaoMod.add(peca);
    }
    for (let i = 0; i < 2; i++) {
        peca = new THREE.Mesh(new THREE.CylinderGeometry(1, 2.5, 5, 32), new THREE.MeshLambertMaterial({color: 0x271D1D, emissive: 0xF1D71D}));
        peca.receiveShadow = true;
        peca.castShadow = true;
        peca.position.set(-8, 19.6, 0)
        posteIluminacaoMod.add(peca);
    }
    peca.position.set(8, 19.6, 0);
    posteIluminacaoMod.rotation.y = Math.PI/2;
    posteIluminacaoMod.position.set(-180, 23, 45);
    scene.add(posteIluminacaoMod);
    let n_copias_poste_iluminacao = 2, copia_poste_iluminacao;
    for (let i = 0; i < n_copias_poste_iluminacao; i++){
        copia_poste_iluminacao = new THREE.Object3D();
        copia_poste_iluminacao.copy(posteIluminacaoMod, true);
        copia_poste_iluminacao.position.set(-180, 23, i == 1? 140 : -40);
        scene.add(copia_poste_iluminacao);
    }
}
// Função para a criação da loja
function criarLoja() {
    let baseLoja, paredeLoja, telhadoLoja, frontalLoja, vidroLoja, interiorLoja, portaLoja;
    // Base da Loja
    let baseLoja_g = new THREE.BoxGeometry(200, 0.8, 200);
    let baseLoja_m = new THREE.MeshPhongMaterial({color: 0xf2b716});
    baseLoja = new THREE.Mesh(baseLoja_g, baseLoja_m);
    baseLoja.position.set(100, 0.6, 100);
    baseLoja.receiveShadow = true;
    scene.add(baseLoja);
    // Parede da Loja
    paredeLoja = new THREE.Object3D();
    // Parede Exterior
    for (let i = 0; i < 3; i++) {
        let ex_paredeLoja_g = new THREE.BoxGeometry(i % 2 == 0 ? 190 : 10, 40, i % 2 == 0 ? 10 : 200);
        let ex_paredeLoja_m = new THREE.MeshPhongMaterial({color: 0xf2b716});
        let ex_paredeLoja = new THREE.Mesh(ex_paredeLoja_g, ex_paredeLoja_m);
        ex_paredeLoja.position.set(i % 2 == 0 ? 105 : 195, 21, i % 2 == 0 ? (i == 0 ? 5 : 195) : 100);
        ex_paredeLoja.receiveShadow = true;
        ex_paredeLoja.castShadow = true;
        paredeLoja.add(ex_paredeLoja);
    }
    // Parede Interior
    let in_paredeLoja_g = new THREE.BoxGeometry(10, 40, 180);
    let in_paredeLoja_m = new THREE.MeshPhongMaterial({color: 0xf2b716});
    let in_paredeLoja = new THREE.Mesh(in_paredeLoja_g, in_paredeLoja_m);
    in_paredeLoja.position.set(115, 21, 100);
    in_paredeLoja.castShadow = true;
    in_paredeLoja.receiveShadow = true;
    paredeLoja.add(in_paredeLoja);
    scene.add(paredeLoja);
    // Telhado da Loja
    let telhadoLoja_g = new THREE.BoxGeometry(210, 4, 210);
    let telhadoLoja_m = new THREE.MeshPhongMaterial({color: 0x202020});
    telhadoLoja = new THREE.Mesh(telhadoLoja_g, telhadoLoja_m);
    telhadoLoja.position.set(100, 43, 100);
    telhadoLoja.castShadow = true;
    telhadoLoja.receiveShadow = true;
    scene.add(telhadoLoja);
    // Frontal da Loja
    frontalLoja = new THREE.Object3D();
    // Postes
    for (let i = 0; i < 3; i++) {
        let poste_frontalLoja_g = new THREE.BoxGeometry(10, 40, i == 1 ? 60 : 10);
        let poste_frontalLoja_m = new THREE.MeshPhongMaterial({color: 0xf2b716});
        let poste_frontalLoja = new THREE.Mesh(poste_frontalLoja_g, poste_frontalLoja_m);
        poste_frontalLoja.position.set(5, 21, i % 2 == 0 ? (i == 0 ? 5 : 45) : 170);
        poste_frontalLoja.castShadow = true;
        poste_frontalLoja.receiveShadow = true;
        frontalLoja.add(poste_frontalLoja);
    }
    // Parte Superior
    let sup_frontalLoja_g = new THREE.BoxGeometry(10, 10, 180);
    let sup_frontalLoja_m = new THREE.MeshPhongMaterial({color: 0xf2b716});
    let sup_frontalLoja = new THREE.Mesh(sup_frontalLoja_g, sup_frontalLoja_m);
    sup_frontalLoja.position.set(5, 36, 100);
    sup_frontalLoja.castShadow = true;
    sup_frontalLoja.receiveShadow = true;
    frontalLoja.add(sup_frontalLoja);
    // Parte Inferior
    let inf_frontalLoja_g = new THREE.BoxGeometry(10, 4, 90);
    let inf_frontalLoja_m = new THREE.MeshPhongMaterial({color: 0xf2b716});
    let inf_frontalLoja = new THREE.Mesh(inf_frontalLoja_g, inf_frontalLoja_m);
    inf_frontalLoja.position.set(5, 3, 95);
    inf_frontalLoja.castShadow = true;
    inf_frontalLoja.receiveShadow = true;
    frontalLoja.add(inf_frontalLoja);
    scene.add(frontalLoja);
    // Vidro da Loja
    vidroLoja = new THREE.Object3D();
    // Armação
    let n_armacoes = 4, armacao, armacao_g, armacao_m;
    for (let i = 0; i < n_armacoes; i++) {
        armacao_g = new THREE.BoxGeometry(6, i % 2 == 0 ? 2 : 26, i % 2 == 0 ? 90 : 2);
        armacao_m = new THREE.MeshPhongMaterial({color: 0x202020});
        armacao = new THREE.Mesh(armacao_g, armacao_m);
        armacao.position.set(5, i % 2 == 0 ? (i == 0 ? 6 : 30) : 19, i % 2 == 0 ? 95 : (i == 1 ? 51 : 139));
        armacao.castShadow = true;
        armacao.receiveShadow = true;
        vidroLoja.add(armacao);
    }
    // Vidro
    let vidro_g = new THREE.BoxGeometry(2, 26, 86);
    let vidro_m = new THREE.MeshPhongMaterial({color: 0x9ce9ff, transparent: true, opacity: 0.8});
    let vidro = new THREE.Mesh(vidro_g, vidro_m);
    vidro.position.set(5, 19, 95);
    vidroLoja.add(vidro);
    vidro.castShadow = true;
    scene.add(vidroLoja);
    // Interior Loja
    interiorLoja = new THREE.Object3D();
    let n_prateleiras = 12, prateleira, prateleira_g, prateleira_m;
    for (let i = 0; i < (n_prateleiras / 3); i++) { //4
        for (let j = 0; j < (n_prateleiras / 4); j++) { //3
            prateleira_g = new THREE.BoxGeometry(10, 14, 40);
            prateleira_m = new THREE.MeshPhongMaterial({color: 0x404040});
            prateleira = new THREE.Mesh(prateleira_g, prateleira_m);
            prateleira.position.set(35 + (i * 20), 8, 40 + (j * 60));
            prateleira.castShadow = true;
            prateleira.receiveShadow = true;
            interiorLoja.add(prateleira);
        }
    }
    scene.add(interiorLoja);
    // Porta da Loja
    portaLoja = new THREE.Object3D();
    // Armação da Porta
    let n_armacoes_porta = 5, armacao_porta, armacao_porta_g, armacao_porta_m;
    for (let i = 0; i < n_armacoes_porta; i++) {
        armacao_porta_g = new THREE.BoxGeometry(8, i % 2 == 0 ? 30 : (i == 1 ? 1 : 2), i % 2 == 0 ? 2 : 30);
        armacao_porta_m = new THREE.MeshPhongMaterial({color: 0x202020});
        armacao_porta = new THREE.Mesh(armacao_porta_g, armacao_porta_m);
        armacao_porta.position.set(5, i % 2 == 0 ? 16 : (i == 1 ? 1.5 : 30), i % 2 == 0 ? (i == 0 ? 11 : (i == 2 ? 25 : 39)) : 25);
        armacao_porta.castShadow = true;
        armacao_porta.receiveShadow = true;
        portaLoja.add(armacao_porta);
    }
    // Vidro da Porta
    let n_vidros_porta = 2, vidro_porta, vidro_porta_g, vidro_porta_m;
    for (let i = 0; i < n_vidros_porta; i++) {
        vidro_porta_g = new THREE.BoxGeometry(2, 27, 12);
        vidro_porta_m = new THREE.MeshPhongMaterial({color: 0x9ce9ff, transparent: true, opacity: 0.8});
        vidro_porta = new THREE.Mesh(vidro_porta_g, vidro_porta_m);
        vidro_porta.position.set(5, 15.5, i == 0 ? 18 : 32);
        vidro_porta.castShadow = true;
        portaLoja.add(vidro_porta);
    }
    scene.add(portaLoja);
}
//Função para criar as luzes da simulação
function criarLuzes() {
    hemisphereLight = new THREE.HemisphereLight(0x202020, 0x202020, 0.9);
    hemisphereLight.visible = true;
    scene.add(hemisphereLight);
    // Luz direcional
    luzDirecional = new THREE.DirectionalLight(0xffffff, 0.9);
    luzDirecional.position.set(0, 50, 0)
    // luzDirecional.target = scene;
    scene.add(luzDirecional.target);
    // Luz direcional (Sombras)
    luzDirecional.castShadow = true;
    luzDirecional.autoUpdate = true;
    luzDirecional.shadow.camera = new THREE.OrthographicCamera(-1000, 1000, 50, -500, 0.1, 1200);
    luzDirecional.shadow.bias = 0.00020;
    luzDirecional.shadow.camera.near = 1;
    luzDirecional.shadow.camera.far = 2200;

    scene.add(luzDirecional);
    curvaLuz = new THREE.EllipseCurve(
        0, 0,
        2000, 2000,
        0, 2 * Math.PI
    );
    // Luzes das lampadas

    //Primeira Lampada

    let lampadaParqueMod
    lampadaParqueMod = new THREE.SpotLight(0xffffff,0,0,Math.PI / 4,0.5,0);
    lampadaParqueMod.position.set(-180, 40, -48);
    lampadaParqueMod.target.position.set(-180, 0, -48);
    scene.add(lampadaParqueMod)
    scene.add( lampadaParqueMod.target );
    lampadaParque.push(lampadaParqueMod)


    lampadaParqueMod = new THREE.SpotLight(0xffffff,0,0,Math.PI / 4,0.5,0);
    lampadaParqueMod.position.set(-180, 40,-32);
    lampadaParqueMod.target.position.set(-180, 0,-32);
    scene.add(lampadaParqueMod)
    scene.add( lampadaParqueMod.target );
    lampadaParque.push(lampadaParqueMod)

    ///////////////

    //Segunda Lampada

    lampadaParqueMod = new THREE.SpotLight(0xffffff,0,0,Math.PI / 4,0.5,0);
    lampadaParqueMod.position.set(-180, 40,38);
    lampadaParqueMod.target.position.set(-180, 0,38);
    scene.add(lampadaParqueMod)
    scene.add( lampadaParqueMod.target );
    lampadaParque.push(lampadaParqueMod)


    lampadaParqueMod = new THREE.SpotLight(0xffffff,0,0,Math.PI / 4,0.5,0);
    lampadaParqueMod.position.set(-180, 40,52);
    lampadaParqueMod.target.position.set(-180, 0,52);
    scene.add(lampadaParqueMod)
    scene.add( lampadaParqueMod.target );
    lampadaParque.push(lampadaParqueMod)

    ///////////////

    //Terceira Lampada

    lampadaParqueMod = new THREE.SpotLight(0xffffff,0,0,Math.PI / 4,0.5,0);
    lampadaParqueMod.position.set(-180, 40,132);
    lampadaParqueMod.target.position.set(-180, 0,132);
    scene.add(lampadaParqueMod)
    scene.add(lampadaParqueMod.target);
    lampadaParque.push(lampadaParqueMod)


    lampadaParqueMod = new THREE.SpotLight(0xffffff,0,0,Math.PI / 4,0.5,0);
    lampadaParqueMod.position.set(-180, 40,148);
    lampadaParqueMod.target.position.set(-180, 0,148);
    scene.add(lampadaParqueMod)
    scene.add( lampadaParqueMod.target );
    lampadaParque.push(lampadaParqueMod)

    ///////////////

    // Lampada Loja

    let lampadaLoja = new THREE.SpotLight(0xffffff,1,0,Math.PI/3,0.5,0);
    lampadaLoja.position.set(70, 40,100);
    lampadaLoja.target.position.set(70, 0,100);
    // spotLight6.castShadow = true;
    scene.add(lampadaLoja)
    scene.add( lampadaLoja.target );


}

function luzesAtualizar() {
    if (position <= 1) {
        luzDirecional.position.x = curvaLuz.getPointAt(position).x
        luzDirecional.position.y = curvaLuz.getPointAt(position).y
        position += 0.0005

        if(position > 0.5)
        {
            for (let i = 0; i < lampadaParque.length; i++) {
                lampadaParque[i].power = 0.2* 4 * Math.PI  
            }   
        }
        else
        {
            for (let i = 0; i < lampadaParque.length; i++) {
                lampadaParque[i].power = 0
            }
        }
    } else {
        position = 0
    }
    if (valorCorRGB <= 0.5 && mudancaCiclo) {
        valorCorRGB += 0.0005;
        if (valorCorRGB > 0.5){
            mudancaCiclo = false;
        }
    } else {
        valorCorRGB -= 0.0005;
        if (valorCorRGB < 0){
            mudancaCiclo = true;
        }
    }
    corAmbiente = new THREE.Color(valorCorRGB, valorCorRGB, valorCorRGB);
    scene.fog = new THREE.Fog(corAmbiente, 0, 200 + 2000*valorCorRGB);
}

function criarCarro(){
    // Cores
    let cor_1 = 0xf01000; // Cor primária - usada no carcaça do carro
    let cor_2 = 0x202020; // Cor secundária - usada noutros elementos pertencentes ao carro
    let cor_3 = 0xdeefff; // Cor terciária - usada nos vidros do veículo
    let cor_4 = 0x404040; // Cor das rodas
    // Materiais
    let cor_1_material = new THREE.MeshPhongMaterial({color: cor_1, shininess: 0.1});
    let cor_2_material = new THREE.MeshPhongMaterial({color: cor_2, shininess: 0.1});
    let cor_3_material = new THREE.MeshPhongMaterial({color: cor_3, shininess: 0.1});
    // Carro 
    carro = new THREE.Object3D();
    carro.position.set(-90, 10, 125);
    carro.rotation.y = -Math.PI/2;
    scene.add(carro);
        // Carcaça 
        let carcaca = new THREE.Object3D(); //(32, 18, 18) hitbox
        carcaca.position.set(0, 0, 0);
        carro.add(carcaca);
            // Carcaça central
            let Cx0_g = new THREE.BoxGeometry (30, 4, 16);
            let Cx0 = new THREE.Mesh (Cx0_g, cor_1_material);
            Cx0.position.set(0, 0, 0);
            carcaca.add(Cx0);
            // Para-choques
            let n_Cx1 = 2, Cx1_g, Cx1;
            for (let i=0; i<n_Cx1; i++){
                Cx1_g = new THREE.BoxGeometry (2, 2, 16)
                Cx1 = new THREE.Mesh(Cx1_g, cor_1_material);
                Cx1.position.set(i%2==0?-14:14, -3, 0);
                carcaca.add(Cx1);
            }
            // Carcaça associada a área das rodas
            let n_Cx2 = 4, Cx2_g, Cx2;
            for(let i=0; i<n_Cx2; i++){
                Cx2_g = new THREE.BoxGeometry(1,2,16);
                Cx2 = new THREE.Mesh(Cx2_g, cor_1_material);
                Cx2.position.set(i%2==0?(i==0?-12.5:5.5):(i==1?12.5:-5.5), -3, 0);
                Cx2_g.vertices[(i%2==0?2:6)].set(i%2==0?-0.5:0.5, -1, i%2==0?8:-8);
                Cx2_g.vertices[(i%2==0?3:7)].set(i%2==0?-0.5:0.5, -1, i%2==0?-8:8);
                carcaca.add(Cx2);
            }
            // Carcaça inferior
            let Cx3_g = new THREE.BoxGeometry (10, 2, 16);
            let Cx3 = new THREE.Mesh (Cx3_g, cor_1_material);
            Cx3.position.set(0,-3,0)
            carcaca.add(Cx3);
            // Carcaça superior
            let Cx4_g = new THREE.BoxGeometry (10, 7, 16);
            let Cx4 = new THREE.Mesh (Cx4_g, cor_1_material);
            Cx4.position.set(-1,5.5,0)
            Cx4_g.vertices[5].set(-3,3.5,8);
            Cx4_g.vertices[4].set(-3,3.5,-8);
            carcaca.add(Cx4);
            // Bagagem
            let n_Cx5 = 3, Cx5_g, Cx5;
            for(let i=0; i<n_Cx5; i++){
            Cx5_g = new THREE.BoxGeometry((i%2==0?11:2), 2, (i%2==0?2:12));
            Cx5 = new THREE.Mesh(Cx5_g, cor_1_material);
            Cx5.position.set((i%2==0?9.5:14), 3, (i%2==0?(i==0?7:-7):0));
            carcaca.add(Cx5);
            }
            // Capô
            let Cx6_g = new THREE.BoxGeometry(10,2,16);
            let Cx6 = new THREE.Mesh(Cx6_g, cor_1_material);
            Cx6.position.set(-10,3,0);
            Cx6_g.vertices[0].set(5,0.5,7);
            Cx6_g.vertices[1].set(5,0.5,-7);
            Cx6_g.vertices[4].set(-4,0,-7);
            Cx6_g.vertices[5].set(-4,0,7);
            carro.add(Cx6); 
        // Kit da Carcaça
        let kit_carcaca = new THREE.Object3D();
        kit_carcaca.position.set(0, 0, 0);
        carro.add(kit_carcaca);
            // Barras Centrais
            let n_KCx0 = 2, KCx0_g, KCx0;
            for(let i=0; i<n_KCx0; i++){
            KCx0_g = new THREE.BoxGeometry(10, 1, 1);
            KCx0 = new THREE.Mesh(KCx0_g, cor_2_material);
            KCx0.position.set(0, -3.5, (i==0?8.5:-8.5));
            kit_carcaca.add(KCx0);
            }
            // Barras Superior a Roda
            let n_KCx1 = 4, KCx1_g, KCx1;
            for (let i = 0; i<n_KCx1; i++){
            KCx1_g = new THREE.BoxGeometry(6,1,1);
            KCx1 = new THREE.Mesh(KCx1_g, cor_2_material);
            KCx1_g.vertices[0].set(3.5,0.5,0.5);
            KCx1_g.vertices[1].set(3.5,0.5,-0.5);
            KCx1_g.vertices[4].set(-3.5,0.5,-0.5);
            KCx1_g.vertices[5].set(-3.5,0.5,0.5);
            KCx1.position.set((i%2==0?-9:9), -1.5, (i<2?8.5:-8.5));
            kit_carcaca.add(KCx1);
            }
            // Barras Inferiores (Extremos - Frontal e Traseira)
            let n_KCx2 = 4, KCx2_g, KCx2;
            for (let i = 0; i<n_KCx2; i++){
            KCx2_g = new THREE.BoxGeometry(2,1,1);
            KCx2 = new THREE.Mesh(KCx2_g, cor_2_material);
            KCx2.position.set((i%2==0?-14:14), -3.5,(i<2?8.5:-8.5));
            kit_carcaca.add(KCx2);
            }
            // Barras Diagonais a Roda
            let n_KCx3 = 8, KCx3_g, KCx3;
            for (let i=0; i<(n_KCx3/2); i++){
                for(let j=0; j<(n_KCx3/4); j++){
                KCx3_g = new THREE.BoxGeometry(1,3,1);
                KCx3 = new THREE.Mesh(KCx3_g, cor_2_material);
                KCx3.position.set((i%2==0?(i==0?-13.5:4.5):(i==1?-4.5:13.5)), -2.5, (j%2==0?8.5:-8.5));
                KCx3_g.vertices[0].set((i%2==0?1.5:-1), (i%2==0?0.5:1.5), 0.5);
                KCx3_g.vertices[1].set((i%2==0?1.5:-1), (i%2==0?0.5:1.5), -0.5);
                KCx3_g.vertices[4].set((i%2==0?1:-1.5), (i%2==0?1.5:0.5), -0.5);
                KCx3_g.vertices[5].set((i%2==0?1:-1.5), (i%2==0?1.5:0.5), 0.5);
                kit_carcaca.add(KCx3);
                }
            }
            // Barras dos para-choques
            let n_KCx4 = 2, KCx4_g, KCx4;
            for (let i=0; i<n_KCx4; i++){
            KCx4_g = new THREE.BoxGeometry(1,1,18);
            KCx4 = new THREE.Mesh(KCx4_g, cor_2_material);
            KCx4.position.set((i==0?-15.5:15.5), -3.5, 0);
            kit_carcaca.add(KCx4);
            }
        // Outras peças
        let outras_pecas = new THREE.Object3D();
        outras_pecas.position.set(0, 0, 0);
        carro.add(outras_pecas);
            // Maçaneta da Porta do Carro
            let n_OPx0 = 2, OPx0_g, OPx0;
            for (let i=0; i<n_OPx0;i++){
            OPx0_g = new THREE.BoxGeometry(1.6,0.6,0.6);
            OPx0 = new THREE.Mesh (OPx0_g, cor_2_material);
            OPx0.position.set(-3.2,2,(i%2==0?8.3:-8.3));
            outras_pecas.add(OPx0);
            }
            // Faróis Frontais
            let n_OPx1 = 8, OPx1_g, OPx1;
            for(let i=0; i<(n_OPx1/4); i++){
                for(let j=0; j<(n_OPx1/4); j++){
                    for (let k=0; k<(n_OPx1/4);k++){
                    OPx1_g = new THREE.BoxGeometry(0.4,(k==0?0.4:3),(k==0?3:0.4));
                    OPx1 = new THREE.Mesh (OPx1_g, cor_2_material);
                    OPx1.position.set(-15.2,(k==0?(i%2==0?0.8:-1.8):-0.5),(k==0?(j%2==0?5.5:-5.5):(i%2==0?(j%2==0?6.8:4.2):(j%2==0?-6.8:-4.2))));
                    outras_pecas.add(OPx1);
                    }         
                }
            }
            // Faróis Traseiros
            let n_OPx2 = 10, OPx2_g, OPx2;
            for (let i=0; i<(n_OPx2/5); i++){ // Horizontal ou Vertical
                if(i==0){ // Horizontal
                    for (let j=0; j<3; j++){ // 3 Barras
                        for (let k=0; k<(n_OPx2/5); k++){ // 2 Lados
                        OPx2_g = new THREE.BoxGeometry(0.4,0.4,3);
                        OPx2 = new THREE.Mesh (OPx2_g, cor_2_material);
                        OPx2.position.set(15.2,(j%2==0?(j==0?0:1.8):-1.8),(k%2==0?5.5:-5.5));
                        outras_pecas.add(OPx2);
                        }
                    }
                }
                else{ // Vertical
                    for (let j=0; j<(n_OPx2/5); j++){ // 2 Barras
                        for (let k=0; k<(n_OPx2/5); k++){ // 2 Lados
                        OPx2_g = new THREE.BoxGeometry(0.4,4,0.4);
                        OPx2 = new THREE.Mesh (OPx2_g, cor_2_material);
                        OPx2.position.set(15.2,0,(j%2==0?(k%2==0?6.8:4.2):(k%2==0?-6.8:-4.2)));
                        outras_pecas.add(OPx2);
                        }
                    }
                }
            }
            // Grelha
            let n_OPx3 = 5, OPx3_g, OPx3;
            for (let i=0; i<n_OPx3; i++){
            OPx3_g = new THREE.BoxGeometry(0.4,0.4,7);
            OPx3 = new THREE.Mesh (OPx3_g, cor_2_material);
            OPx3.position.set(-15.2,(0.8-(i*0.65)),0);
            outras_pecas.add(OPx3);
            }
            // Superfície da bagagem
            let OPx4_g = new THREE.BoxGeometry(9, 0.2, 12);
            let OPx4 = new THREE.Mesh(OPx4_g, cor_2_material);
            OPx4.position.set(8.5, 2.1, 0);
            outras_pecas.add(OPx4);
            // Barras da bagagem
            let n_OPx5 = 6, OPx5_g, OPx5;
            for(let i=0; i<n_OPx5; i++){
            OPx5_g = new THREE.BoxGeometry((i==2||i==5?2:1), (i==2||i==5?1:3), 1);
            OPx5 = new THREE.Mesh(OPx5_g, cor_2_material);
            OPx5.position.set((i==2||i==5?5:7.5), (i==1||i==4?5.5:8.5), (i<3?7:-7));
                if(i%3==0){
                OPx5_g.vertices[0].set(-1.5, 0.5, 0.5);
                OPx5_g.vertices[1].set(-1.5, 0.5, -0.5);
                OPx5_g.vertices[4].set(-1.5, -0.5, -0.5);
                OPx5_g.vertices[5].set(-1.5, -0.5, 0.5);
                }
            outras_pecas.add(OPx5);
            }
            // Fundo da grelha
            let OPx6_g = new THREE.BoxGeometry(0.1, 3, 7);
            let OPx6 = new THREE.Mesh(OPx6_g, cor_2_material);
            OPx6.position.set(-15.05, -0.5, 0);
            outras_pecas.add(OPx6);
        // Vidros
        let vidros = new THREE.Object3D();
        vidros.position.set(0, 0, 0);
        carro.add(vidros);
            // Vidros laterais do condutor
            let n_Vx0 = 2, Vx0_g, Vx0;
            for(let i=0; i<n_Vx0; i++){
            Vx0_g = new THREE.BoxGeometry(7, 4, 0.04);
            Vx0 = new THREE.Mesh(Vx0_g, cor_3_material);
            Vx0.position.set(-0.5, 6, (i==0?8.02:-8.02));
            Vx0_g.vertices[4].set(-2.5, 2, -0.02);
            Vx0_g.vertices[5].set(-2.5, 2, 0.02);
            vidros.add(Vx0);
            }
            // Vidro frontal do condutor
            let Vx1_g = new THREE.BoxGeometry(0.04, 4, 14);
            let Vx1 = new THREE.Mesh(Vx1_g, cor_3_material);
            Vx1.position.set(-5.45, 6, 0);
            Vx1_g.vertices[0].set(1.16, 2, 7);
            Vx1_g.vertices[1].set(1.16, 2, -7);
            Vx1_g.vertices[4].set(1.12, 2, -7);
            Vx1_g.vertices[5].set(1.12, 2, 7);
            vidros.add(Vx1);
        // Rodas
        let rodas = new THREE.Object3D();
        rodas.position.set(0, 0, 0);
        carro.add(rodas);
        let Rx_g = new THREE.CylinderGeometry(3.4, 3.4, 3, 32);
        let Rx_m = new THREE.MeshPhongMaterial({color: cor_4, shininess: 0});
            // Roda frontal esquerda
            Rx1 = new THREE.Mesh(Rx_g, Rx_m);
            Rx1.position.set(-9, -5.6, 7);
            Rx1.rotation.x = Math.PI / 2;
            rodas.add(Rx1);
            // Roda frontal direita
            Rx2 = new THREE.Mesh(Rx_g, Rx_m);
            Rx2.position.set(-9, -5.6, -7);
            Rx2.rotation.x = Math.PI / 2;
            rodas.add(Rx2);
            // Roda traseira esquerda
            let Rx3 = new THREE.Mesh(Rx_g, Rx_m);
            Rx3.position.set(9, -5.6, 7);
            Rx3.rotation.x = Math.PI / 2;
            rodas.add(Rx3);
            // Roda traseira direita
            let Rx4 = new THREE.Mesh(Rx_g, Rx_m);
            Rx4.position.set(9, -5.6, -7);
            Rx4.rotation.x = Math.PI / 2;
            rodas.add(Rx4);
    //Luzes do carro
    luz_frontal_esq = new THREE.PointLight(0xfff5bd, 1, 20);
    luz_frontal_esq.position.set(-18, 0, 6);
    const lfe_helper = new THREE.Object3D();
    lfe_helper.position.set(0, -9, 0);
    carro.add(lfe_helper);
    luz_frontal_esq.target = lfe_helper;
    carro.add(luz_frontal_esq);
    scene.add(luz_frontal_esq.target)
    //
    luz_frontal_dir = new THREE.PointLight(0xfff5bd, 1, 20);
    luz_frontal_dir.position.set(-18, 0, -6);
    const test2 = new THREE.Object3D();
    test2.position.set(0, -9, 0);
    carro.add(test2);
    luz_frontal_dir.target = test2;
    carro.add(luz_frontal_dir);
    scene.add(luz_frontal_dir.target)
    //
    luz_traseira_esq = new THREE.PointLight(0xc91a14, 1, 10);
    luz_traseira_esq.position.set(18, 0, 6);
    const test4 = new THREE.Object3D();
    test4.position.set(0, -9, 0);
    carro.add(test4);
    luz_traseira_esq.target = test4;
    carro.add(luz_traseira_esq);
    scene.add(luz_traseira_esq.target)
    //
    luz_traseira_dir = new THREE.PointLight(0xc91a14, 1, 10);
    luz_traseira_dir.position.set(18, 0, -6);
    const test3 = new THREE.Object3D();
    test3.position.set(0, -9, 0);
    carro.add(test3);
    luz_traseira_dir.target = test3;
    carro.add(luz_traseira_dir);
    scene.add(luz_traseira_dir.target)
}
// Movimento do carro com o teclado 
document.addEventListener('keydown', (e) => {
    let key = e.key;
    if (key == "w" || key == "W"){
        carro.frente = 1;
    }
    if (key == "s" || key == "S"){
        carro.frente = -1;
    }
    if (key == "d" || key == "D"){
        carro.direita = 1;
    }
    if (key == "a" || key == "A"){
        carro.direita = -1;
    }
    if (key == "v" || key == "V"){
        boost = 2;
    }
    if (key == "c" || key == "C"){
        trocar_camera = !trocar_camera;
    }
});
document.addEventListener('keyup', (e) => {
    let key = e.key;
    if (key == "w" || key == "W" || key == "s" || key == "S"){
        carro.frente = 0;
    }
    if (key == "d" || key == "D" || key == "a" || key == "A"){
        carro.direita = 0;
    }
    if (key == "v" || key == "V"){
        boost = 1;
    }
});
// Função do Render
function render() {
    // Fazer com que todos os elementos/objetos relacionados ao objeto pai, neste caso o carro, emita sombras
    carro.traverse(function (child) {
    if (child instanceof THREE.Mesh ) {
    child.castShadow = true;
    }
    });
    // Atualizar luzes
    luzesAtualizar();
    // Movimento do carro
    if (carro.direita == 1){
        carro.rotation.y -= 0.001
        if(Rx1.rotation.z <= 0.5){
            Rx1.rotation.z += 0.02
            Rx2.rotation.z += 0.02
        }
    } else if (carro.direita == -1){
        carro.rotation.y += 0.001
        if (Rx1.rotation.z >= -0.5){
            Rx1.rotation.z -= 0.02
            Rx2.rotation.z -= 0.02
        }
    } else if (carro.direita == 0){
        if(Rx1.rotation.z > 0){
            Rx1.rotation.z -= 0.02
            Rx2.rotation.z -= 0.02 
        } else {
            Rx1.rotation.z += 0.02
            Rx2.rotation.z += 0.02
        }
    }
    if (carro.frente == 1 && (carro.direita != 1 && carro.direita != -1)) {
    carro.position.x -= (0.5 * boost) * Math.cos(carro.rotation.y)
    carro.position.z += (0.5 * boost) * Math.sin(carro.rotation.y)
    }
    else if (carro.frente == 1 && carro.direita == 1){
    carro.position.x -= (0.5 * boost) * Math.cos(carro.rotation.y -= 0.005)
    carro.position.z += (0.5 * boost) * Math.sin(carro.rotation.y -= 0.005)
    }
    else if (carro.frente == 1 && carro.direita == -1){
    carro.position.x -= (0.5 * boost) * Math.cos(carro.rotation.y += 0.005)
    carro.position.z += (0.5 * boost) * Math.sin(carro.rotation.y += 0.005)
    }
    else if (carro.frente == -1 && (carro.direita != 1 && carro.direita != -1)) {
    carro.position.x += 0.5 * Math.cos(carro.rotation.y)
    carro.position.z -= 0.5 * Math.sin(carro.rotation.y)
    }
    else if (carro.frente == -1 && carro.direita == 1){
    carro.position.x += 0.5 * Math.cos(carro.rotation.y += 0.008)
    carro.position.z -= 0.5 * Math.sin(carro.rotation.y += 0.008)
    }
    else if (carro.frente == -1 && carro.direita == -1){
    carro.position.x += 0.5 * Math.cos(carro.rotation.y -= 0.008)
    carro.position.z -= 0.5 * Math.sin(carro.rotation.y -= 0.008)
    }
    // Camera
    if (trocar_camera){
        let relativeOffset = new THREE.Vector3(140, 80, 0);
        let cameraOffset = relativeOffset.applyMatrix4(carro.matrixWorld);
        camera.position.copy(cameraOffset);
        camera.lookAt(carro.position);
    }else{
        let relativeOffset = new THREE.Vector3(70, 40, 0);
        let cameraOffset = relativeOffset.applyMatrix4(carro.matrixWorld);
        camera.position.copy(cameraOffset);
        camera.lookAt(carro.position);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}