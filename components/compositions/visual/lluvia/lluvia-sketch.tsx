"use client";
import { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

import * as p5 from "p5";

export type LluviaSketchProps = {
  rain: number;
  containerHeight: number;
  canvas?: HTMLCanvasElement;
};

export default function LluviaSketch({
  rain,
  containerHeight = 400,
  canvas,
}: LluviaSketchProps) {
  const CRITICAL_RAIN = 10;

  const ELLIPSE_MIN = 15;
  const ELLIPSE_MAX = 250;

  const FPS_MIN = 2;
  const FPS_MAX = 20;

  let ellipseSize = 0;
  let fps = 0;

  function sketch(p5: P5CanvasInstance<SketchProps & LluviaSketchProps>) {
    // inspired by: https://openprocessing.org/sketch/386391

    let [w, h] = [p5.windowWidth, containerHeight];

    let paused = false;

    p5.setup = () => {
      const canvas = p5.createCanvas(w, h, p5.P2D);

      ellipseSize = p5.map(rain, 0, CRITICAL_RAIN, ELLIPSE_MIN, ELLIPSE_MAX);
      fps = p5.map(rain, 0, CRITICAL_RAIN, FPS_MIN, FPS_MAX);

      p5.frameRate(fps);
    };

    p5.windowResized = () => {
      w = p5.windowWidth;
      h = containerHeight;
      p5.resizeCanvas(w, h);
    };

    p5.draw = () => {
      p5.fill(p5.random(255), p5.random(255), p5.random(255), p5.random(255));
      p5.noStroke();
      p5.ellipse(
        p5.random(w),
        p5.random(h),
        p5.random(ellipseSize),
        p5.random(ellipseSize)
      );
    };

    p5.mouseClicked = (event: PointerEvent) => {
      if ((event?.target as HTMLElement).id === "defaultCanvas0") {
        if (!paused) {
          p5.noLoop();
          paused = true;
        } else {
          p5.loop();
          paused = false;
        }
      }
    };

    return false;
  }

  return <NextReactP5Wrapper sketch={sketch} rain={rain} />;
}
