// 1. INISIALISASI & KONFIGURASI
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelDisplay = document.getElementById("level-display");
const highScoreEl = document.getElementById("high-score");
const menuScreen = document.getElementById("menu-screen");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("start-btn");

const box = 20; // Ukuran satu kotak grid
let score, speed, snake, food, coal, d, gameLoop;
let currentLevel = 1;
let gameActive = false;
let obstacles = [];

// 2. SISTEM SUARA (AUDIO)
let audioCtx;
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(freq, type = 'sine', duration = 0.1) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}
// 3. PENGATURAN LEVEL & RINTANGAN (OBSTACLES)
function setDifficulty(num) {
    initAudio();
    currentLevel = num;
    levelDisplay.innerText = "Level " + num;
    
    // Ambil High Score Khusus Level Ini
    const levelKey = "highScore_level_" + num;
    highScoreEl.innerText = localStorage.getItem(levelKey) || 0;

    // Aktifkan visual tombol level
    document.querySelectorAll('.lvl-btn').forEach(btn => {
        btn.classList.remove('active');
        if(parseInt(btn.innerText) === num) btn.classList.add('active');
    });

    setupObstacles(num);
    startBtn.style.display = "block";
    playSound(400 + (num * 20));
}

function setupObstacles(num) {
    obstacles = [];
    const mid = 10;

    switch(num) {
        case 2: // Titik tengah
            obstacles.push({x: mid * box, y: mid * box});
            break;
        case 3: // 4 Pojok
            for(let i=0; i<3; i++) {
                obstacles.push({x: i*box, y: i*box}, {x: (19-i)*box, y: i*box});
                obstacles.push({x: i*box, y: (19-i)*box}, {x: (19-i)*box, y: (19-i)*box});
            }
            break;
        case 4: // Garis Horizontal
            for (let i = 5; i < 15; i++) obstacles.push({ x: i * box, y: mid * box });
            break;
        case 5: // Garis Vertikal
            for (let i = 5; i < 15; i++) obstacles.push({ x: mid * box, y: i * box });
            break;
        case 6: // Bentuk "+"
            for (let i = 6; i < 14; i++) {
                obstacles.push({ x: mid * box, y: i * box });
                obstacles.push({ x: i * box, y: mid * box });
            }
            break;
        case 7: // Bentuk "X"
            for (let i = 4; i < 16; i++) {
                obstacles.push({ x: i * box, y: i * box });
                obstacles.push({ x: (19-i) * box, y: i * box });
            }
            break;
        case 8: // Labirin Kotak
            for (let i = 5; i < 15; i++) {
                if(i === 10) continue;
                obstacles.push({x: 5*box, y: i*box}, {x: 14*box, y: i*box});
                obstacles.push({x: i*box, y: 5*box}, {x: i*box, y: 14*box});
            }
            break;
        case 9: // Sisir Samping
            for (let i = 0; i < 20; i += 4) {
                for(let j=0; j<6; j++) {
                    obstacles.push({x: j*box, y: i*box}, {x: (19-j)*box, y: (i+2)*box});
                }
            }
            break;
        case 10: // Penjara (Sangat Sulit)
            for (let i = 2; i < 18; i++) {
                if(i % 4 === 0) continue;
                obstacles.push({x: i*box, y: 4*box}, {x: i*box, y: 10*box}, {x: i*box, y: 16*box});
            }
            break;
    }
}

// 4. LOGIKA PERMAINAN (CORE GAMEPLAY)
function startGame() {
    toggleRules(false);
    initAudio();
    menuScreen.style.display = "none";
    overlay.style.display = "none";
    
    speed = 195 - (currentLevel * 15);
    snake = [{x: 2*box, y: 2*box}, {x: 1*box, y: 2*box}, {x: 0*box, y: 2*box}];
    
    score = 0;
    d = "RIGHT"; 
    gameActive = true;
    scoreEl.innerText = score;
    
    generateFood();
    generateCoal();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(draw, speed);
}

function generateFood() { food = getValidRandomPos(); }
function generateCoal() { 
    if (currentLevel < 3) { coal = { x: -100, y: -100 }; return; }
    coal = getValidRandomPos(); 
}

function getValidRandomPos() {
    let pos;
    while(true) {
        pos = { x: Math.floor(Math.random() * 19) * box, y: Math.floor(Math.random() * 19) * box };
        const isSnake = snake.some(p => p.x === pos.x && p.y === pos.y);
        const isObs = obstacles.some(ob => ob.x === pos.x && ob.y === pos.y);
        if(!isSnake && !isObs) return pos;
    }
}

