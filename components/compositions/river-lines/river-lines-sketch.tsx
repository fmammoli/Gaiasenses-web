"use client";
import type { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import p5 from "p5";

export type RiverLinesSketchProps = {
  humidity: number;
  temp: number;
  play: boolean;
};

function sketch(p5: P5CanvasInstance<SketchProps & RiverLinesSketchProps>) {
  //inspired by https://openprocessing.org/sketch/1198771
  //Dados de satélite utilizados: Umidade e temperatura.
  let objs: Obj[] = [];
  let humidity = 0;
  let temp = 0;
  let play = false;
  let palette: p5.Color[] = [];

  function getDynamicPalette(temp: number): p5.Color[] {
    let hueValueStart = p5.map(temp, -5, 30, 210, 0);
    let colors: p5.Color[] = [];
    for (let i = 0; i < 6; i++) {
      let hue = (hueValueStart + i * 8) % 360;
      colors.push(p5.color(hue, 100, 100));
    }
    return colors;
  }

  function initializeObjects() {
    objs = [];
    palette = getDynamicPalette(temp);
    for (let i = 0; i < humidity; i++) {
      objs.push(new Obj(i));
    }
  }

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.angleMode(p5.DEGREES);
    p5.noFill();
    p5.colorMode(p5.HSB, 360, 100, 300);
    p5.background(20);

    initializeObjects();

    if (!play) p5.noLoop();
  };

  p5.updateWithProps = (props: any) => {
    let needsUpdate = false;

    if (!Number.isNaN(props.humidity) && props.humidity !== humidity) {
      humidity = props.humidity;
      needsUpdate = true;
    }
    if (!Number.isNaN(props.temp) && props.temp !== temp) {
      temp = props.temp;
      needsUpdate = true;
    }
    play = props.play;

    if (needsUpdate) {
      initializeObjects();
    }

    if (play) {
      p5.loop();
    } else {
      p5.noLoop();
    }
  };

  p5.draw = () => {
    p5.blendMode(p5.BLEND);
    p5.background(20, 50);
    p5.blendMode(p5.ADD);

    for (let obj of objs) {
      obj.move();
      obj.display();
    }
  };

  class Obj {
    index: number;
    startY: number;
    goalY: number;
    rangeY: number;
    step: number;
    strWeight: number;
    c: p5.Color;

    constructor(tmpIndex: number) {
      this.index = tmpIndex;
      this.startY = p5.map(tmpIndex, 0, humidity - 1, p5.height, 0);
      this.rangeY = p5.random(100, 200);
      this.step = p5.random(10, 20);
      this.strWeight = p5.random(10, 20);
      this.c = p5.color(palette[Math.floor(p5.random(palette.length))]);
      this.c.setAlpha(50);
      this.goalY = this.startY - this.rangeY;
    }

    move() {
      this.startY -= this.step;
      this.goalY = this.startY - this.rangeY;

      if (this.startY + this.rangeY < 0) {
        this.startY = p5.height;
        this.goalY = this.startY - this.rangeY;
      }
    }

    display() {
      p5.strokeWeight(this.strWeight);
      p5.stroke(this.c);
      p5.beginShape();
      for (let y = this.startY; y >= this.goalY; y -= 1) {
        let x = p5.map(
          p5.noise(y * 0.0005, this.index * 0.0075, p5.frameCount * 0.002),
          0,
          1,
          -p5.width * 0.25,
          p5.width * 1.25
        );
        p5.vertex(x, y);
      }
      p5.endShape();
    }
  }
}

export default function RiverLinesSketch(props: RiverLinesSketchProps) {
  return <NextReactP5Wrapper sketch={sketch} {...props} />;
}
