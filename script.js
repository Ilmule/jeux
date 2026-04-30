let balance = 0;
let currentGame = '';
const suits = ['♠', '♣', '♥', '♦'];
const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

const rules = {
    'bj': "Essayez de vous rapprocher de 21 sans dépasser. Battez la main de la banque pour doubler votre mise.",
    'mines': "Trouvez les diamants pour augmenter le multiplicateur. Si vous tombez sur une bombe, la mise est perdue.",
    'roulette': "Misez sur la couleur (Rouge ou Noir). Si la roue s'arrête sur votre couleur, vous doublez la mise.",
    'crash': "Le multiplicateur monte progressivement. Cliquez sur CASHOUT avant le crash pour encaisser vos gains.",
    'slots': "Faites tourner les rouleaux. Obtenez 3 symboles identiques pour remporter le Jackpot (x10) !",
    'plinko': "Lâchez une bille qui va rebondir sur les clous. Le gain dépend de l'endroit où la bille atterrit en bas.",
    'poker': "Vidéo Poker simplifié : Recevez 5 cartes. Si vous avez au moins une paire, vous doublez votre mise.",
    'dice': "Lancez deux dés. Si le total est strictement supérieur à 7, vous gagnez x2.",
    'hilo': "Devinez si la prochaine carte sera plus haute ou plus basse pour doubler la mise.",
    'baccarat': "Misez sur le camp qui s'approchera le plus de 9 points."
};

function bootGame() {
    let inputVal = parseInt(document.getElementById('start-bal').value);
    balance = (isNaN(inputVal) || inputVal <= 0) ? 1000 : inputVal;
    document.getElementById('balance-display').innerText = balance.toLocaleString() + " €";
    document.getElementById('scr-start').classList.add('hidden');
    document.getElementById('scr-main').classList.remove('hidden');
}

function updateBalance(amt) {
    balance += amt;
    document.getElementById('balance-display').innerText = balance.toLocaleString() + " €";
}

function msg(text, isWin = true) {
    const n = document.getElementById('notify');
    n.innerText = text;
    n.style.borderLeftColor = isWin ? 'var(--win)' : 'var(--loss)';
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 3000);
}

function showLobby() {
    document.getElementById('lobby').classList.remove('hidden');
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('btn-back').classList.add('hidden');
    currentGame = '';
}

function showHelp() {
    alert(rules[currentGame] || "Règles non trouvées.");
}

function openGame(id) {
    currentGame = id;
    document.getElementById('lobby').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('btn-back').classList.remove('hidden');
    setupGame(id);
}

function getCard() {
    const v = values[Math.floor(Math.random() * values.length)];
    const s = suits[Math.floor(Math.random() * suits.length)];
    let p = parseInt(v) || (v === 'A' ? 11 : 10);
    return { v, s, p };
}

function cardHTML(c) {
    const red = (c.s === '♥' || c.s === '♦') ? 'card-red' : '';
    return `<div class="playing-card ${red}"><div>${c.v}</div><div style="font-size:1.5rem">${c.s}</div></div>`;
}

