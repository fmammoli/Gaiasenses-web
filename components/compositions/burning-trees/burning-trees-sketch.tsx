"use client";
import type { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

export type BurningTreesSketchProps = {
  fireNumber: number;
  play: boolean;
};

function sketch(p5: P5CanvasInstance<SketchProps & BurningTreesSketchProps>) {
  //inspired by https://openprocessing.org/sketch/1749652
  let t = 0;
  let fireNumber = 0;
  let W: number;
  let C: number;
  let T: number;
  let play = false;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    W = p5.windowWidth;
    p5.colorMode(p5.HSB);
  };

  p5.updateWithProps = (props: any) => {
    const count = Number.isNaN(props.fireNumber)
      ? fireNumber
      : props.fireNumber;
    play = props.play;
    fireNumber = count;
  };

  p5.draw = () => {
    t++;
    W = p5.windowWidth;
    C = Math.floor(t / 32) * 32;

    p5.blendMode(p5.BLEND);
    p5.background(0, 0.05);
    p5.blendMode(p5.ADD);

    if (fireNumber === 0) {
      // Primeiro laço for
      for (let y = 0; y <= W; y += 16) {
        for (let x = ((y / 16) % 2) * -9; x <= W; x += 18) {
          T = Math.tan(p5.noise(x / W, (y + C) / W) * 15 - t / 99);

          p5.fill(120, 100, 100, T > 0.2 ? T : 0.5); // Cor verde
          p5.circle(x, y - 0 / T - (t % 32), 9); // Tamanho fixo
        }
      }
    } else {
      // Segundo laço for
      for (let y = 0; y <= W; y += 16) {
        for (let x = ((y / 16) % 2) * -9; x <= W; x += 18) {
          T = Math.tan(p5.noise(x / W, (y + C) / W) * 15 - t / 99);

          if (T > 0.2 + fireNumber - 1) {
            p5.fill(120, 100, 100, T); // Cor verde
          } else {
            p5.fill(p5.noise(x, y + C) * 30, 100, 1); // Cor das chamas
          }
          p5.circle(x, y - 2 / T - (t % 32), T > 0.2 ? 9 : 3 / T); // Controla os círculos
        }
      }
    }
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };
}

export default function BurningTreesSketch(props: BurningTreesSketchProps) {
  return <NextReactP5Wrapper sketch={sketch} {...props} />;
}