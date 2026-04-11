// ================= CORE =================
let cpcMultiplier = 1;
let shopScroll = 0;
let upgrades = [];
let milkOffset = 0;
let bakeryName = "Your";
let bgCookies = [];
let fgCookies = [];
let cookieChips = [];
let clickEffects = [];
let cookieX, cookieY, cookieSize;
let cookies = 0, cps = 0, cpc = 1;

let cookieScale = 1;
let cookieBounce = 0;

let shopWidth = 0;

let buildings = [
  { name: "Cursor", baseCost: 15, cps: 0.1, owned: 0, icon: "👆", desc: "A lonely finger that never stops clicking." },
  { name: "Grandma", baseCost: 120, cps: 0.8, owned: 0, icon: "👵", desc: "She smiles while baking." },
  { name: "Kitchen", baseCost: 900, cps: 5, owned: 0, icon: "🍳", desc: "Multiple ovens." },
  { name: "Bakery Stand", baseCost: 6000, cps: 20, owned: 0, icon: "🏪", desc: "People line up." },
  { name: "Delivery Van", baseCost: 40000, cps: 90, owned: 0, icon: "🚚", desc: "Strange routes." },
  { name: "Cookie Lab", baseCost: 300000, cps: 450, owned: 0, icon: "🧪", desc: "Science cookies." },
  { name: "Flavor Reactor", baseCost: 2200000, cps: 2500, owned: 0, icon: "⚛️", desc: "Unstable flavor." },
  { name: "Dream Factory", baseCost: 15000000, cps: 14000, owned: 0, icon: "🌌", desc: "Impossible cookies." }
];

// ================= SETUP =================
function setup(){
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  // layout FIRST
  updateLayout();
  setupCookie();

  // ===== UPGRADES =====
  upgrades = [
  {
    id: 0,
    icon: "🖱️",
    name: "Reinforced Finger",
    cost: 120,
    type: "cpc",
    value: 1,
    desc: "Clicks are slightly stronger.",
    unlocked: true,
    bought: false
  },
  {
    id: 1,
    icon: "🖱️",
    name: "Rapid Clicking",
    cost: 600,
    type: "cpc",
    value: 2,
    desc: "Faster clicking increases output.",
    unlocked: true,
    bought: false
  },
  {
    id: 2,
    icon: "👆",
    name: "Cursor Training",
    cost: 2500,
    type: "building",
    target: "Cursor",
    value: 0.5,
    desc: "Cursors are more efficient.",
    unlocked: true,
    bought: false
  },
  {
    id: 3,
    icon: "⚙️",
    name: "Production Boost",
    cost: 8000,
    type: "globalCPS",
    value: 0.2,
    desc: "All production increases slightly.",
    unlocked: true,
    bought: false
  },
  {
    id: 4,
    icon: "🖱️",
    name: "Heavy Clicks",
    cost: 25000,
    type: "cpc",
    value: 4,
    desc: "Clicks become much stronger.",
    unlocked: true,
    bought: false
  },
  {
    id: 5,
    icon: "🍳",
    name: "Kitchen Efficiency",
    cost: 90000,
    type: "building",
    target: "Kitchen",
    value: 0.5,
    desc: "Kitchens work faster.",
    unlocked: true,
    bought: false
  },
  {
    id: 6,
    icon: "🖱️",
    name: "Click Overload",
    cost: 300000,
    type: "cpc",
    value: 8,
    desc: "Clicks become extremely powerful.",
    unlocked: true,
    bought: false
  },
  {
    id: 7,
    icon: "📦",
    name: "Bulk Baking",
    cost: 1000000,
    type: "globalCPS",
    value: 0.3,
    desc: "Mass production improves output.",
    unlocked: true,
    bought: false
  },
  {
    id: 8,
    icon: "✨",
    name: "Golden Touch",
    cost: 6000000,
    type: "clickCPSPercent",
    value: 0.01,
    desc: "Each click gives bonus cookies equal to 1% of CPS.",
    unlocked: true,
    bought: false
  },
  {
    id: 9,
    icon: "🌌",
    name: "Dream Amplification",
    cost: 75000000,
    type: "globalCPS",
    value: 0.5,
    desc: "Dreams produce more cookies.",
    unlocked: true,
    bought: false
  }
];

  // LOAD AFTER defining upgrades
  loadGame();

  // calculate stats AFTER loading
  updateCPS();
}

