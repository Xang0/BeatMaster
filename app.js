/**
 * ARQUITETURA DE JOGO INCREMENTAL: PRODUTOR MUSICAL
 * Construído em Vanilla JavaScript (Sem dependências ext.)
 */

// 1. Árvore da Máquina de Estado de Retenção Absoluta 
// Define o estado global do jogo, contendo todos os dados mutáveis
let state = {
    streams: 0,                // Quantidade atual de streams (moeda do jogo)
    pps: 0,                   // Streams passivos por segundo (produção bruta)
    expenses: 0,              // Custo fixo passivo por segundo (ex.: aluguel de estúdio)
    clickValue: 1,            // Quantidade de streams ganhas por clique
    isGameOver: false,        // Flag de falência (game over)
    hasWon: false,            // Flag de vitória (atingiu a meta)
    
    // Upgrades disponíveis na loja, cada um com:
    // name: nome do upgrade
    // baseCost: custo inicial
    // currentCost: custo atual (dinâmico)
    // ppsAdd: aumento de produção por segundo por unidade
    // costAdd: aumento de despesa fixa por segundo por unidade (custo de manutenção)
    // count: quantidade comprada
    // rate: fator de multiplicação do custo a cada compra (exponencial)
    upgrades: [
        { name: "Microfone Condensador", baseCost: 10, currentCost: 10, ppsAdd: 0.1, costAdd: 0, count: 0, rate: 1.15 },
        { name: "Software de Produção", baseCost: 100, currentCost: 100, ppsAdd: 1, costAdd: 0, count: 0, rate: 1.15 },
        { name: "Instrumentos Virtuais", baseCost: 500, currentCost: 500, ppsAdd: 5, costAdd: 0, count: 0, rate: 1.15 },
        { name: "Estúdio Caseiro", baseCost: 2000, currentCost: 2000, ppsAdd: 20, costAdd: 2, count: 0, rate: 1.15 },
        { name: "Equipe de Marketing", baseCost: 10000, currentCost: 10000, ppsAdd: 100, costAdd: 10, count: 0, rate: 1.15 }
    ]
};

// Marcos Lógicos Base de Limite [24]
const VICTORY_GOAL = 1000000;   // Meta de streams para vencer o jogo (1 milhão)
let lastFrameTime = 0;          // Armazena o timestamp do último frame para cálculo de delta time
let saveIntervalId;             // ID do intervalo de salvamento automático

// Referenciamento do DOM em Constantes Aceleradas (Evita pesquisa na árvore repetidamente)
const domStreams = document.getElementById('total-streams');      // Elemento que exibe total de streams
const domPPS = document.getElementById('pps-rate');               // Elemento que exibe produção líquida por segundo
const domClickZone = document.getElementById('click-zone');       // Área clicável principal
const domUpgradeList = document.getElementById('upgrade-list');   // Lista de upgrades (container)
const domStatus = document.getElementById('system-message');       // Mensagens de status (vitória/derrota)
const domOverlay = document.getElementById('start-overlay');       // Tela de início (overlay)

// Engenharia do Sub-Módulo de Áudio 
// Arquivos estáticos locais; O navegador falhará graciosamente se não encontrados
const sfxClick = new Audio('assets/kick-drum.mp3');      // Som de clique
const sfxBuy = new Audio('assets/cash-register.mp3');    // Som de compra

// 2. Controladores de Engajamento e Mecanismos Básicos
function initGame() {
    loadProgress();                // Tenta carregar progresso salvo no localStorage
    recalculateMetrics();          // Recalcula produção e despesas totais
    renderStore();                 // Renderiza a loja com upgrades atualizados
    updateCounters();              // Atualiza a interface com os valores atuais

    // Alinhamento de ciclo nativo desacoplado da fila de macros
    lastFrameTime = performance.now();   // Marca o instante inicial para delta time
    requestAnimationFrame(mainGameLoop); // Inicia o loop principal do jogo

    // Sistema Síncrono Intervalar Preventivo de Corrupção (A cada 10s) [33, 35]
    saveIntervalId = setInterval(saveProgress, 10000); // Salva automaticamente a cada 10 segundos
}

// Interação principal originada da fenda do usuário do clique na tela principal
domClickZone.addEventListener('mousedown', () => {
    // Se o jogo já acabou ou foi vencido, o clique não tem efeito
    if(state.isGameOver || state.hasWon) return;
    
    // Incrementa streams com o valor do clique (clickValue)
    state.streams += state.clickValue;
    
    // Toca o som de clique; reseta o tempo para permitir sobreposição rápida
    sfxClick.currentTime = 0; 
    sfxClick.play().catch(e => console.warn("Interação de áudio contida")); 
    
    updateCounters();  // Atualiza a interface após o clique
});

