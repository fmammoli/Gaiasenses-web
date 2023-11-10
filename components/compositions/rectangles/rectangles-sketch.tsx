"use client";
import { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { Renderer } from "p5";

export type RectanglesSketchProps = {
  rain: number;
  play: boolean;
};

const RECT_MAX_WIDTH = 15;
const RECT_MIN_WIDTH = 5;

const RECT_MAX_HEIGHT = 200;
const RECT_MIN_HEIGHT = 15;

const FPS_MIN = 1;
const FPS_MAX = 60;

const CRITICAL_RAIN = 10;

function sketch(p5: P5CanvasInstance<SketchProps & RectanglesSketchProps>) {
  // inspired by: https://openprocessing.org/sketch/1274144
  let rain = 0;
  let rectWidth = 0;
  let rectHeight = 0;
  let play = false;

  let [width, height] = [p5.windowWidth, p5.windowHeight];
  let canvas: Renderer | null = null;

  p5.setup = () => {
    if (!play) p5.noLoop();
    canvas = p5.createCanvas(width, height, p5.P2D);

    rectWidth = p5.map(rain, 0, CRITICAL_RAIN, RECT_MIN_WIDTH, RECT_MAX_WIDTH);
    rectHeight = p5.map(rain, 0, CRITICAL_RAIN, RECT_MIN_HEIGHT, RECT_MAX_HEIGHT);
    const fps = p5.map(rain, 0, CRITICAL_RAIN, FPS_MIN, FPS_MAX);

    p5.frameRate(fps);
    p5.background(0);
  }

  p5.updateWithProps = (props) => {
    rain = Number.isNaN(props.rain) ? rain : props.rain;
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
    p5.noStroke();
    p5.fill(0, 0, p5.random(30, 255));
    p5.rect(p5.random(width), p5.random(height), p5.random(rectWidth), p5.random(rectHeight));

    p5.fill(0, 0, 0);
    p5.rect(p5.random(width), p5.random(height), p5.random(100), p5.random(40))
  };
}

export default function RectanglesSketch(props: RectanglesSketchProps) {
  return (
    <NextReactP5Wrapper
      sketch={sketch}
      {...props} />
  )
}