// ================= DRAW =================
function draw(){
  resetMatrix();   // 🔥 THIS FIXES EVERYTHING SHIFT RELATED
  rectMode(CORNER);
imageMode(CORNER);

  // background layer
  drawStripedBG();

  // game logic
  cookies += cps * (deltaTime / 1000);

  updateBounce();

  // visuals
  drawBackgroundCookies();
  drawForegroundCookies();
  drawMainCookie();

  // ⚠️ TEMP DISABLE MILK (debug)
   drawMilk();

  drawClickEffects();

  // UI
  drawUI();
  drawButtons();
  drawShop();
}
// ================= COOKIE =================
function setupCookie(){
  // ONLY generate chips
  cookieChips = [];

  let rings = 3;
  let maxR = cookieSize * 0.4;

  for (let r = 1; r <= rings; r++){
    let radius = maxR * r / rings;
    let count = 6 + r * 4;

    for (let i = 0; i < count; i++){
      let angle = TWO_PI * i / count;

      cookieChips.push({
        x: cos(angle) * radius,
        y: sin(angle) * radius,
        s: cookieSize / 18
      });
    }
  }
}

function drawMainCookie(){
  push();
  translate(cookieX, cookieY);
  scale(cookieScale);

  drawCookieShape(0, 0, cookieSize);

  pop();
}

// ================= CLICK =================
function mousePressed(){
  let gw = gameWidth();
  let centerX = gw / 2;
  let panelX = width - shopWidth;

  // ===== NAME =====
  if (mouseX > centerX - 150 && mouseX < centerX + 150 &&
      mouseY > 50 && mouseY < 80){
    let newName = prompt("Enter bakery name:", bakeryName);
    if (newName){
      bakeryName = newName;
      saveGame();
    }
    return;
  }

  // ===== RESET =====
  if (mouseX > 0 && mouseX < 120 && mouseY > 25 && mouseY < 55){
    localStorage.removeItem("cookieSave");
    location.reload();
    return;
  }

  // ===== FULLSCREEN =====
  let fx = getFullscreenButtonX();
  if (mouseX > fx - 60 && mouseX < fx + 60 &&
      mouseY > 25 && mouseY < 55){
    let fs = fullscreen();
    fullscreen(!fs);
    resizeCanvas(windowWidth, windowHeight);
    updateLayout();
    setupCookie();
    return;
  }

  // ===== UPGRADES =====
  let cols = 5;
  let padding = 8;
  let cellW = (shopWidth - padding * (cols + 1)) / cols;
  let cellH = cellW;

  let upgradeAreaH = height * 0.25;
  let upgradeStartY = 60;

  let visibleUpgrades = upgrades.filter(u => u.unlocked && !u.bought);

  for (let i = 0; i < visibleUpgrades.length; i++){
    let u = visibleUpgrades[i];

    let col = i % cols;
    let row = floor(i / cols);

    let x = panelX + padding + col * (cellW + padding);
    let y = upgradeStartY + 20 + row * (cellH + padding);

    if (y > upgradeStartY + upgradeAreaH) continue;

    if (
      mouseX >= x && mouseX <= x + cellW &&
      mouseY >= y && mouseY <= y + cellH
    ){
      if (cookies >= u.cost){
        cookies -= u.cost;
        u.bought = true;
        updateCPS();
        saveGame();
      }
      return;
    }
  }

  // ===== BUILDINGS =====
  let buildingStartY = 60 + upgradeAreaH + 10;
  let startY = buildingStartY + 20 - shopScroll;

  if (mouseX > panelX){
    for (let i = 0; i < buildings.length; i++){
      let y = startY + i * 60;
      let cost = getCost(buildings[i]);

      if (y < buildingStartY || y > height) continue;

      if (mouseY > y && mouseY < y + 60){
        if (cookies >= cost){
          cookies -= cost;
          buildings[i].owned++;
          updateCPS();
          saveGame();
        }
        return;
      }
    }
  }

  // ===== COOKIE =====
  if (!isClickHandled() &&
      dist(mouseX, mouseY, cookieX, cookieY) < cookieSize/2){

    cookies += cpc * cpcMultiplier;
    cookieBounce = 1;

    clickEffects.push({
      x: mouseX,
      y: mouseY,
      value: cpc * cpcMultiplier,
      life: 60
    });
  }
}

// ================= UI =================
function drawUI(){
  let gw = gameWidth();
  let centerX = gw / 2;

  fill(0);
  textAlign(CENTER, CENTER);

  textSize(30);
  text("THE COOKIEVERSE", centerX, 30);

  textSize(22);
  text(bakeryName + "'s Bakery", centerX, 65);

  textSize(20);
  text(formatNumber(cookies) + " cookies", centerX, 95);

  textSize(16);
  text("per second: " + formatNumber(cps), centerX, 120);
}

