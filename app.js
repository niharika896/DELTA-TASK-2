const canvas = document.getElementById("canvas");
const omega = Math.PI / 180; //rad eq of 1 deg
const c = canvas.getContext("2d");
let c_clicked=false;
const centralHub=document.getElementById("central_hub");
let isPlay = true;
canvas.width = innerWidth + 10;
canvas.height = innerHeight + 90;
let position = { x: 880, y: 440 };
let velocity = { x: 0, y: 0 };
let bull_vel = { x: 3, y: 3 };
let player_health = 10;
spacing = 40;
plot_w = 140;
let bullets = new Map();
let keys_count=0;
let keys_array = new Map();
let shards=[]
let system_health=80;
let shards_delivered=0;
setInterval(()=>{
  if(isPlay)system_health-=0.1;
  document.getElementById("sh").innerHTML=`System Health: ${Math.round(system_health)}`;
},5000)
const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

class Square {
  constructor({ spacing, plot_w, x, y, color }) {
    this.x = x;
    this.y = y;
    this.spacing = spacing;
    this.width = plot_w;
    this.towers = [];
    this.color = color;
    for (let i = 0; i < 4; i++) {
      let r_x = 90 * Math.random();
      let r_y = 90 * Math.random();
      this.towers.push({ x: r_x, y: r_y });
    }
  }

  draw() {
    c.strokeStyle = "#00FF01";
    c.lineWidth = 4;
    c.strokeRect(
      this.x,
      this.y,
      this.spacing * 2 + this.width,
      this.spacing * 2 + this.width
    );
    c.fillStyle = this.color;
    c.fillRect(this.x + this.spacing, this.y + this.spacing, plot_w, plot_w);
    //inner towers
    c.fillStyle = "black";
    this.towers.forEach((tower) => {
      c.fillRect(
        this.x + this.spacing + 5 + tower.x,
        this.y + this.spacing + 5 + tower.y,
        40,
        40
      );
    });
  }
}

class Radar {
  constructor({ spacing, plot_w, x, y, omega = omega }) {
    this.x = x;
    this.y = y;
    this.spacing = spacing;
    this.width = plot_w;
    this.dtheta = omega;
    this.theta = Math.random() * 2 * Math.PI;
    this.centerX = this.x + this.spacing + this.width / 2;
    this.centerY = this.y + this.spacing + this.width / 2;
    this.radius = this.spacing + this.width / 2;
  }
  draw() {
    c.save();

    c.beginPath();
    c.moveTo(this.centerX, this.centerY);
    c.globalAlpha = 0.3;
    c.fillStyle = "red";
    c.arc(
      this.centerX,
      this.centerY,
      this.radius,
      this.theta,
      this.theta + Math.PI / 3
    );
    c.fill();
    c.closePath();

    c.beginPath();
    c.lineWidth = 2;
    c.moveTo(this.centerX, this.centerY);
    c.globalAlpha = 1; // Reset to full opacity
    c.strokeStyle = "red";
    c.arc(
      this.centerX,
      this.centerY,
      this.radius,
      this.theta,
      this.theta + Math.PI / 3
    );
    c.lineTo(this.centerX, this.centerY); // Close the sector
    c.stroke();
    c.closePath();

    c.restore();
  }
  update() {
    this.theta += this.dtheta;
    this.theta = this.theta%(2*Math.PI);
    this.draw();
  }
  check() {
  document.getElementById("ph").innerHTML= `Player Health: ${player_health.toFixed(2)}`;
  const dx = player.position.x - this.centerX;
  const dy = player.position.y - this.centerY;
  const distance = Math.hypot(dx, dy);

  if (distance <= this.radius) {
    let angleToPlayer = Math.atan2(dy, dx);
    if (angleToPlayer < 0) angleToPlayer += 2 * Math.PI;

    let start = this.theta;
    let end = (start + Math.PI / 3) % (2 * Math.PI);

    let inSector = start < end ? angleToPlayer >= start && angleToPlayer <= end : angleToPlayer >= start || angleToPlayer <= end;

    if (inSector) {
      player_health -= 0.01;
    }
  }
}

}