function setupGame(id) {
    const screen = document.getElementById('game-screen');
    const headerHTML = `<div class="game-header"><h2 style="margin:0; text-transform:uppercase;">${id}</h2><button class="btn-help" onclick="showHelp()">❓ AIDE</button></div>`;

    if (id === 'bj') {
        screen.innerHTML = headerHTML + `<p>Banque: <span id="d-score">0</span></p><div id="d-area"></div><p>Joueur: <span id="p-score">0</span></p><div id="p-area"></div><div class="controls" id="bj-main"><input type="number" id="bet" value="100"><button onclick="startBJ()">JOUER</button></div><div class="controls hidden" id="bj-play"><button onclick="hitBJ()">TIRER</button><button onclick="standBJ()">RESTER</button></div>`;
    } 
    else if (id === 'mines') {
        screen.innerHTML = headerHTML + `<div class="mines-grid" id="m-grid"></div><div class="controls" id="m-ctrl"><input type="number" id="bet" value="100"><button onclick="startMines()">COMMENCER</button></div><button id="m-cash" class="hidden" onclick="cashMines()" style="margin-top:20px; background:var(--win)">ENCAISSER (0 €)</button>`;
        for(let i=0; i<25; i++) document.getElementById('m-grid').innerHTML += `<div class="mine-tile" id="tile-${i}" onclick="clickMine(${i})">?</div>`;
    }
    else if (id === 'roulette') {
        screen.innerHTML = headerHTML + `<div class="wheel-box"><div class="pointer">▼</div><div id="wheel" class="wheel-canvas"></div></div><div class="controls"><input type="number" id="bet" value="100"><button onclick="playRoulette('red')" style="background:#e74c3c">ROUGE (x2)</button><button onclick="playRoulette('black')" style="background:#2c3e50; color:white">NOIR (x2)</button></div>`;
        const w = document.getElementById('wheel');
        let g = "";
        for(let i=0; i<37; i++) {
            let c = i===0 ? '#27ae60' : (i%2===0 ? '#2c3e50' : '#e74c3c');
            g += `${c} ${(i*360/37)}deg ${((i+1)*360/37)}deg,`;
        }
        w.style.background = `conic-gradient(${g.slice(0,-1)})`;
    }
    else if (id === 'crash') {
        screen.innerHTML = headerHTML + `<div id="c-mult" style="font-size:4rem; margin:30px; font-weight:bold; color:var(--win);">1.00x</div><div class="controls"><input type="number" id="bet" value="100"><button id="c-btn" onclick="startCrash()">LANCER</button></div>`;
    }
    else if (id === 'slots') {
        screen.innerHTML = headerHTML + `<div id="s-res" style="font-size:4.5rem; letter-spacing:10px; margin:30px 0;">🎰🎰🎰</div><div class="controls"><input type="number" id="bet" value="100"><button id="btn-slots" onclick="playSlots()">TOURNER</button></div>`;
    }
    else if (id === 'plinko') {
        screen.innerHTML = headerHTML + `
            <canvas id="plinko-cv" width="300" height="260" style="background:#1a1a1a; border-radius:10px; border:2px solid #333; margin:auto; display:block;"></canvas>
            <div style="display:flex; justify-content:space-between; width:300px; margin: 10px auto; gap:4px; font-weight:bold;">
                <div class="p-slot" data-mult="5">5x</div><div class="p-slot" data-mult="2">2x</div><div class="p-slot" data-mult="0.2">0.2x</div><div class="p-slot" data-mult="0.2">0.2x</div><div class="p-slot" data-mult="0.2">0.2x</div><div class="p-slot" data-mult="2">2x</div><div class="p-slot" data-mult="5">5x</div>
            </div>
            <div class="controls"><input type="number" id="bet" value="100"><button id="btn-plinko" onclick="playPlinko()">LÂCHER BILLE</button></div>`;
        drawPlinkoBase();
    }
    else if (id === 'poker') {
        screen.innerHTML = headerHTML + `<div id="p-area" style="margin:20px; min-height:100px;"></div><div class="controls"><input type="number" id="bet" value="100"><button onclick="playPoker()">DISTRIBUER</button></div>`;
    }
    else if (id === 'dice') {
        screen.innerHTML = headerHTML + `<div id="d-res" style="font-size:4rem; margin:20px 0;">🎲</div><div class="controls"><input type="number" id="bet" value="100"><button onclick="playDice()">LANCER</button></div>`;
    }
    else if (id === 'hilo') {
        screen.innerHTML = headerHTML + `<div id="hi-area" style="min-height:100px; margin:20px;"></div><div class="controls" id="hi-setup"><input type="number" id="bet" value="100"><button onclick="startHiLo()">JOUER</button></div><div class="controls hidden" id="hi-play"><button onclick="playHiLo('up')">HAUT ↑</button><button onclick="playHiLo('down')">BAS ↓</button></div>`;
    }
    else if (id === 'baccarat') {
        screen.innerHTML = headerHTML + `<div id="bac-res" style="font-size:1.5rem; margin:20px; font-weight:bold;">Joueur: ? | Banque: ?</div><div class="controls"><input type="number" id="bet" value="100"><button onclick="playBac('p')">MISER JOUEUR</button><button onclick="playBac('b')">MISER BANQUE</button></div>`;
    }
}

// --- PLINKO LOGIQUE ---
function drawPlinkoBase(ballX = null, ballY = null) {
    const cv = document.getElementById('plinko-cv');
    if(!cv) return;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, 300, 260);
    ctx.fillStyle = '#888';
    for(let r=0; r<8; r++) {
        for(let c=0; c<=r; c++) {
            ctx.beginPath();
            ctx.arc(150 - (r*15) + (c*30), 40 + (r*25), 4, 0, Math.PI*2);
            ctx.fill();
        }
    }
    if(ballX !== null && ballY !== null) {
        ctx.fillStyle = 'var(--primary)';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 6, 0, Math.PI*2);
        ctx.fill();
    }
}