// ================= SHOP =================
function drawShop(){
  let panelX = floor(width - shopWidth);
  let panelW = shopWidth;

  let upgradeAreaH = height * 0.25; // ✅ fixed size
  let upgradeStartY = 60;
  let buildingStartY = upgradeStartY + upgradeAreaH + 20;

  // background
  fill(220);
  rect(panelX, 0, panelW, height);

  // titles
  fill(0);
  textAlign(CENTER, TOP);

  textSize(20);
  text("Shop", panelX + panelW/2, 20);

  textSize(16);
  text("Upgrades", panelX + panelW/2, 60);

// ===== UPGRADE GRID =====
let cols = 5;
let padding = 8;

let cellW = (panelW - padding * (cols + 1)) / cols;
let cellH = cellW;

upgradeAreaH = height * 0.25;
upgradeStartY = 60;

let visibleUpgrades = upgrades.filter(u => u.unlocked && !u.bought);

let hoveredUpgrade = null;

for (let i = 0; i < visibleUpgrades.length; i++){
  let u = visibleUpgrades[i];

  let col = i % cols;
  let row = floor(i / cols);

  let x = panelX + padding + col * (cellW + padding);
  let y = upgradeStartY + 20 + row * (cellH + padding);

  if (y > upgradeStartY + upgradeAreaH) continue;

  let hover =
    mouseX >= x && mouseX <= x + cellW &&
    mouseY >= y && mouseY <= y + cellH;

  if (hover) hoveredUpgrade = u;

  fill(cookies >= u.cost ? 255 : 180);
  rect(x, y, cellW, cellH, 6);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(20);
  text(u.icon, x + cellW/2, y + cellH/2);
}

  // ===== TOOLTIP =====
  if (hoveredUpgrade){
    let boxW = 220;
    let boxH = 120;

    let boxX = panelX - boxW - 10;
    let boxY = constrain(mouseY, 0, height - boxH);

    fill(255);
    stroke(0);
    rect(boxX, boxY, boxW, boxH, 6);
    noStroke();

    fill(0);
    textAlign(LEFT, TOP);

    textSize(13);
    text(hoveredUpgrade.name, boxX + 10, boxY + 8);

    textSize(11);
    text("Cost: " + formatNumber(hoveredUpgrade.cost), boxX + 10, boxY + 25);

    text(hoveredUpgrade.effect || "", boxX + 10, boxY + 45, boxW - 20);
    text(hoveredUpgrade.desc || "", boxX + 10, boxY + 75, boxW - 20);
  }

  // ===== SEPARATOR =====
  stroke(0);
  line(panelX, buildingStartY - 5, panelX + panelW, buildingStartY - 5);
  noStroke();

  fill(0);
  textSize(16);
  textAlign(CENTER, TOP);
  text("Buildings", panelX + panelW/2, buildingStartY);

  // ===== BUILDINGS =====
  let startY = buildingStartY + 20 - shopScroll;
  let itemH = 60;

  let hovered = null;

  for (let i = 0; i < buildings.length; i++){
    let b = buildings[i];
    let y = startY + i * itemH;

    // ✅ FIXED CLIPPING (before drawing!!)
    if (y + itemH < buildingStartY + 20 || y > height) continue;

    let cost = getCost(b);

    let hover =
      mouseX >= panelX &&
      mouseX <= width &&
      mouseY >= y &&
      mouseY <= y + itemH;

    if (hover) hovered = b;

    fill(cookies >= cost ? (hover ? 180 : 255) : 230);
    rect(panelX + 5, y, panelW - 10, itemH - 5);

    fill(0);
    textAlign(LEFT, TOP);
    textSize(14);
    text(b.icon + " " + b.name + " (" + b.owned + ")", panelX + 10, y + 5);

    textSize(12);
    text("Cost: " + formatNumber(cost), panelX + 10, y + 25);
  }

  // ===== BUILDING TOOLTIP =====
  if (hovered){
    let boxW = 220;
    let boxH = 110;

    let boxX = panelX - boxW - 10;
    let boxY = constrain(mouseY, 0, height - boxH);

    fill(255);
    stroke(0);
    rect(boxX, boxY, boxW, boxH, 5);
    noStroke();

    fill(0);
    textAlign(LEFT, TOP);

    textSize(13);
    text(hovered.name, boxX + 10, boxY + 8);

    textSize(12);
    text("CPS: " + hovered.cps, boxX + 10, boxY + 25);

    text(hovered.desc, boxX + 10, boxY + 45, boxW - 20);
  }
}