class Player {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, 12, 0, Math.PI * 2, false);
    c.fillStyle = "#FF00FF";
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Bullet {
  static nextId = 0;

  constructor({ player_pos }) {
    this.id = Bullet.nextId++;
    this.velocity = { x: 0, y: 0 };
    switch (lastKey) {
      case "w":
        this.velocity.y = -3;
        break;
      case "a":
        this.velocity.x = -3;
        break;
      case "s":
        this.velocity.y = +3;
        break;
      case "d":
        this.velocity.x = +3;
        break;
    }
    this.position = { x: 0, y: 0 };
    this.position.x = player_pos.x;
    this.position.y = player_pos.y;
  }
  draw() {
    c.beginPath();
    c.fillStyle = "white";
    c.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false);
    c.fill();
    c.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Key {
  static nextId=0;

  constructor() {
    this.id=Key.nextId++;
    this.x=Math.random()*canvas.width;
    this.y=Math.random()*canvas.height;
  }
  draw(){
    c.beginPath();
    c.fillStyle="#FFFF00";
    c.arc(this.x,this.y,6,0,Math.PI*2,false);
    c.fill();
    c.closePath();
  }
  update() {
  document.getElementById("keys").innerHTML=`Keys: ${keys_count}`
  const dx = this.x - player.position.x;
  const dy = this.y - player.position.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 18) {
    keys_array.delete(this.id);
    keys_count++;
  }
  if(keys_array.size<7){
    let key=new Key();
    keys_array.set(key.id,key);
  }
}

}

let player = new Player({ position, velocity });
player.draw();

let buildings = [];
let radars = [];
let central_x = Math.floor(Math.random() * 6);
let central_y = Math.floor(Math.random() * 4);
for (let j = 0; j < 7; j++) {
  (buildings[j] = []), (radars[j] = []);
  let color;
  for (let k = 0; k < 4; k++) {
    if (j == central_x && k == central_y) {
      color = "aqua";
    } else {
      color = "#00FF01";
    }
    let sq = new Square({
      spacing: spacing,
      plot_w: plot_w,
      x: j * 220,
      y: k * 220,
      color: color,
    });
    sq.draw();
    let rd = new Radar({
      spacing: spacing,
      plot_w: plot_w,
      x: j * 220,
      y: k * 220,
      omega: 2*omega,
    });
    rd.draw();

    buildings[j][k] = sq;
    radars[j][k] = rd;
  }
}

for(let j=0;j<7;j++){
  let key = new Key();
  keys_array.set(key.id,key);
}

let lastKey = "w";

function animate() {
  checkWinLoss()
  if (isPlay) requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  buildings.forEach((row) => row.forEach((b) => b.draw()));
  radars.forEach((row) =>
    row.forEach((rd) => {
      if(rd){
      rd.update();
      rd.check();
      }
    })
  );
  player.update();
  for (const [id, bullet] of bullets) {
    if (!willCollide(bullet, 0, 0)) bullet.update();
    else {
      let cords = willCollide(bullet, 0, 0);
      if (cords[0] == central_x && cords[1] == central_y);
      else {
        buildings[cords[0]][cords[1]].towers[cords[2]] = 0; //building has been removed
      }
      let towers = buildings[cords[0]][cords[1]].towers;
        if (towers.every(tower => tower === 0)) {
          radars[cords[0]][cords[1]] = 0;
        }

      if (bullet.velocity.x > 0) {
        bullet.velocity.x--;
        bullet.velocity.x = -bullet.velocity.x;
      } else if (bullet.velocity.x < 0) {
        bullet.velocity.x = -bullet.velocity.x;
        bullet.velocity.x--;
      }
      if (bullet.velocity.y > 0) {
        bullet.velocity.y--;
        bullet.velocity.y = -bullet.velocity.y;
      } else if (bullet.velocity.y < 0) {
        bullet.velocity.y = -bullet.velocity.y;
        bullet.velocity.y--;
      }
      if (bullet.velocity.y == 0 && bullet.velocity.x == 0) {
        bullets.delete(id);
      }
    }
  }
  player.velocity.x = 0;
  player.velocity.y = 0;
  if (
    keys.w.pressed &&
    lastKey === "w" &&
    player.position.y - 12 > 0 &&
    !willCollide(player, 0, -5)
  ) {
    player.velocity.y = -5;
  }
  if (
    keys.a.pressed &&
    lastKey === "a" &&
    player.position.x - 12 > 0 &&
    !willCollide(player, -5, 0)
  ) {
    player.velocity.x = -5;
  }
  if (
    keys.s.pressed &&
    lastKey === "s" &&
    player.position.y + 12 < canvas.height &&
    !willCollide(player, 0, 5)
  ) {
    player.velocity.y = 5;
  }
  if (
    keys.d.pressed &&
    lastKey === "d" &&
    player.position.x + 12 < canvas.width &&
    !willCollide(player, 5, 0)
  ) {
    player.velocity.x = 5;
  }
  for(const [id,key] of keys_array){
    key.draw();
    key.update();
  }
}

