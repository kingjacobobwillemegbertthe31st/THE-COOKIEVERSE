let secretMode = false;
let ritualStep = 0;
let freeMode = false;
let devUnlocked = false;     // permanent after ritual
let devStep = 0;             // progress tracker
let devInputMode = false;    // waiting for code input
let activeEffects = [];
let effectBoxes = [];
let chainActive = false;
let chainValue = 7;
let gcTexts = [];   // waiting for code input
let goldenCookies = [];
let gcTimer = 0;
let gcSpawnTime = 0;
let activeEffect = null;
let effectTimer = 0;
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

  // ===== layout + core init =====
  updateLayout();
  setupCookie();

  // ===== background MUST exist immediately =====
  

  // ===== gameplay init =====
  gcSpawnTime = random(180000, 600000);

  // ===== upgrades =====
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

  // ===== load save AFTER everything exists =====
  loadGame();

  // ===== final stat calc =====
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
  cookies += getCPS() * (deltaTime / 1000);

  updateBounce();

  // visuals
  
  drawForegroundCookies();
  drawMainCookie();

  // ⚠️ TEMP DISABLE MILK (debug)
   drawMilk();

  drawClickEffects();

  // UI
  drawUI();
  drawButtons();
  drawShop();
  drawDevMenu();
  updateGoldenCookies();
drawGoldenCookies();
  drawGCTexts();
  updateEffects();
  drawEffectBoxes();
  for (let e of activeEffects){
  if (e.type === "storm" && random() < 0.12){
    let gain = getCPS() * random(60, 420);

    cookies += gain;

    clickEffects.push({
      x: random(gameWidth()),
      y: random(height),
      value: formatNumber(gain),
      life: 60
    });
  }
}
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
  
  if (devInputMode){
  let code = prompt("Enter code:");
  if (code){
    handleDevInput(code);
  }
  return;
}

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

// ===== RESET / RITUAL GATE =====
if (mouseX > 0 && mouseX < 120 && mouseY > 25 && mouseY < 55){

  // 🔐 secret mode gate
  if (bakeryName === "05379" && !devUnlocked){

    let code = prompt("Ritual input (" + (ritualStep + 1) + "/3):");

    if (code !== null){
      handleRitualInput(code.trim());
    }

    return;
  }

  // 🔥 NORMAL FULL RESET (NO reload)
  fullReset();
  saveGame(); // overwrite save with clean state

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
if (freeMode || cookies >= u.cost){
  if (!freeMode){
    cookies -= u.cost;
  }

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

      let b = buildings[i];
      let y = startY + i * 60;
      let cost = getCost(b);

      if (y < buildingStartY || y > height) continue;

      if (mouseY > y && mouseY < y + 60){

        if (freeMode || cookies >= cost){

          if (!freeMode){
            cookies -= cost;
          }

          b.owned++;
          updateCPS();
          saveGame();
        }

        return;
      }
    }
  }

  
  if (devUnlocked){
  let cx = gameWidth()/2;
  let y = height - 40;

  let w = 110;
  let h = 30;
  let gap = 10;

  for (let i = 0; i < 5; i++){
    let x = cx + (i - 2) * (w + gap);

    if (
      mouseX >= x - w/2 && mouseX <= x + w/2 &&
      mouseY >= y - h/2 && mouseY <= y + h/2
    ){

      // ===== BUTTON ACTIONS =====
      if (i === 0){
        let v = prompt("Set cookies:");
        if (v) cookies = Number(v);
      }

      if (i === 1){
        let v = prompt("Set CPS:");
        if (v) cps = Number(v);
      }

      if (i === 2){
        let v = prompt("Set CPC:");
        if (v) cpc = Number(v);
      }

      if (i === 3){
        let e = prompt("Effect:");
        spawnGoldenCookie(normalizeEffect(e) || null);
      }

    if (i === 4){
  freeMode = !freeMode;
  alert("freeMode: " + freeMode);
}

      return;
    }
  }
}


// ===== COOKIE =====
if (!isClickHandled() &&
    dist(mouseX, mouseY, cookieX, cookieY) < cookieSize/2){

  // 🔥 calculate ONCE (prevents desync bugs)
  let gain = getCPC();

  cookies += gain;
  cookieBounce = 1;

  clickEffects.push({
    x: mouseX,
    y: mouseY,
    value: gain, // ✅ matches real gain
    life: 60
  });
}}