// ==========================================
// 5. RENDERING (GAMBAR ULAR & OBJEK)
// ==========================================
function draw() {
    ctx.fillStyle = "rgba(5, 10, 20, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gambar Rintangan
    obstacles.forEach(ob => {
        ctx.fillStyle = "#4a69bd"; 
        drawRoundedRect(ob.x + 1, ob.y + 1, box - 2, box - 2, 4);
    });

    // Gambar Batu Bara
    if (coal.x >= 0) {
        ctx.save();
        ctx.shadowBlur = 15; ctx.shadowColor = "white";
        ctx.fillStyle = "#333";
        ctx.beginPath(); ctx.arc(coal.x + 10, coal.y + 10, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "white"; ctx.stroke();
        ctx.restore();
    }

    // Gambar Kado
    ctx.fillStyle = "#ff4d4d";
    ctx.fillRect(food.x + 2, food.y + 2, box - 4, box - 4);
    ctx.fillStyle = "white";
    ctx.fillRect(food.x + 9, food.y + 2, 2, 16);
    ctx.fillRect(food.x + 2, food.y + 9, 16, 2);

    // GAMBAR ULAR REALISTIS
    snake.forEach((part, i) => {
        const isHead = i === 0;
        const isTail = i === snake.length - 1;
        
        if (isHead) {
            ctx.fillStyle = "#1b5e20"; // Kepala
            ctx.beginPath();
            ctx.roundRect(part.x, part.y, box, box, [12, 12, 4, 4]);
            ctx.fill();
            // Mata
            ctx.fillStyle = "white";
            let ex1, ey1, ex2, ey2;
            if(d==="RIGHT"){ ex1=part.x+14; ey1=part.y+5; ex2=part.x+14; ey2=part.y+15; }
            else if(d==="LEFT"){ ex1=part.x+6; ey1=part.y+5; ex2=part.x+6; ey2=part.y+15; }
            else if(d==="UP"){ ex1=part.x+5; ey1=part.y+6; ex2=part.x+15; ey2=part.y+6; }
            else { ex1=part.x+5; ey1=part.y+14; ex2=part.x+15; ey2=part.y+14; }
            ctx.beginPath(); ctx.arc(ex1, ey1, 2.5, 0, Math.PI*2); ctx.arc(ex2, ey2, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "black";
            ctx.beginPath(); ctx.arc(ex1, ey1, 1.2, 0, Math.PI*2); ctx.arc(ex2, ey2, 1.2, 0, Math.PI*2); ctx.fill();
        } else if (isTail) {
            ctx.fillStyle = "#4caf50"; // Ekor
            ctx.beginPath(); ctx.arc(part.x + 10, part.y + 10, 6, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = i % 2 === 0 ? "#2e7d32" : "#388e3c"; // Badan sisik
            ctx.beginPath(); ctx.roundRect(part.x + 1, part.y + 1, box - 2, box - 2, 8); ctx.fill();
        }
    });

    // Update Posisi Kepala
    let headX = snake[0].x;
    let headY = snake[0].y;
    if (d === "LEFT") headX -= box;
    if (d === "UP") headY -= box;
    if (d === "RIGHT") headX += box;
    if (d === "DOWN") headY += box;

    // Cek Tabrakan
    if (headX < 0 || headX >= 400 || headY < 0 || headY >= 400 || 
        snake.some(p => p.x === headX && p.y === headY) || 
        obstacles.some(ob => ob.x === headX && ob.y === headY)) {
        gameOver(); return;
    }

    // Makan?
    if (headX === food.x && headY === food.y) {
        score++; scoreEl.innerText = score; playSound(600); generateFood();
        if (score % 3 === 0) generateCoal();
    } else if (headX === coal.x && headY === coal.y) {
        score = Math.max(0, score - 2); scoreEl.innerText = score;
        playSound(150, 'square'); if (snake.length > 3) snake.splice(3); generateCoal();
    } else {
        snake.pop();
    }
    snake.unshift({x: headX, y: headY});
}

function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x+r, y); ctx.arcTo(x+w, y, x+w, y+h, r); 
    ctx.arcTo(x+w, y+h, x, y+h, r); ctx.arcTo(x, y+h, x, y, r); 
    ctx.arcTo(x, y, x+w, y, r); ctx.closePath(); ctx.fill();
}

// ==========================================
// 6. MODAL, DEKORASI, & GAME OVER
// ==========================================
function toggleRules(show) {
    document.getElementById("rules-modal").style.display = show ? "flex" : "none";
}

function gameOver() {
    gameActive = false; playSound(150, 'sawtooth', 0.5); clearInterval(gameLoop);
    const levelKey = "highScore_level_" + currentLevel;
    if (score > (localStorage.getItem(levelKey) || 0)) localStorage.setItem(levelKey, score);
    document.getElementById("final-score").innerText = score; overlay.style.display = "flex";
}

function backToMenu() {
    overlay.style.display = "none"; menuScreen.style.display = "flex"; startBtn.style.display = "none";
    setDifficulty(currentLevel);
}

// Bintang Aurora
function createStars() {
    for (let i = 0; i < 80; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.width = star.style.height = `${Math.random()*3}px`;
        star.style.top = `${Math.random()*100}vh`; star.style.left = `${Math.random()*100}vw`;
        star.style.setProperty('--duration', `${2+Math.random()*3}s`);
        document.body.appendChild(star);
    }
}

// Salju
function createSnow() {
    const container = document.getElementById('snow-container');
    if(!container) return;
    for (let i = 0; i < 40; i++) {
        let s = document.createElement('div'); s.className = 'snow';
        s.style.cssText = `left:${Math.random()*100}vw; width:${Math.random()*3+2}px; height:${Math.random()*3+2}px; animation-duration:${Math.random()*3+5}s; opacity:${Math.random()}`;
        container.appendChild(s);
    }
}

// Kontrol
document.addEventListener("keydown", e => {
    if (!gameActive) return;
    if (e.keyCode == 37 && d != "RIGHT") d = "LEFT";
    else if (e.keyCode == 38 && d != "DOWN") d = "UP";
    else if (e.keyCode == 39 && d != "LEFT") d = "RIGHT";
    else if (e.keyCode == 40 && d != "UP") d = "DOWN";
});

function handleTouch(dir) { if (gameActive) d = dir; initAudio(); }

createStars(); createSnow();