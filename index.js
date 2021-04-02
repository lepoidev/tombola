let circles = [];
let rects = [];

const maxSpeed = 100;
const defaultRadius = 25;
const timeIncrease = 0.1;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let gravitySlider = document.getElementById("gravitySlider");
let reboundSlider = document.getElementById("reboundSlider");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, false);

function between(x, b, e) {
    min = Math.min(b, e);
    max = Math.max(b, e);
    return (x >= min) && (x <= max);
}

function clamp(x, b, e) {
    min = Math.min(b, e);
    max = Math.max(b, e);
    if (x < min) {
        return min;
    }
    else if (x > max) {
        return max;
    }
    return x;
}


function distBetweenPoints(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}


class Circle {
    constructor(x, y, radius, vx = 0, vy = 0) {
        this.x = x;
        this.y = y;
        this.r = radius;
        this.ax = 0;
        this.vx = vx;
        this.vy = vy;
        this.fx = 0;
        this.fy = 0;
    }

    nextPos(dt) {
        var retvx = this.vx + (this.ax * dt);
        var retvy = this.vy + (gravitySlider.value * dt);
        retvx = clamp(retvx, -maxSpeed, maxSpeed);
        retvy = clamp(retvy, -maxSpeed, maxSpeed);

        const retx = this.x + (retvx * dt);
        const rety = this.y + (retvy * dt);

        return [retvx, retvy, retx, rety];
    }

    move(dt) {
        const [newvx, newvy, newx, newy] = this.nextPos(dt);
        this.vx = newvx;
        this.vy = newvy;
        this.x = newx;
        this.y = newy;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        ctx.fill();
    }

    distToPoint(x1, y1) {
        return distBetweenPoints(x1, y1, this.x, this.y)
    }

    distToLine(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;

        const area = Math.abs((dx * (y1 - this.y)) - (dy * (x1 - this.x)));
        const lineLength = distBetweenPoints(x1, y1, x2, y2);

        return area / lineLength;
    }

    handleLineCollision(x1, y1, x2, y2) {
        const curDist = this.distToLine(x1, y1, x2, y2);
        const distToP1 = this.distToPoint(x1, y1);
        const distToP2 = this.distToPoint(x2, y2);
        const isTouching = (distToP1) <= this.r || (distToP2 <= this.r);
        var hadCollision = false;
        if (curDist <= this.r) {
            if ((x1 == x2) && (between(this.y, y1, y2) || isTouching)) {
                if (this.vx > 0) {
                    this.x = x1 - this.r;
                    this.vx = -this.vx * (reboundSlider.value / 100);
                    hadCollision = true;
                } else if (this.vx < 0) {
                    this.x = x1 + this.r;
                    this.vx = -this.vx * (reboundSlider.value / 100);
                    hadCollision = true;
                }
            } else if ((y1 == y2) && (between(this.x, x1, x2) || isTouching)) {
                if (this.vy < 0) {
                    this.y = y1 + this.r;
                    this.vy = -this.vy * (reboundSlider.value / 100);
                    hadCollision = true;
                }
                else if (this.vy > 0) {
                    this.y = y1 - this.r;
                    this.vy = -this.vy * (reboundSlider.value / 100);
                    hadCollision = true;
                }
            }
        }
        return hadCollision;
    }
}


class Rect {
    constructor(x, y, length, height, rotation) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.height = height;
        this.rotation = rotation;
    }

    topLeftX() {
        return this.x - (this.length / 2);
    }
    topLeftY() {
        return this.y - (this.height / 2);
    }

    topRightX() {
        return this.x + (this.length / 2);
    }
    topRightY() {
        return this.y - (this.height / 2);
    }

    bottomLeftX() {
        return this.x - (this.length / 2);
    }
    bottomLeftY() {
        return this.y + (this.height / 2);
    }

    bottomRightX() {
        return this.x + (this.length / 2);
    }
    bottomRightY() {
        return this.y + (this.height / 2);
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.topLeftX(), this.topLeftY(), this.length, this.height);
        ctx.stroke();
        ctx.fill();
    }
}

function randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
}

function createRandomBall() {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const radius = defaultRadius - (Math.random() * defaultRadius / 2);
    const vx = Math.random() * maxSpeed * randomSign();
    const vy = Math.random() * maxSpeed * randomSign();

    return new Circle(x, y, radius, vx, vy);
}

function onAddBall() {
    circles.push(createRandomBall());

    if (rects.length == 0) {
        rects.push(new Rect(window.innerWidth / 4, window.innerHeight / 2, 80, 100, 0));
        rects.push(new Rect(window.innerWidth * .75, window.innerHeight / 2, 80, 100, 0));
        rects.push(new Rect(window.innerWidth / 2, window.innerHeight * 0.75, 200, 100, 0));
    }
}
document.getElementById("addBall").onclick = onAddBall;


function onReset() {
    circles = [];
    rects = [];
}
document.getElementById("reset").onclick = onReset;


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r of rects) {
        r.draw();
    }
    for (let c of circles) {
        c.move(timeIncrease);
    }
    for (let r of rects) {
        for (let c of circles) {
            if (c.vy >= 0) c.handleLineCollision(r.topLeftX(), r.topLeftY(), r.topRightX(), r.topRightY());
            if (c.vy <= 0) c.handleLineCollision(r.bottomLeftX(), r.bottomLeftY(), r.bottomRightX(), r.bottomRightY());
            if (c.vx >= 0) c.handleLineCollision(r.topLeftX(), r.topLeftY(), r.bottomLeftX(), r.bottomLeftY());
            if (c.vx <= 0) c.handleLineCollision(r.topRightX(), r.topRightY(), r.bottomRightX(), r.bottomRightY());
        }
    }
    for (let c of circles) {
        // left wall
        c.handleLineCollision(0, 0, 0, window.innerHeight);

        // right wall
        c.handleLineCollision(window.innerWidth, 0, window.innerWidth, window.innerHeight);

        // top wall
        c.handleLineCollision(0, 0, window.innerWidth, 0);

        // bottom wall
        c.handleLineCollision(0, window.innerHeight, window.innerWidth, window.innerHeight);
    }
    for (let c of circles) {
        c.draw();
    }
    window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);
