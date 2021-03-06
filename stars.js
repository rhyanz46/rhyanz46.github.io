class StarField {
    // by https://codepen.io/kapott/pen/abmgoBz
    constructor(canvas, options) {
        this.canvas = canvas;
        this.options = options;
        this.stars = [];

        this.canvas.height = options.height;
        this.canvas.width = options.width;

        this.countFrames = 0;

        for (let i = 0; i < parseInt(options.stars); i++) {

            // Initialize the stars in the center.
            const initX = Math.floor(options.width / 2)
            const initY = Math.floor(options.height / 2)
            const initZ = 0

            // Get random speeds for X and Y axis
            let vx, vy;
            do {
                vx = this.getRandom(-0.5, 0.5);
                vy = this.getRandom(-0.5, 0.5);
            } while (vx === 0 && vy === 0);

            // Create new stars
            this.stars.push(
                new Star(
                    initX,
                    initY,
                    initZ,
                    vx,
                    vy,
                    options.width,
                    options.height,
                    2000
                )
            );
        }

        this.init();
    }

    getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    getRandomInt(min, max) {
        return parseInt(Math.random() * (max - min) + min);
    }

    getNonZeroRandomInt(min, max) {
        let r = 0;
        do {
            r = this.getRandomInt(min, max);
        } while (r === 0);
        return r;
    }

    init() {
        this.update();
    }

    update() {
        requestAnimationFrame(this.update.bind(this));
        const c = this.canvas.getContext("2d");
        const middleX = this.canvas.width / 2;
        const middleY = this.canvas.height / 2;

        for (let i = 0; i < this.stars.length; i += 1) {
            if (this.stars[i].x > this.canvas.width || this.stars[i].x < 0) {
                this.stars[i].stop = true;
            }

            if (this.stars[i].y > this.canvas.height || this.stars[i].y < 0) {
                this.stars[i].stop = true;
            }

            // size depends on distance from edge of screen
            const distX = Math.abs(middleX - this.stars[i].x);
            const distY = Math.abs(middleY - this.stars[i].y);

            const totalVelocity = Math.abs(this.stars[i].vx + this.stars[i].vy);

            this.stars[i].visible = true;

            const growth = Math.max(totalVelocity / 10000, 0.001);
            this.stars[i].size = Math.min(
                this.stars[i].size + growth,
                this.stars[i].maxSize
            );

            if (this.stars[i].stop) {
                this.stars[i].init();
                this.stars[i].stop = false;
            }
        }

        this.draw();
    }

    draw() {
        const ctx = this.canvas.getContext("2d");
        this.countFrames += 1;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.stars.length; i += 1) {
            this.stars[i].update(ctx);
        }

        // const gradient = ctx.createRadialGradient(
        //     canvas.width / 2,
        //     canvas.height / 2,
        //     5,
        //     canvas.width / 2,
        //     canvas.height / 2,
        //     150
        // );

        // ctx.beginPath();
        // ctx.arc(canvas.width / 2, canvas.height / 2, 150, Math.PI * 2, false);
        // ctx.fillStyle = gradient;
        // ctx.fill();
    }
}
class Star {
    x = 0;
    y = 0;
    z = 0;

    maxX = 0;
    maxY = 0;
    maxZ = 0;

    vx = 0;
    vy = 0;

    size = 1;
    stop = false;

    constructor(x, y, z, vx, vy, maxX, maxY, maxZ) {
        this.initialX = x;
        this.initialY = y;
        this.initialZ = z;

        this.initialVx = vx;
        this.initialVy = vy;

        this.maxX = maxX;
        this.maxY = maxY;
        this.maxZ = maxZ;

        this.alpha = Math.min(this.x / maxX, this.y / maxY)

        this.visible = false;
        this.maxSize = 1;

        this.init();
    }

    init() {
        this.visible = false;
        this.x = this.initialX;
        this.y = this.initialY;
        this.z = this.initialZ;
        this.size = 1;
        this.vx = this.getRandom(-2, 2);
        this.vy = this.getRandom(-2, 2);
        this.fillStyle = `rgba(
  ${this.getRandom(150, 255)},
  ${this.getRandom(150, 255)},
  ${this.getRandom(200, 255)},
  `;

        this.maxSize = this.getRandom(1, 3);
    }

    // normalize any value between 0 and 1
    normalize(value, min, max) {
        return (Math.abs(value) - min) / (max - min)
    }

    getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, Math.PI * 2, false)

        const distX = Math.abs(this.initialX - this.x)
        const distY = Math.abs(this.initialY - this.y)

        let distance = Math.max(distX, distY)
        let max = distY > distX ? this.maxY : this.maxX
        const opacity = this.normalize(distance, 0, max / 2)
        context.fillStyle = `${this.fillStyle}${opacity})`
        context.fill();
    }

    update(context) {
        const realDistX = this.initialX - this.x
        const realDistY = this.initialY - this.y

        const distX = Math.abs(realDistX)
        const distY = Math.abs(realDistY)

        const divFactor = 1500
        this.vx += realDistX < 0
            ? distX / divFactor
            : distX / divFactor * -1

        this.vy += realDistY < 0
            ? distY / divFactor
            : distY / divFactor * -1

        this.x += this.vx;
        this.y += this.vy;

        if (this.visible) {
            this.draw(context);
        }
    }
}

const field = document.getElementById("water");
const dpi = window.devicePixelRatio;

let style_height = +getComputedStyle(field)
    .getPropertyValue("height")
    .slice(0, -2);

let style_width = +getComputedStyle(field)
    .getPropertyValue("width")
    .slice(0, -2);

field.setAttribute("height", style_height * dpi);
field.setAttribute("width", style_width * dpi);

const starfield = new StarField(field, {
    stars: 100,
    width: field.width,
    height: field.height
});