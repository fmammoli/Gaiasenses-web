"use client";
import type { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

export type CurvesSketchProps = {
  rain: number;
  temperature: number;
  play: boolean;
};

const FPS_MIN = 5;
const FPS_MAX = 30;

const CRITICAL_RAIN = 10;
const CRITICAL_TEMP = 35;

function sketch(p5: P5CanvasInstance<SketchProps & CurvesSketchProps>) {
  // inspired by: https://openprocessing.org/sketch/1176431
  let rain = 0;
  let temperature = 0;
  let play = false;

  let [width, height] = [p5.windowWidth, p5.windowHeight];
  let canvas: any | null = null;

  p5.setup = () => {
    if (!play) p5.noLoop();
    canvas = p5.createCanvas(width, height, p5.P2D);
    const fps = p5.map(rain, 0, CRITICAL_RAIN, FPS_MIN, FPS_MAX);
    p5.frameRate(fps);
  };

  p5.updateWithProps = (props: any) => {
    rain = Number.isNaN(props.rain) ? rain : props.rain;
    temperature = Number.isNaN(props.temperature)
      ? temperature
      : props.temperature;
    play = props.play;

    const fps = p5.map(rain, 0, CRITICAL_RAIN, FPS_MIN, FPS_MAX);
    p5.frameRate(fps);

    if (props.play) {
      p5.loop();
    } else {
      p5.noLoop();
    }
  };

  p5.draw = () => {
    const red = p5.map(temperature, 0, CRITICAL_TEMP, 50, 255);
    const blue = p5.map(temperature, 0, CRITICAL_TEMP, 255, 50);

    p5.noFill();
    p5.stroke(p5.random(10, red), 10, p5.random(10, blue));

    p5.bezier(
      p5.random(width),
      0,
      p5.random(width),
      p5.random(width),
      p5.random(width),
      p5.random(width),
      p5.random(width),
      height
    );
  };
}

export default function CurvesSketch(props: CurvesSketchProps) {
  return <NextReactP5Wrapper sketch={sketch} {...props} />;
}