// Resolução de Conflitos e Gatilho da Política Antibloqueio de Automação [44, 45]
document.getElementById('btn-start').addEventListener('click', () => {
    domOverlay.classList.remove('active');  // Remove a tela de início
    // A ativação manual em contexto realimenta e aprova canais globais na página 
    initGame();  // Inicia o jogo propriamente dito
});

// 3. Mecanismos Transacionais e Econômicos 
window.purchaseUpgrade = function(index) {
    // Impede compra se o jogo acabou ou foi vencido
    if(state.isGameOver || state.hasWon) return;

    let item = state.upgrades[index];
    // Verifica se o jogador tem streams suficientes para pagar o custo atual
    if (state.streams >= item.currentCost) {
        state.streams -= item.currentCost;  // Deduz o custo
        item.count++;                       // Aumenta a quantidade do upgrade
        
        // C_n = C_0 * r^n (Arredondamento imperativo de inflação financeira para valores limpos) [14]
        // Recalcula o custo atual com base na fórmula exponencial: baseCost * (rate ^ count)
        item.currentCost = Math.floor(item.baseCost * Math.pow(item.rate, item.count));
        
        // Toca som de compra
        sfxBuy.currentTime = 0;
        sfxBuy.play().catch(e=>e);

        // Recalcula produção/despesas, re-renderiza a loja e atualiza contadores
        recalculateMetrics();
        renderStore();
        updateCounters();
    }
};

function recalculateMetrics() {
    let rawPPS = 0;
    let rawExpenses = 0;

    // Soma a produção e as despesas de cada upgrade, multiplicando pela quantidade comprada
    state.upgrades.forEach(item => {
        rawPPS += (item.count * item.ppsAdd);
        rawExpenses += (item.count * item.costAdd);
    });

    // Atualiza o estado global
    state.pps = rawPPS;
    state.expenses = rawExpenses;
}

// 4. O Coração Assíncrono da Execução Paralela (Temporalização Indep. da Máquina) 
function mainGameLoop(timestamp) {
    // Se o jogo acabou ou foi vencido, para de processar o loop
    if(state.isGameOver || state.hasWon) return;

    // Cálculo exato de decaimento em base segundos decorridos reais (Delta) 
    const deltaSeconds = (timestamp - lastFrameTime) / 1000;  // Tempo decorrido em segundos desde o último frame
    lastFrameTime = timestamp;  // Atualiza o timestamp para o próximo frame

    if (deltaSeconds > 0) {
        let netIncome = state.pps - state.expenses;  // Renda líquida por segundo (produção - despesas)
        state.streams += (netIncome * deltaSeconds); // Adiciona o ganho proporcional ao delta de tempo
    }

    evaluateWinLossBoundaries(); // Verifica condições de vitória ou derrota
    updateCounters();            // Atualiza a interface

    // Invoca auto-chamada de encadeamento no término do processamento do quadro em tela 
    requestAnimationFrame(mainGameLoop);  // Agenda o próximo frame
}

// 5. Avaliação Condicional Lógica Fria (Vitória e Derrota) [23, 24, 31]
function evaluateWinLossBoundaries() {
    // DERROTA: Endividamento fatal de Custos Operacionais suprimindo o lastro do Banco 
    if (state.streams < 0) {
        state.streams = 0; // Previne o exibicionismo do negativo feio na UI gráfica
        state.isGameOver = true;
        domStatus.innerHTML = "<span style='color:#e74c3c'>FALÊNCIA! Os custos de locação arruinaram sua carreira. Jogo encerrado.</span>";
        clearInterval(saveIntervalId);  // Interrompe o salvamento automático
        return;
    }

    // VITÓRIA: Obtenção cumulativa da marca fundamental estipulada pela premissa [24]
    if (state.streams >= VICTORY_GOAL && !state.hasWon) {
        state.hasWon = true;
        domStatus.innerHTML = "<span style='color:#00d26a'>MÁXIMO ALCANCE! Sua música virou hit global e a Maior Gravadora assumiu seu selo!</span>";
        saveProgress();  // Salva o estado de vitória
    }
}