// ================= UI =================
function drawUI(){
  let gw = gameWidth();
  let centerX = gw / 2;

  fill(0);
  textAlign(CENTER, CENTER);

  if (devUnlocked){
    textSize(30);
    text("DEVMODE UNLOCKED", centerX, 40);
  } else {
    textSize(30);
    text("THE COOKIEVERSE", centerX, 30);

    textSize(22);
    text(bakeryName + "'s Bakery", centerX, 65);
  }

  textSize(20);
  text(formatNumber(cookies) + " cookies", centerX, 95);

  textSize(16);
  text("per second: " + formatNumber(getCPS()), centerX, 120);

 
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
  // debug GC button
rectMode(CENTER);
fill(255);
rect(80, height - 40, 140, 30);

fill(0);


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
if (freeMode) return 0;
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

  // single dev flag ONLY
  localStorage.setItem("devUnlocked", devUnlocked ? "true" : "false");
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

  // ONLY SOURCE OF DEV STATE
  devUnlocked = localStorage.getItem("devUnlocked") === "true";

  updateCPS();
}

// ================= RESIZE =================
function windowResized(){
  resizeCanvas(windowWidth, windowHeight);

  updateLayout();
  setupCookie();

  bgLayer = null;        // 🔥 force clean rebuild
  generateBgLayer();     // rebuild immediately
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
    function drawGoldenCookie(gc){
  push();
  translate(gc.x, gc.y);
  scale(gc.scale);

  // golden base
  fill(255, 215, 0);
  noStroke();
  ellipse(0, 0, gc.size);

  // SAME chip layout logic
  fill(120,70,40);

  let rings = 3;
  let maxR = gc.size * 0.4;

  for (let r = 1; r <= rings; r++){
    let radius = maxR * r / rings;
    let count = 6 + r * 4;

    for (let i = 0; i < count; i++){
      let angle = TWO_PI * i / count;
      ellipse(cos(angle)*radius, sin(angle)*radius, gc.size/18);
    }
  }

  pop();
}
    function updateGoldenCookies(){
  gcTimer += deltaTime;

  // spawn
  if (gcTimer >= gcSpawnTime){
    spawnGoldenCookie();
    gcTimer = 0;
    gcSpawnTime = random(180000, 600000);
  }

  // update each GC
  for (let i = goldenCookies.length - 1; i >= 0; i--){
    let gc = goldenCookies[i];

    gc.life += deltaTime;

    // grow (0–1 sec)
    if (gc.life <= 1000){
      gc.scale = gc.life / 1000;
    }
    // full (1–10 sec)
    else if (gc.life <= 10000){
      gc.scale = 1;
    }
    // shrink (10–11 sec)
    else if (gc.life <= 11000){
      gc.scale = 1 - (gc.life - 10000)/1000;
    }

    // remove after 11 sec
    if (gc.life >= 11000){
      goldenCookies.splice(i, 1);
    }
  }

  // effect timer
  if (activeEffect){
    effectTimer -= deltaTime;
    if (effectTimer <= 0){
      activeEffect = null;
    }
  }
}
   function spawnGoldenCookie(effect = null){
  let gw = gameWidth();

  goldenCookies.push({
    x: random(50, gw - 50),
    y: random(100, height - 50),
    size: 80,
    scale: 0,
    life: 0,
    effect: effect // 👈 DO NOT override here
  });
}
    function drawGoldenCookies(){
  for (let gc of goldenCookies){

    // glow
    push();
    translate(gc.x, gc.y);

    noStroke();fill(255, 215, 0, 70);
ellipse(0, 0, gc.size * 1.25 * gc.scale);

    pop();

    drawGoldenCookie(gc);
  }
}
    function activateEffect(effect){
  activeEffect = effect;
  effectTimer = 30000; // 30 sec
}
    function drawGCTexts(){
  for (let i = gcTexts.length - 1; i >= 0; i--){
    let t = gcTexts[i];

    t.y -= 0.5;
    t.life--;

    fill(255, 200, 0);
    textAlign(CENTER, CENTER);
    textSize(16);
    text(t.text, t.x, t.y);

    if (t.life <= 0){
      gcTexts.splice(i, 1);
    }
  }
}
    function addEffect(e){
  e.timeLeft = e.duration;
  activeEffects.push(e);

  effectBoxes.push({
    name: e.name,
    desc: e.desc,
    timeLeft: e.duration
  });
}
function updateEffects(){
  for (let i = activeEffects.length - 1; i >= 0; i--){
    activeEffects[i].timeLeft -= deltaTime;

    if (activeEffects[i].timeLeft <= 0){
      activeEffects.splice(i, 1);
    }
  }

  // 🔥 ADD THIS PART
  for (let i = effectBoxes.length - 1; i >= 0; i--){
    effectBoxes[i].timeLeft -= deltaTime;

    if (effectBoxes[i].timeLeft <= 0){
      effectBoxes.splice(i, 1);
    }
  }
}
function updateCPS(){
  let base = 0;

  // ONLY raw building CPS
  for (let b of buildings){
    base += b.owned * b.cps;
  }

  let globalMultiplier = 1;

  for (let u of upgrades){
    if (!u.bought) continue;

    // ✅ multiplicative global scaling (correct CC behavior)
    if (u.type === "globalCPS"){
      globalMultiplier *= (1 + u.value);
    }

    // ❌ DO NOT add building boosts here anymore
  }

  cps = base * globalMultiplier;

  updateCPC(); // keep this last
}
function getCPS(){
  let base = cps;

  for (let e of activeEffects){

    // ===== GLOBAL MULTIPLIER (Frenzy etc.) =====
    if (e.type === "cpsMult"){
      base *= e.value;
    }

    // ===== BUILDING SPECIAL (FIXED, NO DOUBLE SCALE) =====
    if (e.type === "buildingBoost"){
      let b = buildings.find(x => x.name === e.target);

      if (b){
        let buildingCPS = b.owned * b.cps;

        // only boost THAT building portion
        base += buildingCPS * e.value;
      }
    }

    // ===== STORM DOES NOTHING TO CPS =====
  }

  return base;
}
    function rollEffect(){
  let r = random();

  if (r < 0.20) return "Lucky";
  if (r < 0.40) return "Frenzy";
  if (r < 0.60) return "Building Special";
  if (r < 0.75) return "Click Frenzy";
  if (r < 0.875) return "Cookie Storm";
  return "Cookie Chain";
}
function triggerGoldenCookie(gc){

  if (chainActive){
    cookies += chainValue;

    effectBoxes.push({
      name: "Chain!",
      desc: "+" + formatNumber(chainValue),
      timeLeft: 1000
    });

    chainValue = chainValue * 10 + 7;

    if (chainValue > getCPS()*21600 || chainValue > cookies*0.5){
      chainActive = false;
      return;
    }

    // 🔥 delayed spawn (FIX)
    setTimeout(() => {
      spawnGoldenCookie("Cookie Chain");
    }, 0);

    return;
  }

  let type = gc.effect || rollEffect();

  if (type === "Lucky") doLucky();
  if (type === "Frenzy") doFrenzy();
  if (type === "Building Special") doBuildingSpecial();
  if (type === "Click Frenzy") doClickFrenzy();
  if (type === "Cookie Storm") doStorm();
  if (type === "Cookie Chain") startChain();
}
function doLucky(){
  let gain = min(
    cookies * 0.15 + 13,
    getCPS() * 900 + 13
  );

  cookies += gain;

  // ONLY floating text, NO box
  gcTexts.push({
    x: width/2,
    y: height/2,
    life: 60,
    text: "Lucky! +" + formatNumber(gain)
  });
}
    function doFrenzy(){
  addEffect({
    name: "Frenzy",
    desc: "x7 CpS",
    type: "cpsMult",
    value: 7,
    duration: 77000
  });
}
function doBuildingSpecial(){
  let eligible = buildings.filter(b => b.owned >= 10);

  if (eligible.length === 0){
    doFrenzy();
    return;
  }

  let b = random(eligible);

  let bonus = b.owned * 0.10;

  addEffect({
    name: "Building Special",
    desc: "+" + floor(bonus * 100) + "% CpS (from " + b.name + ")",
    type: "buildingBoost",
    target: b.name, // 🔥 ADD THIS LINE HERE
    value: bonus,
    duration: 30000
  });
}
    function doClickFrenzy(){
  addEffect({
    name: "Click Frenzy",
    desc: "x500 clicks",
    type: "cpcMult",
    value: 500,
    duration: 13000
  });
}
    function doStorm(){
  addEffect({
    name: "Storm",
    desc: "Cookies raining",
    type: "storm",
    duration: 7000
  });
}
function drawEffectBoxes(){
  let w = 200;
  let h = 50;
  let gap = 8;

  let x = gameWidth() - w - 10;
  let y = 70;

  for (let i = effectBoxes.length - 1; i >= 0; i--){
    let b = effectBoxes[i];

    if (b.timeLeft <= 0){
      effectBoxes.splice(i, 1);
      continue;
    }

    let yy = y + i * (h + gap);

    // box
    fill(255);
    stroke(0);
    rect(x, yy, w, h, 6);
    noStroke();

    // name + desc
    fill(0);
    textAlign(LEFT, TOP);
    textSize(12);

    text(b.name, x + 8, yy + 5);
    text(b.desc, x + 8, yy + 20, w - 16);

    // timer
    let t = max(0, ceil(b.timeLeft / 1000));
    textAlign(RIGHT, TOP);
    text(t + "s", x + w - 8, yy + 5);
  }
}
    function getEffectText(effect){
if (effect === "Lucky") return "Lucky!";
  if (effect === "Frenzy") return "Frenzy!";
  if (effect === "Building Special") return "Building Special!";
  if (effect === "Click Frenzy") return "Click Frenzy!";
  if (effect === "Cookie Storm") return "Storm!";
  if (effect === "Cookie Chain") return "Chain!";
  return "???";
}
      function normalizeEffect(input){
  if (!input) return null;

  input = input.toLowerCase();

  if (input.includes("lucky")) return "Lucky";
  if (input.includes("frenzy") && !input.includes("click")) return "Frenzy";
  if (input.includes("click")) return "Click Frenzy";
  if (input.includes("storm")) return "Cookie Storm";
  if (input.includes("chain")) return "Cookie Chain";
  if (input.includes("building")) return "Building Special";

  return null; // fallback → random
}
      function calcLucky(){
  return min(
    cookies * 0.15 + 13,
    getCPS() * 900 + 13
  );
}
      function getCPC(){
  let value = cpc;

  for (let e of activeEffects){
    if (e.type === "cpcMult"){
      value *= e.value;
    }
  }

  return value;
}
    function startChain(){
  chainActive = true;
  chainValue = 7;

  // 🔥 spawn FIRST chain cookie immediately
  spawnGoldenCookie("Cookie Chain");

  effectBoxes.push({
    name: "Cookie Chain!",
    desc: "Keep clicking!",
    timeLeft: 5000
  });
}
    function getDevButtons(){
  return [
    "Set Cookies",
    "Set CPS",
    "Set CPC",
    "Spawn GC",
    "freeMode"
  ];
}

function drawDevMenu(){
  if (!devUnlocked) return;

  let cx = gameWidth()/2;
  let y = height - 40;

  let labels = [
    "Set Cookies",
    "Set CPS",
    "Set CPC",
    "Spawn GC",
    "freeMode"
  ];

  let w = 110;
  let h = 30;
  let gap = 10;

  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  for (let i = 0; i < labels.length; i++){
    let x = cx + (i - 2) * (w + gap);

    fill(255);
    rect(x, y, w, h, 6);

    fill(0);
    textSize(12);
    text(labels[i], x, y);
  }
}
    let bgLayer;
let bgScroll = 0;

 function handleRitualInput(input){

  input = (input || "").trim(); // 🔥 removes hidden spaces

  const step1 = "king jacobob willem egbert the 31st->andreas5613->leezord";
  const step2 = "00011100110123";
  const step3 = "F+DH+BS+EF+DF+CF";

  // optional: case safety
  // input = input.toLowerCase();

  if (ritualStep === 0){
    if (input === step1){
      ritualStep = 1;
      alert("step 1 ok");
    } else {
      ritualStep = 0;
      alert("wrong");
    }
    return;
  }

  if (ritualStep === 1){
    if (input === step2){
      ritualStep = 2;
      alert("step 2 ok");
    } else {
      ritualStep = 0;
      alert("wrong reset");
    }
    return;
  }

  if (ritualStep === 2){
    if (input === step3){
      devUnlocked = true;
      localStorage.setItem("devUnlocked", "true");

      ritualStep = 0;
      devInputMode = false;

      alert("DEV MODE UNLOCKED 🔓");
    } else {
      ritualStep = 0;
      alert("failed reset");
    }
    return;
  }
}
function fullReset(){

  // 🧹 clear ALL saved data
  localStorage.removeItem("cookieSave");
  localStorage.removeItem("devUnlocked");
  localStorage.removeItem("devMode");

  // 🍪 reset core stats
  cookies = 0;
  cps = 0;
  cpc = 1;

  bakeryName = "Your";

  // 🏗 reset buildings
  for (let b of buildings){
    b.owned = 0;
  }

  // 🔧 reset upgrades
  for (let u of upgrades){
    u.bought = false;
  }

  // 🔐 reset dev/ritual state
  devUnlocked = false;
  ritualStep = 0;
  secretMode = false;
  devInputMode = false;

  // 🌌 reset effects
  activeEffects = [];
  effectBoxes = [];
  goldenCookies = [];
  gcTexts = [];

  // 💾 optional: restart background state
  bgLayer = null;
  devUnlocked = false;
localStorage.setItem("devUnlocked", "false");

  console.log("FULL RESET DONE");
}
