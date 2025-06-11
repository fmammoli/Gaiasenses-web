"use client";
import type { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

export type NightRainSketchProps = {
  humidity: number;
  temp: number;
  play: boolean;
};

function sketch(p5: P5CanvasInstance<SketchProps & NightRainSketchProps>) {
    //inspired by https://openprocessing.org/sketch/2318784
    //Dados de satélite utilizados: Umidade e temperatura.
    let particles = [];
    let humidity = 0;
    let temp = 0;
    let play = false;

    let [width, height] = [p5.windowWidth, p5.windowHeight];
    let canvas: any | null = null;

    p5.setup = () => {
        if (!play) p5.noLoop();
        canvas = p5.createCanvas(width, height, p5.P2D);
        p5.colorMode(p5.HSB, 255);
        p5.ellipseMode(p5.RADIUS);
        p5.noFill();
    };

    p5.updateWithProps = (props: any) => {
        humidity = Number.isNaN(props.humidity) ? humidity : props.humidity;
        temp = Number.isNaN(props.temp) ? temp : props.temp;
        play = props.play;

        if (props.play) {
            p5.loop();
        } else {
            p5.noLoop();
        }
    };

    p5.draw = () => {
        p5.background(0, 30);

        if (particles.length < 1.5 * humidity) particles.push(new Particle());

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].display();
        }
    };

    class Particle {
        x: number;
        y: number;
        vy: number;
        maxy: number;
        r: number;
        tr: number;
        w: number;

        constructor() {
            this.x = 0;
            this.y = 0;
            this.vy = 0;
            this.maxy = 0;
            this.r = 10;
            this.tr = 50;
            this.w = 0;
            this.reset();
        }

        reset() {
            this.x = p5.random(width);
            this.y = p5.random(-150, 0);
            this.vy = p5.random(8, 30);
            this.maxy = this.y + height;
            this.r = 10;
            this.tr = 50;
            this.w = p5.random(1, 3);
        }

        update() {
            if (this.y < this.maxy) {
                this.y += this.vy;
            } else {
                this.r++;
            }
            if (this.r > this.tr) this.reset();
        }

        display() {
            p5.strokeWeight(0.5);
            let hueValue = p5.map(temp, 1, 45, 160, 0); 
            p5.stroke(hueValue, 255, 255);

            if (this.y < this.maxy) {
                p5.push();
                p5.translate(this.x, this.y);
                p5.beginShape();
                p5.strokeWeight(1);
                p5.vertex(0, -5);
                p5.quadraticVertex(3, 0, 0, 1);
                p5.quadraticVertex(-3, 0, 0, -5);
                p5.endShape(p5.CLOSE);
                p5.pop();
            } else {
                p5.stroke(hueValue, 255, 255, p5.map(this.r, 0, this.tr, 180, 130));
                p5.ellipse(this.x, this.y, this.r, this.r * 0.5);
            }
        }
    }
}

export default function NightRainSketch(props: NightRainSketchProps) {
  return <NextReactP5Wrapper sketch={sketch} {...props} />;
}