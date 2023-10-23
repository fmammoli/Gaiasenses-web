"use client";
import { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { memo, useCallback } from "react";
import Lluvia from "./lluvia";

export type LluviaSketchProps = {
  rain: number;
  containerHeight: number;
  canvas?: HTMLCanvasElement;
  play: boolean;
};
const CRITICAL_RAIN = 10;

const ELLIPSE_MIN = 15;
const ELLIPSE_MAX = 250;

const FPS_MIN = 2;
const FPS_MAX = 20;

let ellipseSize = 0;

let fps = 0;

// const LluviaSketch = memo(LluviaSketchBase);
// export default LluviaSketch;

function sketch(p5: P5CanvasInstance<SketchProps & LluviaSketchProps>) {
  // inspired by: https://openprocessing.org/sketch/386391

  let containerHeight = 0;
  let rain = 0;

  let play = false;

  let [w, h] = [p5.windowWidth, containerHeight];

  p5.setup = () => {
    if (!play) p5.noLoop();
    const canvas = p5.createCanvas(w, h, p5.P2D);

    ellipseSize = p5.map(rain, 0, CRITICAL_RAIN, ELLIPSE_MIN, ELLIPSE_MAX);
    fps = p5.map(rain, 0, CRITICAL_RAIN, FPS_MIN, FPS_MAX);

    p5.frameRate(fps);
  };

  p5.updateWithProps = (props) => {
    containerHeight = props.containerHeight;
    h = props.containerHeight;
    rain = props.rain;
    play = props.play;
    p5.resizeCanvas(w, props.containerHeight);
    ellipseSize = p5.map(rain, 0, CRITICAL_RAIN, ELLIPSE_MIN, ELLIPSE_MAX);
    fps = p5.map(rain, 0, CRITICAL_RAIN, FPS_MIN, FPS_MAX);

    p5.frameRate(fps);

    if (props.play) {
      p5.loop();
    } else {
      p5.noLoop();
    }
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

  return false;
}

export default function LluviaSketch({
  rain,
  containerHeight = 400,
  canvas,
  play,
}: LluviaSketchProps) {
  return (
    <NextReactP5Wrapper
      sketch={sketch}
      rain={rain}
      containerHeight={containerHeight}
      play={play}
    />
  );
}
