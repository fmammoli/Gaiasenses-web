"use client";
import type { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import p5Types from "p5";

export type LightningBoltsSketchProps = {
  boltCount: number;
  play: boolean;
};

function sketch(p5: P5CanvasInstance<SketchProps & LightningBoltsSketchProps>) {
//inspired by https://openprocessing.org/sketch/639075
let bolts: ChaoticLine[] = [];
let boltTimer = 0;  
let boltCount = 0; 
let boltInterval = 35 / boltCount;

let [width, height] = [p5.windowWidth, p5.windowHeight];

let play = false;

p5.setup = () => {
  p5.createCanvas(p5.windowWidth, p5.windowHeight);
  p5.frameRate(40);  
  bolts = [];
  p5.background(0);
}

p5.updateWithProps = (props: any) => {
  const count = Number.isNaN(props.boltCount) ? boltCount : props.boltCount;
  play = props.play;
  boltCount = count;
  boltInterval = 35 / boltCount;
};

p5.draw = () => {
  p5.fill(0, 24); 
  p5.rect(0, 0, width, height);

  if (boltTimer >= boltInterval) {
    for (let i = 0; i < boltCount; i++) { 
      let a1 = p5.random(p5.TWO_PI);
      let a2 = p5.random(p5.TWO_PI);
      let r1 = 0;
      let r2 = 700;
      let p1 = p5.createVector(p5.int(r1 * p5.cos(a1)), p5.int(r1 * p5.sin(a1)));
      p1.add(width / 2, height / 2);
      let p2 = p5.createVector(p5.int(r2 * p5.cos(a2)), p5.int(r2 * p5.sin(a2)));
      p2.add(width / 2, height / 2);
      bolts.push(new ChaoticLine(p1, p2, 0.35, p5));
    }
    boltTimer = 0;
  } else {
    boltTimer++;
  }

  p5.stroke(64, 64, 255, 32);
  p5.strokeWeight(16);
  for (let cl of bolts) {
    cl.add(p5);
  }

  p5.stroke(64, 64, 255, 32);
  p5.strokeWeight(8);
  for (let cl of bolts) {
    cl.add(p5);
  }

  p5.stroke(128, 128, 255, 32);
  p5.strokeWeight(4);
  for (let cl of bolts) {
    cl.add(p5);
  }

  p5.stroke(255, 255, 255, 255);
  p5.strokeWeight(2);
  for (let cl of bolts) {
    cl.add(p5);
  }

  bolts = [];
}

class ChaoticLine {
  ptlist: p5Types.Vector[];
  constructor(
    public p1: p5Types.Vector,
    public p2: p5Types.Vector,
    public chaos: number,
    private p5: p5Types
  ) {
    this.ptlist = this.createPoints(p1, p2, chaos);
    this.ptlist.push(p2);
  }

  createPoints(p1: p5Types.Vector, p2: p5Types.Vector, chaos: number) {
    let _ptlist: p5Types.Vector[] = [];
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    let mag = dx * dx + dy * dy;
    if (mag > 100) {
      let ch = this.p5.randomGaussian() * chaos / 2.0;
      let xm = (p1.x + p2.x) / 2 - dy * ch;
      let ym = (p1.y + p2.y) / 2 + dx * ch;
      let mid = this.p5.createVector(xm, ym);
      _ptlist.push(...this.createPoints(p1, mid, chaos));
      _ptlist.push(...this.createPoints(mid, p2, chaos));
      return _ptlist;
    } else {
      _ptlist.push(p1);
      return _ptlist;
    }
  }

  add(p5: p5Types) {
    for (let i = 0; i < this.ptlist.length - 1; i++) {
      let p1 = this.ptlist[i];
      let p2 = this.ptlist[i + 1];
      p5.line(p1.x, p1.y, p2.x, p2.y);
    }
  }
}
}

export default function LightningBoltsSketch(props: LightningBoltsSketchProps) {
  return <NextReactP5Wrapper sketch={sketch} {...props} />;
}