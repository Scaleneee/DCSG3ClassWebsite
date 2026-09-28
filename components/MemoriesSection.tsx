"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type Memory = {
  title: string;
  date: string;
  comment: string;
  photo: string;
};

type MemoriesSectionProps = {
  memories: Memory[];
};

const flashGifSource = "./assets/flash.gif";

type ControlIconProps = {
  name: "back" | "play" | "pause" | "next";
};

function ControlIcon({ name }: ControlIconProps) {
  if (name === "play") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m9 7 8 5-8 5Z" />
      </svg>
    );
  }

  if (name === "pause") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M9 7v10M15 7v10" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d={name === "back" ? "m15 18-6-6 6-6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

export function MemoriesSection({ memories }: MemoriesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLImageElement>(null);
  const channelTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const memoryIndexRef = useRef(0);
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentMemory = memories[activeMemoryIndex];

  // Preload every channel so the CRT transition never waits on the network.
  useEffect(() => {
    memories.forEach((memory) => {
      const image = new Image();
      image.src = memory.photo;
    });
  }, [memories]);

  const changeMemory = useCallback(
    (direction: -1 | 1) => {
      if (memories.length < 2) return;

      const nextIndex = (memoryIndexRef.current + direction + memories.length) % memories.length;
      const nextMemory = memories[nextIndex];
      memoryIndexRef.current = nextIndex;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setActiveMemoryIndex(nextIndex);
        return;
      }

      const image = imageRef.current;
      const copy = copyRef.current;
      const flash = flashRef.current;

      if (!image || !copy || !flash) {
        setActiveMemoryIndex(nextIndex);
        return;
      }

      // Reset the cached GIF so its static sequence starts from the beginning.
      flash.removeAttribute("src");
      void flash.offsetWidth;
      flash.src = flashGifSource;

      channelTimelineRef.current?.kill();
      channelTimelineRef.current = gsap
        .timeline()
        .to([image, copy], { opacity: 0, duration: 0.12, ease: "power2.in" })
        .to(flash, { opacity: 1, duration: 0.07, ease: "steps(2)" }, "-=0.08")
        .call(() => {
          image.src = nextMemory.photo;
          image.alt = `${nextMemory.title} memory`;
          setActiveMemoryIndex(nextIndex);
        })
        .fromTo(flash, { opacity: 1 }, { opacity: 0.3, duration: 0.06, ease: "none" })
        .fromTo(
          image,
          { opacity: 0, scale: 1.045, filter: "contrast(1.8) saturate(0)" },
          {
            opacity: 1,
            scale: 1,
            filter: "contrast(1) saturate(1)",
            duration: 0.34,
            ease: "power3.out",
          },
          "-=0.01",
        )
        .fromTo(copy, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }, "<0.08")
        .to(flash, { opacity: 0, duration: 0.24, ease: "power2.out" }, "<");
    },
    [memories],
  );

  useEffect(() => {
    if (!isPlaying || memories.length < 2) return;

    const timer = window.setInterval(() => changeMemory(1), 4500);
    return () => window.clearInterval(timer);
  }, [changeMemory, isPlaying, memories.length]);

  useEffect(
    () => () => {
      channelTimelineRef.current?.kill();
    },
    [],
  );

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.from("[data-memory-heading] > *", {
        scrollTrigger: {
          trigger: "[data-memory-heading]",
          start: "top 82%",
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.75,
        ease: "power3.out",
      });

      gsap.from("[data-memory-console]", {
        scrollTrigger: {
          trigger: "[data-memory-console]",
          start: "top 83%",
        },
        opacity: 0,
        y: 48,
        scale: 0.96,
        duration: 0.9,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  if (!currentMemory) return null;

  return (
    <section ref={sectionRef} id="memories" className="memories-section relative isolate overflow-hidden px-5 py-24 sm:px-10 sm:py-32">
      <img src="./decor/chrome-sparks.jpg" alt="" aria-hidden="true" className="memory-decor memory-decor-sparks" />
      <img src="./decor/chrome-star.jpg" alt="" aria-hidden="true" className="memory-decor memory-decor-star" />

      <header data-memory-heading className="memory-heading relative z-10 mx-auto max-w-5xl text-center">
        <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">DCSG3 · Channel 03</p>
        <h2 className="font-display text-[clamp(2.25rem,8vw,6.5rem)] font-medium uppercase leading-none tracking-[-0.07em]">
          Our Memories
        </h2>
        <div className="mx-auto mt-7 flex max-w-xl items-center gap-4 text-zinc-400">
          <span className="h-px flex-1 bg-current" />
          <span className="font-display text-[0.65rem] tracking-[0.2em]">PLAYBACK ARCHIVE</span>
          <span className="h-px flex-1 bg-current" />
        </div>
      </header>

      <div data-memory-console className="memory-console relative z-10 mx-auto mt-14 max-w-4xl sm:mt-20">
        <div ref={copyRef} className="memory-copy text-center" aria-live="polite" aria-atomic="true">
          <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.28em] text-zinc-500">
            Channel {String(activeMemoryIndex + 1).padStart(2, "0")} · {currentMemory.date}
          </p>
          <h3 className="mt-3 font-display text-[clamp(0.95rem,4.8vw,1.6rem)] uppercase tracking-[-0.03em]">
            {currentMemory.title}
          </h3>
        </div>

        <div className="memory-viewer mt-8 sm:mt-10">
          <div className="crt-stage">
            <div className="crt-monitor">
              <div className="crt-screen-shell">
                <div className="crt-screen">
                  <img ref={imageRef} src={currentMemory.photo} alt={`${currentMemory.title} memory`} draggable={false} />
                  <div aria-hidden="true" className="crt-vignette" />
                  <div aria-hidden="true" className="crt-scanlines" />
                  <img
                    ref={flashRef}
                    src={flashGifSource}
                    alt=""
                    aria-hidden="true"
                    className="crt-channel-flash"
                    draggable={false}
                  />
                </div>
              </div>

              <div className="crt-dashboard" aria-hidden="true">
                <span>DCSG3 COLOR</span>
                <span className="crt-speaker" />
                <span className="crt-led" />
                <span className="crt-dial" />
              </div>
            </div>
            <div aria-hidden="true" className="crt-neck" />
            <div aria-hidden="true" className="crt-foot" />
          </div>

          <div className="memory-controls" role="group" aria-label="Memory playback controls">
            <button type="button" className="memory-control" onClick={() => changeMemory(-1)} aria-label="Previous memory">
              <ControlIcon name="back" />
            </button>
            <button type="button" className={"memory-control" + (isPlaying ? " is-active" : "")} onClick={() => setIsPlaying(true)} aria-label="Play memories automatically" aria-pressed={isPlaying}>
              <ControlIcon name="play" />
            </button>
            <button type="button" className={"memory-control" + (!isPlaying ? " is-active" : "")} onClick={() => setIsPlaying(false)} aria-label="Pause automatic playback" aria-pressed={!isPlaying}>
              <ControlIcon name="pause" />
            </button>
            <button type="button" className="memory-control" onClick={() => changeMemory(1)} aria-label="Next memory">
              <ControlIcon name="next" />
            </button>
          </div>
        </div>

        <div className="memory-comment mx-auto mt-8 max-w-xl text-center">
          <p className="font-sans text-sm leading-relaxed text-zinc-600 sm:text-base">{currentMemory.comment}</p>
          <p className="mt-4 font-display text-[0.58rem] uppercase tracking-[0.2em] text-zinc-400">
            {isPlaying ? "Auto play · 4.5 sec" : "Manual playback"} · {String(activeMemoryIndex + 1).padStart(2, "0")} / {String(memories.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
