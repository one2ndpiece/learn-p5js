let particles = [];
let particleSize = 12;
let bgColor;
let hueRange = 30;
let satRange = 100;
let speedRange = 2;
let draggedParticle = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  bgColor = color(0, 0, 0);
  colorMode(HSB, 360, 100, 100, 100);
  noScroll();
}

function draw() {
  bgColor = color(hue(bgColor) + 0.1, 50, 20, 10);
  background(bgColor);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }

  if (draggedParticle) {
    draggedParticle.pos.x = mouseX;
    draggedParticle.pos.y = mouseY;
  }
}

function mouseMoved() {
  let hue = map(mouseX, 0, width, 0, hueRange);
  let sat = map(mouseY, 0, height, 0, satRange);
  let p = new Particle(mouseX, mouseY, color(hue, sat, 100), particleSize);
  particles.push(p);
}

function mousePressed() {
  if (mouseButton === LEFT) {
    let hue = random(hueRange);
    let sat = random(satRange);
    let p = new ColoredParticle(mouseX, mouseY, color(hue, sat, 100), particleSize * 2);
    particles.push(p);
  }
}

function mouseDragged() {
  if (!draggedParticle) {
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].isOver(mouseX, mouseY)) {
        draggedParticle = particles[i];
        break;
      }
    }
  }
}

function mouseReleased() {
  draggedParticle = null;
}

function mouseWheel(event) {
  particleSize += event.delta * 0.1;
  particleSize = constrain(particleSize, 4, 64);
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    hueRange = min(hueRange + 5, 360);
  } else if (keyCode === DOWN_ARROW) {
    hueRange = max(hueRange - 5, 0);
  } else if (keyCode === RIGHT_ARROW) {
    satRange = min(satRange + 5, 100);
  } else if (keyCode === LEFT_ARROW) {
    satRange = max(satRange - 5, 0);
  } else if (key === '+') {
    speedRange = min(speedRange + 0.5, 10);
  } else if (key === '-') {
    speedRange = max(speedRange - 0.5, 0);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Particle {
  constructor(x, y, color, size) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(0.5, speedRange));
    this.lifetime = random(100, 200);
    this.color = color;
    this.size = size;
    this.trail = [];
    this.trailLength = random(10, 30);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.98);
    this.lifetime -= random(1, 3);
    this.trail.push(this.pos.copy());
    if (this.trail.length > this.trailLength) {
      this.trail.shift();
    }
  }

  display() {
    noStroke();
    fill(this.color, this.lifetime);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);

    let trailColor = color(hue(this.color), saturation(this.color), brightness(this.color), this.lifetime);
    for (let i = 0; i < this.trail.length; i++) {
      let pos = this.trail[i];
      let size = map(i, 0, this.trail.length - 1, this.size, 0);
      let opacity = map(i, 0, this.trail.length - 1, this.lifetime, 0);
      fill(trailColor, opacity);
      ellipse(pos.x, pos.y, size, size);
    }
  }

  isOver(x, y) {
    let d = dist(x, y, this.pos.x, this.pos.y);
    return d < this.size / 2;
  }

  isFinished() {
    return this.lifetime < 0;
  }
}

class ColoredParticle extends Particle {
  constructor(x, y, color, size) {
    super(x, y, color, size);
    this.angle = random(TWO_PI);
    this.angleVel = random(-0.1, 0.1);
  }

  update() {
    super.update();
    this.angle += this.angleVel;
    this.vel.rotate(this.angleVel);
  }

  display() {
    noStroke();
    fill(this.color, this.lifetime);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    square(0, 0, this.size);
    pop();

    let trailColor = color(hue(this.color), saturation(this.color), brightness(this.color), this.lifetime);
    for (let i = 0; i < this.trail.length; i++) {
      let pos = this.trail[i];
      let size = map(i, 0, this.trail.length - 1, this.size, 0);
      let opacity = map(i, 0, this.trail.length - 1, this.lifetime, 0);
      fill(trailColor, opacity);
      push();
      translate(pos.x, pos.y);
      rotate(this.angle);
      square(0, 0, size);
      pop();
    }
  }
}

function noScroll() {
  document.body.style.overflow = 'hidden';
}