let plinkoActive = false;
function playPlinko() {
    if(plinkoActive) return;
    let b = parseInt(document.getElementById('bet').value); 
    if(b > balance) return msg("Fonds insuffisants", false);
    updateBalance(-b);
    plinkoActive = true;
    document.getElementById('btn-plinko').disabled = true;
    let path = [{x: 150, y: 15}];
    let x = 150; let y = 15;
    for(let r=0; r<8; r++) {
        y += 25; x += (Math.random() > 0.5 ? 15 : -15);
        path.push({x, y});
    }
    let step = 0;
    let anim = setInterval(() => {
        drawPlinkoBase(path[step].x, path[step].y);
        step++;
        if(step >= path.length) {
            clearInterval(anim);
            plinkoActive = false;
            document.getElementById('btn-plinko').disabled = false;
            let finalX = path[path.length-1].x;
            let mult = 0.2;
            if(finalX <= 60 || finalX >= 240) mult = 5;
            else if(finalX === 90 || finalX === 210) mult = 2;
            updateBalance(Math.floor(b * mult));
            msg(`Résultat: x${mult}`, mult >= 1);
        }
    }, 120);
}

// --- AUTRES JEUX (LOGIQUE RACCOURCIE) ---
let currentRouletteDeg = 0;
function playRoulette(choice) {
    let b = parseInt(document.getElementById('bet').value);
    if(b > balance) return msg("Fonds insuffisants", false);
    updateBalance(-b);
    currentRouletteDeg += 1440 + Math.floor(Math.random() * 360);
    document.getElementById('wheel').style.transform = `rotate(${currentRouletteDeg}deg)`;
    setTimeout(() => {
        let winIdx = Math.floor(((360 - (currentRouletteDeg % 360)) / (360/37))) % 37;
        let winColor = winIdx === 0 ? 'green' : (winIdx % 2 === 0 ? 'black' : 'red');
        if(choice === winColor) { updateBalance(b*2); msg("GAGNÉ ! Chiffre "+winIdx); }
        else { msg("PERDU ! Chiffre "+winIdx, false); }
    }, 4100);
}

function playSlots() {
    let b = parseInt(document.getElementById('bet').value); if(b > balance) return msg("Fonds insuffisants", false);
    updateBalance(-b);
    const s = ['🍒','🍋','💎','7️⃣'];
    let res = [s[Math.floor(Math.random()*4)], s[Math.floor(Math.random()*4)], s[Math.floor(Math.random()*4)]];
    document.getElementById('s-res').innerText = res.join("");
    if(res[0]===res[1] && res[1]===res[2]) { updateBalance(b*10); msg("JACKPOT x10 !"); } 
    else msg("Perdu", false);
}

function startBJ() {
    let b = parseInt(document.getElementById('bet').value); if(b > balance) return msg("Fonds insuffisants", false);
    updateBalance(-b); bjP = [getCard(), getCard()]; bjD = [getCard()];
    document.getElementById('p-area').innerHTML = bjP.map(cardHTML).join("");
    document.getElementById('d-area').innerHTML = bjD.map(cardHTML).join("");
    document.getElementById('p-score').innerText = calcBJ(bjP);
    document.getElementById('d-score').innerText = calcBJ(bjD);
    document.getElementById('bj-main').classList.add('hidden'); document.getElementById('bj-play').classList.remove('hidden');
}
function calcBJ(h) {
    let s = h.reduce((a,b)=>a+b.p, 0); let aces = h.filter(c=>c.v==='A').length;
    while(s > 21 && aces > 0) { s -= 10; aces--; } return s;
}
function hitBJ() {
    let c = getCard(); bjP.push(c); document.getElementById('p-area').innerHTML += cardHTML(c);
    if(calcBJ(bjP) > 21) { msg("BUST !", false); resetBJ(); } else document.getElementById('p-score').innerText = calcBJ(bjP);
}
function standBJ() {
    let b = parseInt(document.getElementById('bet').value);
    while(calcBJ(bjD) < 17) bjD.push(getCard());
    document.getElementById('d-area').innerHTML = bjD.map(cardHTML).join("");
    document.getElementById('d-score').innerText = calcBJ(bjD);
    let sP = calcBJ(bjP), sD = calcBJ(bjD);
    if(sD > 21 || sP > sD) { updateBalance(b*2); msg("GAGNÉ !"); }
    else if(sP === sD) { updateBalance(b); msg("ÉGALITÉ"); }
    else msg("PERDU", false);
    resetBJ();
}
function resetBJ() { document.getElementById('bj-main').classList.remove('hidden'); document.getElementById('bj-play').classList.add('hidden'); }

