"use client";
import { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { Color, Renderer, Vector } from "p5";

//for the #wccChallenge on the theme of 'flat'.
//Thought I would be skipping this week, as I'm on vacation in northern California.
//But, I found myself walking across a beach at low tide on some mud flats
//and saw all sorts of interesting patterns made by the retreating water.

//This was a quick attempt to recreate some of them with particles drawing across
//the canvas and scattering around debris.
//code by Aaron Reuland
// from https://openprocessing.org/sketch/1982410

export type MudFlarScatterSketchProps = {
  temperature: number;
  windDeg: number;
  windSpeed: number;
  play: boolean;
};

function sketch(p5: P5CanvasInstance<SketchProps & MudFlarScatterSketchProps>) {
  let stroker: Color | null = null;
  let beach: sand[] = [];
  let stones: { pos: Vector; r: number }[] = [];
  let play = false;

  let [w, h] = [p5.windowWidth, p5.windowHeight];
  let canvas: Renderer | null = null;

  function initialize() {}

  p5.setup = () => {
    if (!play) p5.noLoop();
    p5.createCanvas(w, h);
    p5.pixelDensity(1);
    p5.background("#474843");
    stroker = p5.color("#eeeff0");
    stroker.setAlpha(30);
    //maybe I can map temperature as the number of rocks, from 80 to 120
    for (let y = -50; y < p5.height + 50; y += p5.random(80, 120)) {
      //should also affect this x, the x position of the stone
      let x = p5.map(
        p5.noise(y / 10),
        0,
        1,
        p5.width / 6,
        p5.width - p5.width / 4
      );
      var stone = {
        pos: p5.createVector(x, y),
        r: p5.random(p5.height / 70, p5.height / 12),
      };
      stones.push(stone);
    }

    for (let y = -p5.height / 10; y < p5.height + p5.height / 10; y++) {
      beach.push(new sand(-10, y + p5.random(-1, 1)));
    }
  };

  p5.updateWithProps = (props) => {
    play = props.play;
    console.log(props);
    // if (temperature !== temperature) {
    //   temperature = props.temperature;
    //   initialize();
    // }

    if (true) {
      initialize();
    }

    if (props.play) {
      p5.loop();
    } else {
      p5.noLoop();
    }
  };

  p5.draw = () => {
    if (p5.frameCount < 400 && p5.frameCount % 8 == 0) {
      for (let y = -p5.height / 10; y < p5.height + p5.height / 4; y++) {
        beach.push(new sand(-10, y));
      }
    }

    for (let i = beach.length - 1; i >= 0; i--) {
      beach[i].move();

      beach[i].show();
      beach[i].end();
    }
  };

  class sand {
    pos: Vector;
    acc: Vector;
    vel: Vector;
    constructor(x: number, y: number) {
      this.pos = p5.createVector(x, y);
      this.acc = p5.createVector(p5.random(0.02, 0.05), 0);
      this.vel = p5.createVector(0, 0);
    }

    move() {
      for (let i = 0; i < stones.length; i++) {
        let d = Vector.dist(this.pos, stones[i].pos);
        if (d <= stones[i].r) {
          let yvOff = (this.pos.y - stones[i].pos.y) * -2;
          this.acc.add(0, yvOff);
        }
      }
      //this the y offset when a ray does not collide with a stone, maybe this can be changed
      let yoff = p5.map(
        p5.noise(p5.frameCount / 50, this.pos.x / 10, this.pos.y / 50),
        0,
        1,
        -0.002,
        0.002
      );
      //multiplying this value creates a more chaotic movement
      this.acc.add(0, yoff);
      this.vel.add(this.acc);
      this.pos.add(this.vel);
    }

    show() {
      stroker ? p5.stroke(stroker) : p5.stroke(p5.color("#eeeff0"));

      p5.point(this.pos.x, this.pos.y);
    }

    end() {
      if (
        this.pos.x > p5.width + 1 ||
        this.pos.y < -p5.height / 10 ||
        this.pos.y > p5.height + p5.height / 10
      ) {
        let index = beach.indexOf(this);
        beach.splice(index, 1);
      }
    }
  }
}

export default function LluviaSketch(props: MudFlarScatterSketchProps) {
  return <NextReactP5Wrapper sketch={sketch} {...props} />;
}