// 6. Atualização Otimizada de Visualização (Não altera layout, apenas Texto de nós ativados)
function updateCounters() {
    // Math.floor para truncar decimais que crescem linearmente pela adição temporal 
    domStreams.innerText = Math.floor(state.streams).toLocaleString('pt-BR');
    
    let net = state.pps - state.expenses;  // Produção líquida
    domPPS.innerText = `${net >= 0? '+' : ''}${net.toFixed(1)}/seg`;  // Exibe com sinal (+ ou -)
    if(net < 0) domPPS.style.color = "#e74c3c";  // Se negativo, texto vermelho
    else domPPS.style.color = "white";            // Caso contrário, branco

    // Reatividade de Bloqueio Botões visuais do painel 
    // Desabilita botões de compra se o jogador não tiver streams suficientes para o custo atual
    const btns = document.querySelectorAll('.btn-buy');
    btns.forEach((btn, index) => {
        btn.disabled = state.streams < state.upgrades[index].currentCost;
    });
}

function renderStore() {
    domUpgradeList.innerHTML = ''; // Limpeza brutal e reestruturação da fenda da tabela DOM
    // Para cada upgrade, cria um elemento <li> com informações e botão de compra
    state.upgrades.forEach((item, index) => {
        // Exibe o custo fixo adicional (se houver) em vermelho
        let costPenaltyStr = item.costAdd > 0? ` <span style="color:#e74c3c">(-${item.costAdd} custo fixo/seg)</span>` : '';
        const li = document.createElement('li');
        li.className = 'upgrade-item';
        li.innerHTML = `
            <div class="upgrade-details">
                <strong>${item.name} <span style="color:var(--color-accent)">(x${item.count})</span></strong>
                <span>+${item.ppsAdd} Streams/s${costPenaltyStr}</span>
            </div>
            <button class="btn-buy" onclick="purchaseUpgrade(${index})">
                $${item.currentCost.toLocaleString('pt-BR')}
            </button>
        `;
        domUpgradeList.appendChild(li);
    });
}

// 7. Modulação Crucial de Persistência em Memória Rígida 
function saveProgress() {
    if(state.isGameOver) return; // Nega preservação da podridão falida (não salva se faliu)
    try {
        // Objeto em Cascata aninhada colapsado perfeitamente na string JSON 
        localStorage.setItem('beatMasterGameSavedState', JSON.stringify(state));
    } catch (e) {
        console.error("Inviabilidade de acesso estrito I/O na máquina do cliente", e);
    }
}

function loadProgress() {
    try {
        const memoryString = localStorage.getItem('beatMasterGameSavedState');
        if (memoryString) {
            let parsedState = JSON.parse(memoryString);
            // Previne mesclagem fatal forçando preenchimento ordenado (só carrega se não for game over)
            if(!parsedState.isGameOver) state = parsedState; 
        }
    } catch (e) {
        console.warn("Nó de arquivo corrompido ou inexistente. Redefinindo fita inicial.", e);
    }
}

// 8. Reinicialização Contratual
// Botão "Salvar Jogo" – salva manualmente e exibe alerta
document.getElementById('btn-save').addEventListener('click', () => { 
    saveProgress(); 
    alert("Jogo salvo com sucesso!"); 
});

// Botão "Resetar Jogo" – limpa todo o progresso
document.getElementById('btn-reset').addEventListener('click', () => {
    if(confirm("Deseja expurgar toda a carreira fonográfica? Isso é irremediável!")) {
        // 1. Remove os dados salvos fisicamente do navegador
        localStorage.removeItem('beatMasterGameSavedState');

        // 2. Verifica se o loop de jogo havia sido paralisado por Falência/Vitória
        const wasLoopDead = state.isGameOver || state.hasWon;

        // 3. Reseta o estado lógico interno manualmente 
        state.streams = 0;
        state.pps = 0;
        state.expenses = 0;
        state.clickValue = 1;
        state.isGameOver = false;
        state.hasWon = false;

        // 4. Zera o inventário da loja para as configurações iniciais
        state.upgrades.forEach(item => {
            item.count = 0;
            item.currentCost = item.baseCost;
        });

        // 5. Restaura a interface visual
        document.getElementById('system-message').innerHTML = "O estúdio de garagem aguarda a primeira batida...";
        recalculateMetrics();
        renderStore();
        updateCounters();

        // 6. Reativa o Motor Principal caso o jogo tivesse acabado
        if (wasLoopDead) {
            lastFrameTime = performance.now();
            requestAnimationFrame(mainGameLoop);
            
            clearInterval(saveIntervalId);
            saveIntervalId = setInterval(saveProgress, 10000);
        }

        // 7. Tenta o recarregamento da página como via de redundância
        window.location.reload();
    }
});