// --- MINES LOGIQUE ---
let mActive = false, mData = [], mBet = 0, mFound = 0;
function startMines() {
    mBet = parseInt(document.getElementById('bet').value); if(mBet > balance) return msg("Fonds insuffisants", false);
    updateBalance(-mBet); mActive = true; mFound = 0; mData = Array(25).fill('💎');
    for(let i=0; i<3; i++) mData[Math.floor(Math.random()*25)] = '💣';
    document.getElementById('m-ctrl').classList.add('hidden'); document.getElementById('m-cash').classList.remove('hidden');
    for(let i=0; i<25; i++) { let t = document.getElementById('tile-'+i); t.className = "mine-tile"; t.innerText = "?"; }
}
function clickMine(i) {
    if(!mActive) return;
    let t = document.getElementById('tile-'+i); if(t.classList.contains('revealed')) return;
    t.classList.add('revealed'); t.innerText = mData[i];
    if(mData[i] === '💣') { t.classList.add('bomb'); mActive = false; msg("BOOM !", false); setTimeout(setupGame.bind(null,'mines'), 1500); }
    else { t.classList.add('gem'); mFound++; document.getElementById('m-cash').innerText = `ENCAISSER (${Math.floor(mBet * Math.pow(1.3, mFound))} €)`; }
}
function cashMines() {
    updateBalance(Math.floor(mBet * Math.pow(1.3, mFound))); msg("GAGNÉ !"); mActive = false; setupGame('mines');
}

// --- CRASH ---
let cActive = false, cMult = 1.0;
function startCrash() {
    let b = parseInt(document.getElementById('bet').value);
    if(cActive) { updateBalance(Math.floor(b * cMult)); msg("CASH OUT !"); cActive = false; document.getElementById('c-btn').innerText = "LANCER"; return; }
    if(b > balance) return msg("Fonds insuffisants", false);
    updateBalance(-b); cActive = true; cMult = 1.0; document.getElementById('c-btn').innerText = "CASHOUT";
    let loop = setInterval(() => {
        if(!cActive) { clearInterval(loop); return; }
        cMult += 0.05; document.getElementById('c-mult').innerText = cMult.toFixed(2) + "x";
        if(Math.random() < 0.03) { cActive = false; msg("CRASHED !", false); document.getElementById('c-btn').innerText = "LANCER"; clearInterval(loop); }
    }, 100);
}

// --- AUTRES JEUX (POKER, DICE, HILO, BAC) ---
function playPoker() {
    let b = parseInt(document.getElementById('bet').value); if(b > balance) return msg("Fonds insuffisants", false);
    updateBalance(-b); let h = [getCard(), getCard(), getCard(), getCard(), getCard()];
    document.getElementById('p-area').innerHTML = h.map(cardHTML).join("");
    let counts = {}; h.forEach(c => counts[c.v] = (counts[c.v]||0)+1);
    if(Math.max(...Object.values(counts)) >= 2) { updateBalance(b*2); msg("PAIRE !"); } else msg("PERDU", false);
}
function playDice() {
    let b = parseInt(document.getElementById('bet').value); if(b > balance) return msg("Fonds insuffisants", false);
    updateBalance(-b); let d1 = Math.floor(Math.random()*6)+1, d2 = Math.floor(Math.random()*6)+1;
    document.getElementById('d-res').innerText = d1 + " 🎲 " + d2;
    if((d1+d2) > 7) { updateBalance(b*2); msg("GAGNÉ !"); } else msg("PERDU", false);
}
let hiV = 0;
function startHiLo() {
    let b = parseInt(document.getElementById('bet').value); if(b > balance) return msg("Fonds insuffisants", false);
    updateBalance(-b); let c = getCard(); hiV = c.p; document.getElementById('hi-area').innerHTML = cardHTML(c);
    document.getElementById('hi-setup').classList.add('hidden'); document.getElementById('hi-play').classList.remove('hidden');
}
function playHiLo(m) {
    let b = parseInt(document.getElementById('bet').value), c = getCard(); document.getElementById('hi-area').innerHTML = cardHTML(c);
    if((m==='up' && c.p >= hiV) || (m==='down' && c.p <= hiV)) { updateBalance(b*2); msg("GAGNÉ !"); } else msg("PERDU", false);
    document.getElementById('hi-setup').classList.remove('hidden'); document.getElementById('hi-play').classList.add('hidden');
}
function playBac(s) {
    let b = parseInt(document.getElementById('bet').value); if(b > balance) return msg("Fonds insuffisants", false);
    updateBalance(-b); let p = Math.floor(Math.random()*10), d = Math.floor(Math.random()*10);
    document.getElementById('bac-res').innerText = `Joueur: ${p} | Banque: ${d}`;
    if((s==='p' && p>d) || (s==='b' && d>p)) { updateBalance(b*2); msg("GAGNÉ !"); } else if(p===d) { updateBalance(b); msg("ÉGALITÉ"); } else msg("PERDU", false);
}