function createBullets() {
  const newBullet = new Bullet({ player_pos: player.position });
  bullets.set(newBullet.id, newBullet);
  newBullet.draw();
}

async function openCentralHub() {
  const ul = centralHub.querySelector("ul");
  ul.innerHTML='';
  let li=document.createElement('li');
  li.innerHTML=`You have ${keys_count} keys`;
  li.id="keysLi";
  ul.appendChild(li);


  const shardChosen = new Promise((resolve) => {
    for (let i = 0; i < shards.length; i++) {
      const li = document.createElement('li');
      li.innerHTML = `Shard ${i + 1}: ${shards[i]} keys required`;
      li.id = i;

      li.addEventListener('click', () => {
        const id = li.id;
        if (shards[id] <= keys_count) {
          shards_delivered++;
          system_health+=1;
          document.getElementById("sh").innerHTML= `System Health: ${system_health}`;
          document.getElementById("sd").innerHTML= `Shards Delivered: ${shards_delivered}`;
          keys_count -= shards[id];
          document.getElementById("keysLi").innerHTML=`You have ${keys_count} keys`;
          li.style.display = "none";
          resolve();
        }
      });

      ul.appendChild(li);
    }
  });

  await shardChosen;
}

function checkWinLoss(){
  if(system_health>=100 && player_health!=0){
    document.getElementById("ui").style.display="none";
    document.getElementById("btn-container").style.display="none";
    isPlay=false;
    canvas.style.opacity="10%";
    document.getElementById("winLoss").style.display="flex";
    document.getElementById("winLoss").innerHTML="Congratulations, Cyberia was saved!"
  }
  else if(player_health==0 || system_health<10){
    document.getElementById("ui").style.display="none";
    document.getElementById("btn-container").style.display="none";
    isPlay=false;
    canvas.style.opacity="10%";
    document.getElementById("winLoss").innerHTML="Sorry, player died."
  }
}

setInterval(()=>{
  if(shards.length<5){
  let shard= Math.ceil((Math.random()*4)) + 1;
  shards.push(shard);
  }
},10000)

document.getElementById("play").addEventListener("click", () => {
  if(isPlay==false){
    isPlay=true;
    animate();
  }
});
document.getElementById("pause").addEventListener("click", () => {
  isPlay = false;
});

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "w":
    case "ArrowUp":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
    case "ArrowLeft":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
    case "ArrowDown":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
    case "ArrowRight":
      keys.d.pressed = true;
      lastKey = "d";
      break;
    case "o":
      createBullets();
      break;
    case "c":
      if(player.position.x+12 >= central_x*220 && player.position.x-12<=(central_x+1)*220 && player.position.y+12<=(central_y+1)*220 && player.position.y >=central_y*220){
        if(c_clicked==false){
          c_clicked=true;
          isPlay=false;
          canvas.style.opacity="20%"; 
          document.getElementById("centralHubContainer").style.display="flex";
          openCentralHub();
        }
      }
      break;  
    }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "w":
    case "ArrowUp":
      keys.w.pressed = false;
      break;
    case "a":
    case "ArrowLeft":
      keys.a.pressed = false;
      break;
    case "s":
    case "ArrowDown":
      keys.s.pressed = false;
      break;
    case "d":
    case "ArrowRight":
      keys.d.pressed = false;
      break;
  }
});

function willCollide(object, dx, dy) {
  const radius = 12;
  const nextX = object.position.x + dx;
  const nextY = object.position.y + dy;

  for (let i = 0; i < buildings.length; i++) {
    for (let j = 0; j < buildings[i].length; j++) {
      const square = buildings[i][j];
      for (let t = 0; t < square.towers.length; t++) {
        const tower = square.towers[t];
        if (!tower) continue;
        const towerX = square.x + spacing + 5 + tower.x;
        const towerY = square.y + spacing + 5 + tower.y;
        const towerSize = 40;

        const collides =
          nextX + radius > towerX &&
          nextX - radius < towerX + towerSize &&
          nextY + radius > towerY &&
          nextY - radius < towerY + towerSize;

        if (collides) return [i, j, t];
      }
    }
  }

  return false;
}

animate();

document.getElementById("cross").addEventListener('click',()=>{
  c_clicked=false;
  isPlay=true;
  animate();
  document.getElementById("centralHubContainer").style.display="none";
  canvas.style.opacity="100%";
})