// ================= BUTTONS =================
function drawButtons(){
  push(); // ✅ isolate state

  rectMode(CENTER);

  let resetX = 60;
  let fullX = width - shopWidth - 60;

  fill(255);
  rect(resetX, 40, 120, 30);
  rect(fullX, 40, 120, 30);

  fill(0);
  textAlign(CENTER, CENTER);

  text("Reset", resetX, 40);
  text("Fullscreen", fullX, 40);

  pop(); // ✅ restore state
}
// ================= SYSTEM =================
function updateCPS(){
  let base = 0;

  // base CPS from buildings
  for (let b of buildings){
    base += b.owned * b.cps;
  }

  let globalMultiplier = 1;

  for (let u of upgrades){
    if (!u.bought) continue;

    if (u.type === "globalCPS"){
      globalMultiplier += u.value;
    }

    if (u.type === "building"){
      let b = buildings.find(x => x.name === u.target);
      if (b){
        base += b.owned * b.cps * u.value;
      }
    }
  }

  cps = base * globalMultiplier;

  updateCPC(); // keep this LAST
}

function getCost(b){
  return floor(b.baseCost * pow(1.16, b.owned));
}

function gameWidth(){
  return width - shopWidth;
}

function updateBounce(){
  if (cookieBounce > 0){
    cookieBounce -= 0.1;
    cookieScale = 1 + sin(cookieBounce * PI) * 0.1;
  } else {
    cookieScale = 1;
  }
}

// ================= SAVE =================
function saveGame(){
  localStorage.setItem("cookieSave", JSON.stringify({
    cookies,
    bakeryName,

    buildings: buildings.map(b => ({
      owned: b.owned
    })),

    upgrades: upgrades.map(u => ({
      bought: u.bought
    }))
  }));
}
function loadGame(){
  let data = localStorage.getItem("cookieSave");
  if (!data) return;

  data = JSON.parse(data);

  cookies = data.cookies || 0;
  bakeryName = data.bakeryName || "Your";

  if (data.buildings){
    for (let i = 0; i < buildings.length; i++){
      buildings[i].owned = data.buildings[i]?.owned || 0;
    }
  }

  if (data.upgrades){
    for (let i = 0; i < upgrades.length; i++){
      upgrades[i].bought = data.upgrades[i]?.bought || false;
    }
  }

  // 🔥 THIS IS THE FIX
  updateCPS();
}

// ================= RESIZE =================
function windowResized(){
  resizeCanvas(windowWidth, windowHeight);

  updateLayout();   // ✅
  setupCookie();
}
  function drawCookieShape(x, y, size){
  push();
  translate(x, y);

  fill(210,160,100);
  noStroke();
  ellipse(0, 0, size);

  fill(120,70,40);

  let rings = 3;
  let maxR = size * 0.4;

  for (let r = 1; r <= rings; r++){
    let radius = maxR * r / rings;
    let count = 6 + r * 4;

    for (let i = 0; i < count; i++){
      let angle = TWO_PI * i / count;
      ellipse(cos(angle)*radius, sin(angle)*radius, size/18);
    }
  }

  pop();
}
 function drawClickEffects(){
  for (let i = clickEffects.length - 1; i >= 0; i--){
    let e = clickEffects[i];

    e.y -= 1.2;
    e.life--;

    push();
    translate(e.x - 12, e.y);
    scale(0.15);
    drawCookieShape(0, 0, cookieSize);
    pop();

    fill(0);
    textSize(14);
    textAlign(LEFT, CENTER);
    text("+" + e.value, e.x + 8, e.y);

    if (e.life <= 0){
      clickEffects.splice(i, 1);
    }
  }
}
function drawForegroundCookies(){
  let gw = gameWidth();
  let target = min(floor(cps), 30);

  while (fgCookies.length < target){
    fgCookies.push({
      x: random(gw),
      y: random(-50, height),
      size: random(45, 70),
      speed: random(0.8, 1.8),
      wobble: random(TWO_PI)
    });
  }

  while (fgCookies.length > target){
    fgCookies.pop();
  }

  for (let c of fgCookies){
    c.wobble += 0.05;

    c.y += c.speed;
    c.x += sin(c.wobble) * 0.5;

    // HARD CLAMP (NO WRAP = NO DRAG)
    c.x = constrain(c.x, 0, gw);

    if (c.y > height + 50){
      c.y = -50;
      c.x = random(gw);
    }

    drawCookieShape(c.x, c.y, c.size);
  }
}
function drawBackgroundCookies(){
  let gw = gameWidth();

  // ===== ORIGINAL THRESHOLDS (UNCHANGED) =====
  let percent = 0;
  if (cps > 1000) percent = 0.8;
  else if (cps > 500) percent = 0.5;
  else if (cps > 50) percent = 0.25;

  let area = gw * height;

  let avgSize = 26;
  let cookieArea = PI * pow(avgSize/2, 2);

  // ===== TARGET =====
  let target = floor((area * percent) / cookieArea);

  // ===== FIX: REMOVE HARD CAP EFFECT =====
  // old: constrain(target, 0, 120);
  // new:
  let maxCap = floor(area / cookieArea); // true max possible density
  target = constrain(target, 0, maxCap);

  // ===== SPAWN / DESPAWN =====
  while (bgCookies.length < target){
    bgCookies.push({
      x: random(gw),
      y: random(height),
      size: random(18, 35),
      speed: random(0.2, 0.6),
      wobble: random(TWO_PI)
    });
  }

  while (bgCookies.length > target){
    bgCookies.pop();
  }

  // ===== UPDATE =====
  for (let c of bgCookies){
    c.wobble += 0.03;

    c.y += c.speed;
    c.x += sin(c.wobble) * 0.3;

    c.x = constrain(c.x, 0, gw);

    if (c.y > height + 60){
      c.y = -60;
      c.x = random(gw);
    }

    drawCookieShape(c.x, c.y, c.size);
  }
}
function formatNumber(num){
  if (num < 1000) return num.toFixed(1);

  let units = [
    "thousand","million","billion","trillion",
    "quadrillion","quintillion","sextillion",
    "septillion","octillion","nonillion","decillion"
  ];

  let i = -1;

  while (num >= 1000 && i < units.length - 1){
    num /= 1000;
    i++;
  }

  // 🔥 if beyond known units → fallback to scientific
  if (num >= 1000){
    return num.toExponential(2);
  }

  return num.toFixed(1) + " " + units[i];
}
 

