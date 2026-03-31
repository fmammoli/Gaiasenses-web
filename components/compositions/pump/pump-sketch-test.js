// --- SIMULADOR DE DADOS (Para testar no Editor Online) ---
window.GaiaSensesData = {
  temperature: 25, // mude para testar (ex: 10 ou 40)
  windSpeed: 5, // mude para testar (ex: 0 ou 20)
  windDeg: 45,
};
// ---------------------------------------------------------

/*
Roots Blower + GaiaSenses (temperatura + vento)
Baseado no sketch de Metamere

Espera um objeto global (por exemplo, preenchido pelo GaiaSenses):

window.GaiaSensesData = {
  temperature: 22, // °C
  windSpeed: 3,    // m/s ou km/h (ajuste o range conforme os dados reais)
  windDeg: 45      // direção do vento em graus
};
*/

let S, W, H, s, w, h;
let wt, wt2;
let D, r, r2, D2;
let touch_margin;
let inc1, inc2, limit1, limit2;
let color1, color2;
let t = 0;
let mX = 0;
let mY = 0;

// ---------- Helpers para clima ----------

// valor numérico com fallback
function defNum(v, fallback) {
  return typeof v === "number" && !isNaN(v) ? v : fallback;
}

// lê temperatura e vento (e normaliza)
function getTempWind() {
  const data = window.GaiaSensesData || {};

  const temperature = defNum(data.temperature, 20); // °C
  const windSpeed = defNum(data.windSpeed, 0); // m/s ou km/h
  const windDeg = defNum(data.windDeg, 0); // graus

  // normalizações simples:
  // ajuste os limites conforme o range típico dos seus dados
  const tempNorm = constrain((temperature - 0) / 40, 0, 1); // 0–40°C → 0–1
  const windNorm = constrain(windSpeed / 20, 0, 1); // 0–20 → 0–1

  return { temperature, windSpeed, windDeg, tempNorm, windNorm };
}

// ---------- p5.js ----------

function setup(init = true) {
  S = min((W = windowWidth), (H = windowHeight));
  s = S / 2;
  w = W / 2;
  h = H / 2;
  wt = S * 0.004;

  if (init) {
    createCanvas(W, H);
    strokeWeight(wt);
    noFill();
    rectMode(CENTER);
  } else {
    resizeCanvas(W, H);
  }

  touch_margin = 0.1;
  background(0);

  D = S * 0.375; // diâmetro do círculo base
  r = D / 2;
  r2 = r / 4; // círculo “tracking”
  D2 = D + 2 * r + 4 * r2; // diâmetro do círculo contêiner
  wt = s / 40;
  wt2 = wt / 2;
  strokeWeight(wt);

  inc1 = TAU / 500;
  inc2 = TAU / 300;
  limit1 = QUARTER_PI - inc1 * 5;
  limit2 = QUARTER_PI - inc2 * 5;

  // cores iniciais só para ter algo antes do primeiro draw()
  color1 = color(0, 100, 250, 150);
  color2 = color(250, 100, 0, 150);

  t = 0;
  mX = 0;
  mY = 0;
  // frameRate(144)
}

function draw() {
  // lê temperatura e vento
  const climate = getTempWind();

  // --- interação com mouse (como no original) ---

  if (mouseIsPressed) {
    mX = constrain(
      map(mouseX / W, touch_margin, 1 - touch_margin, -1, 1),
      -1,
      1,
    );
  }

  let userFactor;
  if (mX < 0) {
    // arrastar à esquerda desacelera
    userFactor = map(mX, -1, 0, 0.2, 1.0);
  } else {
    // arrastar à direita acelera
    userFactor = map(sq(mX), 0, 1, 1.0, 4.0);
  }

  // --- vento → velocidade base ---

  // windNorm: 0 (sem vento) → 1 (vento forte)
  // mapeia para uma faixa de velocidades base
  let baseSpeed = map(climate.windNorm, 0, 1, 0.01, 0.8);

  // passo de tempo final combinando clima + usuário
  const dt = baseSpeed * userFactor * 0.02;
  t += dt;

  // --- fundo neutro ---

  background(0, 10); // alpha baixo para deixar rastro

  translate(w, h);

  // --- temperatura → paleta de cores ---

  // paleta fria e quente para cada rotor
  const cold1 = color(0, 120, 255, 150); // azul
  const warm1 = color(255, 200, 80, 150); // dourado

  const cold2 = color(0, 80, 180, 150); // azul mais escuro
  const warm2 = color(255, 60, 0, 150); // laranja/vermelho

  // interpolação de frio (0) a quente (1)
  color1 = lerpColor(cold1, warm1, climate.tempNorm);
  color2 = lerpColor(cold2, warm2, climate.tempNorm);

  strokeWeight(wt);

  // --- direção do vento → fase dos rotores ---

  const windPhase = radians(climate.windDeg) * 0.25;

  draw_roots(-r, -t + windPhase, color1);
  draw_roots(r, t + HALF_PI + windPhase, color2);
}

function draw_roots(offset, rotation, col) {
  push();
  translate(offset, 0);
  rotate(rotation);
  stroke(col);

  for (let theta = 0; theta < limit1; theta += inc1) {
    const theta2 = theta * 5;
    const x = (r + r2) * cos(theta) + r2 * cos(theta2);
    const y = (r + r2) * sin(theta) + r2 * sin(theta2);
    point(x, y);
    point(x, -y);
    point(-x, y);
    point(-x, -y);
  }

  rotate(HALF_PI);

  for (let theta = 0; theta < limit2; theta += inc2) {
    const theta2 = theta * 3;
    const x = (r - r2) * cos(theta) - r2 * cos(-theta2);
    const y = (r - r2) * sin(theta) - r2 * sin(-theta2);
    point(x, y);
    point(x, -y);
    point(-x, y);
    point(-x, -y);
  }

  pop();
}

function keyPressed() {
  const key_L = key.toLowerCase();
  if (key_L === "f") {
    if (fullscreen()) fullscreen(false);
    else go_fullscreen();
  } else if (key_L === "s") save_img();
  else if (key_L === "r") setup(false);
}

function go_fullscreen() {
  if (fullscreen()) return;
  fullscreen(true);
}

function save_img() {
  let date_time = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  });
  let save_name = `Roots-Blower - ${date_time} - ${W} x ${H}`;
  saveCanvas(save_name, "jpg");
}

function windowResized() {
  if (
    !(
      (windowWidth === H && windowHeight === W) ||
      (windowWidth === W && windowHeight === H)
    )
  ) {
    setup(false);
  }
}
