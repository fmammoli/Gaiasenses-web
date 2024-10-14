"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { RecursivePartial } from "tone/build/esm/core/util/Interface";

export default function Discrete() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  async function play() {
    await Tone.start();
    function makeSynth() {
      const envelope: RecursivePartial<Omit<Tone.EnvelopeOptions, "context">> =
        {
          attack: 0.1,
          release: 4,
          releaseCurve: "linear",
        };
      const filterEnvelope: RecursivePartial<
        Omit<Tone.FrequencyEnvelopeOptions, "context">
      > = {
        baseFrequency: 200,
        octaves: 2,
        attack: 0,
        decay: 0,
        release: 1000,
      };
      const synth = new Tone.DuoSynth({
        harmonicity: 1,
        volume: -20,
        voice0: {
          oscillator: { type: "sawtooth" },
          envelope: envelope,
          filterEnvelope: filterEnvelope,
        },
        voice1: {
          oscillator: { type: "sine" },
          envelope: envelope,
          filterEnvelope: filterEnvelope,
        },
        vibratoRate: 0.5,
        vibratoAmount: 0.1,
      });
      return synth;
    }
    const leftSynth = makeSynth();
    const rightSynth = makeSynth();

    const leftPanner = new Tone.Panner(-0.5);
    const rightPanner = new Tone.Panner(0.5);

    const EQUALIZER_CENTER_FREQUENCIES = [
      100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000,
      2500, 3150, 4000, 5000, 6300, 8000, 10000,
    ];
    const equalizer = EQUALIZER_CENTER_FREQUENCIES.map((frequency) => {
      const filter = Tone.getContext().createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = frequency;
      filter.Q.value = 4.31;
      filter.gain.value = 0;
      return filter;
    });

    const echo = new Tone.FeedbackDelay("16n", 0.2);

    const delay = Tone.getContext().createDelay(6.0);

    const delayFade = Tone.getContext().createGain();

    delay.delayTime.value = 6.0;
    delayFade.gain.value = 0.75;

    leftSynth.connect(leftPanner);
    rightSynth.connect(rightPanner);

    leftPanner.connect(equalizer[0]);
    rightPanner.connect(equalizer[0]);
    equalizer.forEach((equalizerBand, index) => {
      if (index < equalizer.length - 1) {
        // Connect to next equalizer band
        equalizerBand.connect(equalizer[index + 1]);
      } else {
        // This is the last band, connect it to the echo
        //a static helper to connect web audio notes to Tonejs nodes
        Tone.connect(equalizerBand, echo);
      }
    });
    echo.connect(delay);

    delay.connect(Tone.getContext().rawContext.destination);
    delay.connect(delayFade);
    delayFade.connect(delay);

    new Tone.Loop((time) => {
      leftSynth.triggerAttackRelease("C5", "1:2", time);
      leftSynth.setNote("D5", "+0:2");

      // Trigger E4 after 6 measures and hold for two 1/4 notes.
      leftSynth.triggerAttackRelease("E4", "0:2", "+6:0");

      // Trigger G4 after 11 measures + a two 1/4 notes, and hold for two 1/4 notes.
      leftSynth.triggerAttackRelease("G4", "0:2", "+11:2");

      // Trigger E5 after 19 measures and hold for 2 measures.
      // Switch to G5, A5, G5 after delay of a 1/4 note + two 1/16 notes each.
      leftSynth.triggerAttackRelease("E5", "2:0", "+19:0");
      leftSynth.setNote("G5", "+19:1:2");
      leftSynth.setNote("A5", "+19:3:0");
      leftSynth.setNote("G5", "+19:4:2");
    }, "34m").start(0);

    new Tone.Loop((time) => {
      // Trigger D4 after 5 measures and hold for 1 full measure + two 1/4 notes
      rightSynth.triggerAttackRelease("D4", "1:2", "+5:0");
      // Switch to E4 after one more measure
      rightSynth.setNote("E4", "+6:0");

      // Trigger B3 after 11 measures + two 1/4 notes + two 1/16 notes. Hold for one measure
      rightSynth.triggerAttackRelease("B3", "1m", "+11:2:2");
      // Switch to G3 after a 1/2 note more
      rightSynth.setNote("G3", "+12:0:2");

      // Trigger G4 after 23 measures + two 1/4 notes. Hold for a half note.
      rightSynth.triggerAttackRelease("G4", "0:2", "+23:2");
    }, "37m").start(0);

    Tone.getTransport().start();
    setIsPlaying(true);
  }

  async function stop() {
    Tone.getTransport().pause();
    Tone.getContext().rawContext.suspend(0);
    setIsPlaying(false);

    const newParams = new URLSearchParams(searchParams.toString());

    const newPlayStatus = !play;
    newParams.set("play", newPlayStatus.toString());
    newParams.set("mode", "map");
    //newParams.delete("compositionName");
    //newParams.set("play", "false");
    //newParams.set("today", "true");
    newParams.set("initial", "false");
    router.replace(`${pathname}?${newParams.toString()}`);
  }

  return (
    <div className="absolute top-1/2 left-1/2">
      <div className="bg-white p-2">
        <div>
          <p>Discrete Music form Brian Eno - 1975</p>
        </div>

        <div>
          {isPlaying ? (
            <Button onClick={stop}>Stop</Button>
          ) : (
            <Button onClick={play}>Play</Button>
          )}
        </div>
      </div>
    </div>
  );
}