function drawStripedBG(){
  let stripeW = 80;

  noStroke();

  for (let x = 0; x < width; x += stripeW){
    fill((x / stripeW) % 2 === 0
      ? color(70,130,220)
      : color(100,180,255));

    rect(x, 0, stripeW, height);
  }
}
function drawMilk(){
  push(); // ✅ isolate everything

  let gw = gameWidth();
  let top = cookieY + cookieSize / 2 + 20;

  noStroke();
  fill(255, 240);

  beginShape();

  // bottom left
  vertex(0, height);

  // top left
  vertex(0, top);

  // wave
  for (let x = 0; x <= gw; x += 10){
    let y = top + sin(x * 0.05 + milkOffset) * 6;
    vertex(x, y);
  }

  // top right
  vertex(gw, top);

  // bottom right
  vertex(gw, height);

  endShape(CLOSE);

  pop(); // ✅ restore state

  milkOffset += 0.02;
}
  function getFullscreenButtonX(){
  return width - shopWidth - 60;
}
  function updateLayout(){
  shopWidth = width / 3;

  cookieSize = min(width - shopWidth, height) / 3;
  cookieX = (width - shopWidth) / 2;
  cookieY = height / 2;
}
function isClickHandled(){
  // shop area blocks clicks
  if (mouseX > width - shopWidth) return true;

  // top UI buttons area (reset + fullscreen)
  if (mouseY > 25 && mouseY < 55){
    if (mouseX < 120) return true; // reset
    if (mouseX > width - shopWidth - 120) return true; // fullscreen
  }

  // bakery name area (rename)
  let gw = gameWidth();
  let centerX = gw / 2;

  if (mouseX > centerX - 150 && mouseX < centerX + 150 &&
      mouseY > 50 && mouseY < 80){
    return true;
  }

  return false;
}
  function mouseWheel(event){
  let panelX = width - shopWidth;

  // only scroll when mouse is in shop
  if (mouseX > panelX){

    shopScroll += event.delta;

    // clamp scroll (prevents going too far)
    let visibleHeight = height - (height * 0.25 + 100);
let totalHeight = buildings.length * 60;

let maxScroll = max(0, totalHeight - visibleHeight);

    shopScroll = constrain(shopScroll, 0, maxScroll);
  }
}
function updateCPC(){
  let base = 1;

  for (let u of upgrades){
    if (!u.bought) continue;

    if (u.type === "cpc"){
      base += u.value;
    }
  }

  cpc = floor(base); // 👈 keeps it clean integers
}
