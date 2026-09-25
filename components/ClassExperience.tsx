"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type Classmate = {
  id: number;
  name: string;
  comment: string;
  photo: string;
};

type ClassExperienceProps = {
  classmates: Classmate[];
};

const logoCharacters = Array.from("DCSG3");

export function ClassExperience({ classmates }: ClassExperienceProps) {
  const pageRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [selectedClassmate, setSelectedClassmate] = useState<Classmate | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Scope every GSAP animation to this page so unmounting cleans up timelines and scroll triggers.
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .from("[data-intro-mark]", { opacity: 0, scale: 0.7, rotate: -16, duration: 0.9 })
        .from(
          "[data-logo-character]",
          { opacity: 0, yPercent: 80, rotateX: -70, stagger: 0.08, duration: 0.8 },
          "-=0.45",
        )
        .from("[data-intro-copy]", { opacity: 0, y: 18, stagger: 0.1, duration: 0.6 }, "-=0.25");

      gsap.to("[data-float='star']", {
        y: -14,
        rotate: 4,
        duration: 3.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to("[data-float='spark']", {
        y: 12,
        rotate: -3,
        duration: 4.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.from("[data-gallery-heading] > *", {
        scrollTrigger: {
          trigger: "[data-gallery-heading]",
          start: "top 78%",
        },
        opacity: 0,
        y: 34,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      });

      ScrollTrigger.batch("[data-student-card]", {
        start: "top 90%",
        once: true,
        onEnter: (cards) => {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 48, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.07, duration: 0.75, ease: "power3.out" },
          );
        },
      });
    }, pageRef);

    return () => context.revert();
  }, []);

  // Lock background scrolling and keep keyboard focus inside the open profile card.
  useEffect(() => {
    if (!selectedClassmate) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProfile();
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
      const dialog = dialogRef.current;
      if (!dialog) return;

      const profilePhoto = dialog.querySelector("[data-profile-photo]");
      const profileDetails = dialog.querySelectorAll("[data-profile-detail]");

      gsap
        .timeline()
        .fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .fromTo(
          dialog,
          { opacity: 0, y: 42, scale: 0.76, rotateX: 9, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 0.68,
            ease: "back.out(1.7)",
          },
          "-=0.16",
        )
        .fromTo(
          profilePhoto,
          { clipPath: "inset(45% 0 45% 0 round 1.15rem)" },
          { clipPath: "inset(0% 0 0% 0 round 1.15rem)", duration: 0.52, ease: "power3.out" },
          "-=0.42",
        )
        .fromTo(
          profileDetails,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, stagger: 0.07, duration: 0.4, ease: "power2.out" },
          "-=0.28",
        );
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedClassmate]);

  const scrollToClassmates = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelector("#classmates")?.scrollIntoView();
      return;
    }

    window.dispatchEvent(
      new CustomEvent("dcsg3:scroll-to", {
        detail: { target: "#classmates" },
      }),
    );
  };

  const openProfile = (classmate: Classmate, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setSelectedClassmate(classmate);
  };

  const closeProfile = () => {
    if (!selectedClassmate || isClosing) return;
    setIsClosing(true);

    const timeline = gsap.timeline({
      onComplete: () => {
        setSelectedClassmate(null);
        setIsClosing(false);
        requestAnimationFrame(() => lastTriggerRef.current?.focus());
      },
    });

    timeline
      .to(dialogRef.current, { opacity: 0, y: 22, scale: 0.94, duration: 0.25, ease: "power2.in" })
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.12");
  };

  return (
    <main ref={pageRef} className="relative isolate overflow-hidden text-zinc-950">
      <div
        aria-hidden="true"
        className="site-background"
        style={{
          backgroundImage:
            'linear-gradient(rgb(255 255 255 / 46%), rgb(255 255 255 / 46%)), url("./decor/silver-fabric.jpg")',
        }}
      />
      <div aria-hidden="true" className="site-grid" />

      <section className="hero-panel phone-hero relative flex min-h-[100svh] items-center justify-center px-6 py-20">
        <img
          data-float="spark"
          src="./decor/chrome-sparks.jpg"
          alt=""
          aria-hidden="true"
          className="hero-sparks"
        />
        <img
          data-float="star"
          src="./decor/chrome-star.jpg"
          alt=""
          aria-hidden="true"
          className="hero-star"
        />

        <div className="hero-content relative z-10 flex flex-col items-center text-center">
          <div data-intro-mark className="mb-6 flex items-center gap-3 font-sans text-[0.68rem] font-medium uppercase tracking-[0.28em] text-zinc-500">
            <span className="h-px w-8 bg-zinc-400" />
            Diploma in Computer Science
            <span className="h-px w-8 bg-zinc-400" />
          </div>

          <h1 className="hero-logo perspective-1000 flex overflow-hidden font-display text-[clamp(3.35rem,15vw,10rem)] font-medium leading-none tracking-[-0.1em]">
            {logoCharacters.map((character, index) => (
              <span data-logo-character key={`${character}-${index}`} className="inline-block">
                {character}
              </span>
            ))}
          </h1>

          <p data-intro-copy className="mt-5 font-display text-xs tracking-[0.22em] sm:text-sm">
            2025 / 2026
          </p>

          <button
            data-intro-copy
            type="button"
            onClick={scrollToClassmates}
            className="group mt-5 inline-flex min-h-11 items-center gap-2 px-4 font-display text-[0.7rem] uppercase tracking-[0.13em] outline-none transition-transform hover:translate-x-1 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
          >
            <span className="play-marker transition-transform group-hover:scale-125" aria-hidden="true" />
            Continue
          </button>
        </div>

        <p className="hero-scroll-label absolute bottom-7 left-7 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-zinc-500 sm:left-10">
          Scroll to enter
        </p>
        <p className="hero-page-label absolute bottom-7 right-7 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-zinc-500 sm:right-10">
          01 / 02
        </p>
      </section>

      <section id="classmates" className="relative min-h-screen scroll-mt-0 px-5 pb-24 pt-20 sm:px-10 sm:pt-28 lg:px-16">
        <img
          src="./decor/chrome-star.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 top-24 hidden w-56 -rotate-12 opacity-35 mix-blend-multiply lg:block"
        />

        <header data-gallery-heading className="relative z-10 mx-auto mb-14 max-w-6xl text-center sm:mb-20">
          <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
            DCSG3 · Class archive
          </p>
          <h2 className="font-display text-[clamp(2.25rem,8vw,6.5rem)] font-medium uppercase leading-none tracking-[-0.07em]">
            Classmates
          </h2>
          <div className="mx-auto mt-7 flex max-w-xl items-center gap-4 text-zinc-400">
            <span className="h-px flex-1 bg-current" />
            <span className="font-display text-[0.65rem] tracking-[0.2em]">26 PROFILES</span>
            <span className="h-px flex-1 bg-current" />
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-4 lg:gap-x-6">
          {classmates.map((classmate, index) => (
            <article data-student-card key={classmate.id} className="student-card opacity-0">
              <button
                type="button"
                onClick={(event) => openProfile(classmate, event.currentTarget)}
                className="group block w-full text-left outline-none"
                aria-label={`Open ${classmate.name}'s profile`}
              >
                <span className="portrait-frame relative block aspect-[4/5] overflow-hidden rounded-[1.2rem] border border-zinc-950 bg-zinc-200 shadow-[0_16px_45px_rgba(0,0,0,0.08)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_24px_55px_rgba(0,0,0,0.15)] group-focus-visible:ring-2 group-focus-visible:ring-zinc-950 group-focus-visible:ring-offset-4">
                  <img
                    src={classmate.photo}
                    alt={`${classmate.name}, DCSG3 classmate`}
                    loading={index < 4 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/65 to-transparent px-3 pb-3 pt-10 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="font-sans text-[0.65rem] uppercase tracking-[0.18em]">View profile</span>
                    <span aria-hidden="true">↗</span>
                  </span>
                </span>
                <span className="mt-3 flex items-start justify-between gap-2 px-1">
                  <span className="font-display text-[0.62rem] font-medium uppercase leading-relaxed tracking-[0.03em] sm:text-[0.72rem]">
                    {classmate.name}
                  </span>
                  <span className="font-sans text-[0.6rem] tabular-nums text-zinc-400">
                    {String(classmate.id).padStart(2, "0")}
                  </span>
                </span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <footer className="flex items-center justify-between border-t border-zinc-950/20 px-6 py-7 font-sans text-[0.65rem] uppercase tracking-[0.22em] text-zinc-500 sm:px-10 lg:px-16">
        <span>DCSG3</span>
        <span>2025—2026</span>
      </footer>

      {selectedClassmate && (
        <div
          ref={overlayRef}
          className="profile-overlay fixed inset-0 z-50 flex items-center justify-center bg-white/35 p-3 opacity-0 backdrop-blur-xl sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeProfile();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-name"
            aria-describedby="profile-comment"
            className="profile-dialog relative flex max-h-[calc(100svh-1.5rem)] w-full max-w-xl flex-col gap-9 overflow-y-auto rounded-[1.5rem] border border-zinc-950/80 p-3 opacity-0 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:grid sm:grid-cols-[0.9fr_1.1fr] sm:grid-rows-1 sm:gap-x-6 sm:gap-y-0 sm:rounded-[1.75rem] sm:p-4"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeProfile}
              className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-zinc-950 bg-white/80 font-sans text-lg leading-none backdrop-blur transition hover:rotate-90 hover:bg-zinc-950 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
              aria-label="Close profile"
            >
              ×
            </button>

            <div data-profile-photo className="profile-photo aspect-[4/5] shrink-0 overflow-hidden rounded-[1.15rem] border border-zinc-950/80 bg-zinc-200">
              <img
                src={selectedClassmate.photo}
                alt={selectedClassmate.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="profile-details flex min-h-52 shrink-0 flex-col px-3 pb-5 sm:min-h-56 sm:px-2 sm:pb-5 sm:pt-10">
              <p data-profile-detail className="font-sans text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">
                Student {String(selectedClassmate.id).padStart(2, "0")} / 26
              </p>
              <div className="profile-copy mt-8 sm:mt-auto">
                <h3 data-profile-detail id="profile-name" className="profile-name font-display text-base font-medium uppercase leading-snug tracking-[-0.03em] sm:text-xl lg:text-2xl">
                  {selectedClassmate.name}
                </h3>
                <p data-profile-detail id="profile-comment" className="mt-5 max-w-sm font-sans text-base leading-relaxed text-zinc-700">
                  {selectedClassmate.comment}
                </p>
                <div data-profile-detail className="mt-8 flex items-center gap-3 text-zinc-400">
                  <span className="h-px flex-1 bg-current" />
                  <span className="font-display text-[0.6rem] tracking-[0.18em]">DCSG3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
