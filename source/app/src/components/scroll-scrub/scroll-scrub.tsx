/* Scroll scrub React/TanStack reference implementation. */

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import "./scroll-scrub.css";

export interface ScrollScrubScene {
  id: string;
  label: string;
  /** Exact first frame of the deployed desktop clip. */
  poster: string;
  /** Exact first frame of mobileClip; provide whenever mobileClip is set. */
  mobilePoster?: string;
  clip: string;
  mobileClip?: string;
  title: string;
  body: string;
  kicker?: string;
  tags?: string[];
  actions?: ReactNode;
  align?: "left" | "right";
  /** Viewport-heights assigned to this scene. More distance means slower scrub. */
  scroll?: number;
  /** 0..0.6. Slow the middle of the clip without changing either seam frame. */
  linger?: number;
  objectPosition?: string;
  mobileObjectPosition?: string;
  /** Soundscape mood while this chapter holds the middle of the screen (see SoundScape). */
  sound?: string;
}

export interface ScrollScrubConnector {
  /** Exact first frame of this connector clip; never substitute a scene still. */
  poster: string;
  /** Exact first frame of mobileClip; provide whenever mobileClip is set. */
  mobilePoster?: string;
  clip: string;
  mobileClip?: string;
  scroll?: number;
}

export interface ScrollScrubTheme {
  background: string;
  ink: string;
  muted: string;
  accent: string;
}

export interface ScrollScrubProps {
  scenes: ScrollScrubScene[];
  /** Leave empty for continuous-forward architecture A. */
  connectors?: (ScrollScrubConnector | null)[];
  theme: ScrollScrubTheme;
  className?: string;
  /** Heading level of the first scene; use "h2" when the page already has an h1. */
  firstHeading?: "h1" | "h2";
  onActiveSectionChange?: (index: number) => void;
}

interface Segment {
  key: string;
  kind: "scene" | "connector";
  sectionIndex: number;
  nextSectionIndex: number;
  poster: string;
  mobilePoster?: string;
  clip: string;
  mobileClip?: string;
  weight: number;
  linger: number;
  objectPosition: string;
  mobileObjectPosition: string;
  scene?: ScrollScrubScene;
}

interface RuntimeSegment extends Segment {
  band: HTMLElement;
  layer: HTMLElement;
  start: number;
  end: number;
  current: number;
  target: number;
  visible: boolean;
  loading: boolean;
  ready: boolean;
  primed: boolean;
  failed: boolean;
  attempts: number;
  retryAt: number;
  /** Bumped on every unload, so a load that finishes late is dropped. */
  token: number;
  loadedSource?: string;
  video?: HTMLVideoElement;
}

interface Controller {
  jumpToSection: (index: number) => void;
}

type ThemeStyle = CSSProperties & Record<`--ss-${string}`, string | number>;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

const lingerEase = (value: number, amount: number) => {
  const x = clamp(value);
  const linger = clamp(amount, 0, 0.6);
  const centered = x - 0.5;
  return (1 - linger) * x + linger * (4 * centered ** 3 + 0.5);
};

function buildSegments(
  scenes: ScrollScrubScene[],
  connectors: (ScrollScrubConnector | null)[]
): Segment[] {
  const result: Segment[] = [];

  for (const [index, scene] of scenes.entries()) {
    if (scene.mobileClip && !scene.mobilePoster) {
      throw new Error(`Scene ${scene.id} needs mobilePoster for mobileClip`);
    }
    result.push({
      clip: scene.clip,
      key: `scene:${scene.id}`,
      kind: "scene",
      linger: scene.linger ?? 0,
      mobileClip: scene.mobileClip,
      mobilePoster: scene.mobilePoster,
      mobileObjectPosition:
        scene.mobileObjectPosition ?? scene.objectPosition ?? "50% 50%",
      nextSectionIndex: index,
      objectPosition: scene.objectPosition ?? "50% 50%",
      poster: scene.poster,
      scene,
      sectionIndex: index,
      weight: scene.scroll ?? 1.4,
    });

    const connector = connectors[index];
    if (index < scenes.length - 1 && connector?.clip) {
      if (connector.mobileClip && !connector.mobilePoster) {
        throw new Error(
          `Connector after ${scene.id} needs mobilePoster for mobileClip`
        );
      }
      const nextScene = scenes[index + 1];
      result.push({
        clip: connector.clip,
        key: `connector:${scene.id}:${nextScene.id}`,
        kind: "connector",
        linger: 0,
        mobileClip: connector.mobileClip,
        mobilePoster: connector.mobilePoster,
        mobileObjectPosition:
          nextScene.mobileObjectPosition ??
          nextScene.objectPosition ??
          "50% 50%",
        nextSectionIndex: index + 1,
        objectPosition: nextScene.objectPosition ?? "50% 50%",
        poster: connector.poster,
        sectionIndex: index,
        weight: connector.scroll ?? 0.8,
      });
    }
  }

  return result;
}

export function ScrollScrub({
  scenes,
  connectors,
  theme,
  className,
  firstHeading = "h1",
  onActiveSectionChange,
}: ScrollScrubProps) {
  const rootRef = useRef<HTMLElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const onActiveRef = useRef(onActiveSectionChange);
  const [activeSection, setActiveSection] = useState(0);
  const segments = useMemo(
    () => buildSegments(scenes, connectors ?? []),
    [connectors, scenes]
  );

  // Keep the latest callback reachable from the scroll loop without making it a
  // dependency of the controller effect. Synced in an effect, never during
  // render — a render-phase ref write breaks under React Compiler.
  useEffect(() => {
    onActiveRef.current = onActiveSectionChange;
  }, [onActiveSectionChange]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || segments.length === 0) {
      return;
    }

    const layerNodes = [
      ...root.querySelectorAll<HTMLElement>("[data-scroll-scrub-layer]"),
    ];
    const bandNodes = [
      ...root.querySelectorAll<HTMLElement>("[data-scroll-scrub-band]"),
    ];
    if (
      layerNodes.length !== segments.length ||
      bandNodes.length !== segments.length
    ) {
      throw new Error("ScrollScrub segment markup is out of sync");
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const coarsePointer = window.matchMedia(
      "(hover: none) and (pointer: coarse)"
    ).matches;
    const smallViewport = window.matchMedia("(max-width: 860px)");
    const isMobile = () => coarsePointer || smallViewport.matches;
    const sourceFor = (segment: RuntimeSegment) =>
      isMobile() && segment.mobileClip ? segment.mobileClip : segment.clip;
    const runtime: RuntimeSegment[] = segments.map((segment, index) => ({
      ...segment,
      attempts: 0,
      band: bandNodes[index],
      current: 0,
      end: 0,
      failed: false,
      layer: layerNodes[index],
      loading: false,
      primed: false,
      ready: false,
      retryAt: 0,
      start: 0,
      target: 0,
      token: 0,
      visible: index === 0,
    }));

    let active = -1;
    let destroyed = false;
    let dirty = true;
    let frame = 0;
    let rootTop = 0;
    let total = 1;
    let viewportHeight = window.innerHeight;
    let layoutWidth = window.innerWidth;
    let userReady = false;

    // Each clip is downloaded once and kept as a blob URL, so a clip released
    // when it scrolls out of range comes back instantly.
    const clipUrls = new Map<string, Promise<string>>();
    const clipUrl = (source: string) => {
      let pending = clipUrls.get(source);
      if (!pending) {
        pending = fetch(source).then(async (response) => {
          if (!response.ok) {
            throw new Error(`Clip failed: ${response.status}`);
          }
          return URL.createObjectURL(await response.blob());
        });
        clipUrls.set(source, pending);
        pending.catch(() => clipUrls.delete(source));
      }
      return pending;
    };

    // Phones can only decode a few videos at once, and a clip that cannot get
    // a decoder freezes on its poster. Removing the src frees the decoder now
    // rather than whenever the element is garbage collected.
    const releaseVideo = (video: HTMLVideoElement) => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
    };

    const unloadClip = (segment: RuntimeSegment) => {
      segment.token += 1;
      const { video } = segment;
      delete segment.video;
      delete segment.loadedSource;
      if (video) {
        releaseVideo(video);
      }
      segment.loading = false;
      segment.ready = false;
      segment.primed = false;
      segment.failed = false;
      segment.current = segment.target;
      delete segment.layer.dataset.videoPainted;
      delete segment.layer.dataset.videoFailed;
    };

    const markFailed = (segment: RuntimeSegment) => {
      segment.failed = true;
      segment.loading = false;
      segment.ready = false;
      segment.attempts += 1;
      segment.retryAt = performance.now() + 900 * segment.attempts;
      delete segment.layer.dataset.videoPainted;
      segment.layer.dataset.videoFailed = "true";
    };

    const layout = () => {
      const pageY = window.scrollY || window.pageYOffset;
      rootTop = root.getBoundingClientRect().top + pageY;
      viewportHeight = window.innerHeight;
      layoutWidth = window.innerWidth;

      for (const segment of runtime) {
        if (
          segment.loadedSource &&
          segment.loadedSource !== sourceFor(segment)
        ) {
          unloadClip(segment);
        }
        const rect = segment.band.getBoundingClientRect();
        segment.start = rect.top + pageY - rootTop;
        segment.end = segment.start + rect.height;
      }
      total = Math.max(runtime.at(-1)?.end ?? viewportHeight, viewportHeight);
      dirty = true;
    };

    // iOS paints seeked frames only for a video that has played once; a muted
    // play() and pause() unlocks it. Retried on every tap until it takes.
    const primeVideo = async (segment: RuntimeSegment) => {
      const { video } = segment;
      if (!video || segment.primed || !isMobile()) {
        return;
      }
      try {
        await video.play();
        video.pause();
        if (segment.video === video) {
          segment.primed = true;
        }
      } catch {
        // Keep the poster; the next tap tries again.
      }
    };

    const loadClip = async (segment: RuntimeSegment) => {
      const source = sourceFor(segment);
      if (
        reduceMotion ||
        destroyed ||
        segment.loading ||
        segment.video ||
        !source ||
        (segment.failed &&
          (segment.attempts >= 3 || performance.now() < segment.retryAt))
      ) {
        return;
      }

      segment.loading = true;
      segment.loadedSource = source;
      const token = segment.token;

      let objectUrl: string;
      try {
        objectUrl = await clipUrl(source);
      } catch {
        if (!destroyed && segment.token === token) {
          markFailed(segment);
        }
        return;
      }
      if (destroyed || segment.token !== token) {
        return;
      }

      // Download the next two clips while this one plays, without decoding them.
      const index = runtime.indexOf(segment);
      for (const next of runtime.slice(index + 1, index + 3)) {
        const nextSource = sourceFor(next);
        if (nextSource) {
          clipUrl(nextSource).catch(() => {});
        }
      }

      const video = document.createElement("video");
      video.className = "scroll-scrub__video";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.src = objectUrl;

      video.addEventListener(
        "loadedmetadata",
        () => {
          if (segment.video !== video) {
            return;
          }
          segment.ready = true;
          segment.loading = false;
          segment.failed = false;
          segment.attempts = 0;
          delete segment.layer.dataset.videoFailed;
          dirty = true;
        },
        { once: true }
      );
      video.addEventListener(
        "loadeddata",
        () => {
          if (userReady && segment.video === video) {
            void primeVideo(segment);
          }
        },
        { once: true }
      );
      video.addEventListener(
        "error",
        () => {
          if (segment.video !== video) {
            return;
          }
          // Often a decoder that is busy elsewhere: free it and try again shortly.
          delete segment.video;
          releaseVideo(video);
          markFailed(segment);
          dirty = true;
        },
        { once: true }
      );
      video.addEventListener(
        "seeked",
        () => {
          if (segment.video === video) {
            segment.layer.dataset.videoPainted = "true";
          }
        },
        { once: true }
      );

      segment.layer.append(video);
      segment.video = video;
    };

    const readScroll = () => {
      const pageY = window.scrollY || window.pageYOffset;
      const y = clamp(pageY - rootTop, 0, total);
      const crossfade = 0.1 * viewportHeight;
      // Each clip dissolves in over the one before it across this much scroll,
      // centred on their seam, so a clip that is still catching up with the
      // finger never shows as a hard cut.
      const dissolve = 0.36 * viewportHeight;
      let currentIndex = 0;

      for (const [index, segment] of runtime.entries()) {
        if (y >= segment.start) {
          currentIndex = index;
        }

        const length = Math.max(segment.end - segment.start, 1);
        const local = clamp((y - segment.start) / length);
        segment.target = segment.linger
          ? lingerEase(local, segment.linger)
          : local;

        let outside = 0;
        if (y < segment.start) {
          outside = segment.start - y;
        }
        if (y > segment.end) {
          outside = y - segment.end;
        }
        let opacity: number;
        if (reduceMotion) {
          opacity = outside === 0 ? 1 : 0;
        } else {
          const fadeIn =
            index === 0
              ? 1
              : smoothstep((y - (segment.start - dissolve / 2)) / dissolve);
          const fadeOut =
            index === runtime.length - 1
              ? 1
              : smoothstep(
                  1 -
                    (y - (segment.end + dissolve / 2)) /
                      Math.max(crossfade, 1)
                );
          opacity = Math.min(fadeIn, fadeOut);
        }

        segment.visible = opacity > 0.001;
        segment.layer.style.opacity = String(opacity);
        // Later clips sit above earlier ones, so the dissolve is visible.
        segment.layer.style.zIndex = String(index + 1);

        // Only the clips around the screen hold a decoder: at most the one
        // just left, the current one and the next one to dissolve into.
        const position = pageY - rootTop;
        if (
          position > segment.start - viewportHeight &&
          position < segment.end + viewportHeight
        ) {
          void loadClip(segment);
        } else if (
          (segment.video || segment.loading) &&
          (position < segment.start - 1.3 * viewportHeight ||
            position > segment.end + 1.3 * viewportHeight)
        ) {
          unloadClip(segment);
        }
      }

      const current = runtime[currentIndex];
      const currentLength = Math.max(current.end - current.start, 1);
      const currentProgress = clamp((y - current.start) / currentLength);
      const nextActive =
        current.kind === "connector" && currentProgress >= 0.5
          ? current.nextSectionIndex
          : current.sectionIndex;

      if (nextActive !== active) {
        active = nextActive;
        root.dataset.activeSection = String(active);
        setActiveSection(active);
        onActiveRef.current?.(active);
      }

      root.style.setProperty("--ss-progress", String(clamp(y / total)));
      // Once the last frame has landed the stage unpins; as it scrolls away it
      // settles into the page colour instead of leaving as a hard-edged block.
      root.style.setProperty(
        "--ss-end",
        reduceMotion
          ? "0"
          : smoothstep((pageY - rootTop - total) / (0.6 * viewportHeight)).toFixed(3)
      );
    };

    const updateVideos = () => {
      for (const segment of runtime) {
        const { video } = segment;
        if (!video || !segment.ready) {
          continue;
        }
        // A clip on screen that never unlocked would sit on its poster.
        if (segment.visible && !segment.primed && userReady) {
          void primeVideo(segment);
        }
        if (video.seeking) {
          continue;
        }
        if (
          !segment.visible &&
          Math.abs(segment.current - segment.target) < 0.002
        ) {
          continue;
        }

        segment.current += (segment.target - segment.current) * (isMobile() ? 0.28 : 0.2);
        const targetTime =
          clamp(segment.current, 0, 0.999) * (video.duration || 1);
        const epsilon = isMobile() ? 0.02 : 0.008;
        if (Math.abs(video.currentTime - targetTime) > epsilon) {
          try {
            video.currentTime = targetTime;
          } catch {
            // Keep the last painted frame while the browser catches up.
          }
        }
      }
    };

    const tick = () => {
      if (destroyed) {
        return;
      }
      // A clip that failed gets another go once its back-off has passed.
      const now = performance.now();
      if (
        runtime.some(
          (segment) =>
            segment.failed && segment.attempts < 3 && now >= segment.retryAt
        )
      ) {
        dirty = true;
      }
      if (dirty) {
        dirty = false;
        readScroll();
      }
      updateVideos();
      frame = window.requestAnimationFrame(tick);
    };

    const onScroll = () => {
      dirty = true;
    };
    const onResize = () => {
      if (coarsePointer && window.innerWidth === layoutWidth) {
        return;
      }
      layout();
    };
    const onGesture = () => {
      userReady = true;
      for (const segment of runtime) {
        void primeVideo(segment);
      }
    };

    controllerRef.current = {
      jumpToSection(index) {
        const segment = runtime.find(
          (candidate) =>
            candidate.kind === "scene" && candidate.sectionIndex === index
        );
        if (!segment) {
          return;
        }
        const top =
          rootTop + segment.start + 0.15 * (segment.end - segment.start);
        window.scrollTo({
          behavior: reduceMotion ? "auto" : "smooth",
          top,
        });
      },
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", layout);
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("touchend", onGesture, { passive: true });

    layout();
    frame = window.requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      controllerRef.current = null;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", layout);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchend", onGesture);
      root.style.removeProperty("--ss-progress");
      delete root.dataset.activeSection;

      for (const segment of runtime) {
        unloadClip(segment);
        segment.layer.style.removeProperty("opacity");
        segment.layer.style.removeProperty("z-index");
      }
      for (const pending of clipUrls.values()) {
        pending.then((url) => URL.revokeObjectURL(url)).catch(() => {});
      }
    };
  }, [segments]);

  if (scenes.length === 0) {
    return null;
  }

  const themeStyle: ThemeStyle = {
    "--ss-accent": theme.accent,
    "--ss-bg": theme.background,
    "--ss-ink": theme.ink,
    "--ss-muted": theme.muted,
  };

  return (
    <section
      className={["scroll-scrub", className].filter(Boolean).join(" ")}
      ref={rootRef}
      style={themeStyle}
    >
      <div className="scroll-scrub__stage">
        <div aria-hidden="true" className="scroll-scrub__media">
          {segments.map((segment, index) => {
            const layerStyle: ThemeStyle = {
              "--ss-mobile-position": segment.mobileObjectPosition,
              "--ss-object-position": segment.objectPosition,
            };
            return (
              <figure
                className={`scroll-scrub__layer scroll-scrub__layer--${segment.kind}`}
                data-scroll-scrub-layer=""
                key={segment.key}
                style={layerStyle}
              >
                <picture className="scroll-scrub__picture">
                  {segment.mobilePoster ? (
                    <source
                      media="(hover: none) and (pointer: coarse), (max-width: 860px)"
                      srcSet={segment.mobilePoster}
                    />
                  ) : null}
                  <img
                    alt=""
                    className="scroll-scrub__poster"
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    src={segment.poster}
                  />
                </picture>
              </figure>
            );
          })}
        </div>

        <div aria-hidden="true" className="scroll-scrub__progress">
          <span />
        </div>

        <nav aria-label="Scroll chapters" className="scroll-scrub__route">
          {scenes.map((scene, index) => (
            <button
              aria-current={activeSection === index ? "step" : undefined}
              className="scroll-scrub__route-button"
              key={scene.id}
              onClick={() => controllerRef.current?.jumpToSection(index)}
              type="button"
            >
              <span>{scene.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="scroll-scrub__story">
        {segments.map((segment) => {
          const bandStyle: CSSProperties = {
            // svh, not dvh: phone toolbars resizing dvh mid-scroll would shift every
            // band and throw the film out of step with the finger.
            minHeight: `${Math.max(segment.weight, 0.2) * 100}svh`,
          };

          if (segment.kind === "connector") {
            return (
              <div
                aria-hidden="true"
                className="scroll-scrub__connector-band"
                data-scroll-scrub-band=""
                key={segment.key}
                style={bandStyle}
              />
            );
          }

          const { scene } = segment;
          if (!scene) {
            return null;
          }
          const Heading = segment.sectionIndex === 0 ? firstHeading : "h2";

          return (
            <article
              className="scroll-scrub__chapter"
              data-align={scene.align ?? "left"}
              data-scroll-scrub-band=""
              data-sound={scene.sound}
              id={scene.id}
              key={segment.key}
              style={bandStyle}
            >
              <div className="scroll-scrub__chapter-pin">
                <div className="scroll-scrub__copy">
                  {scene.kicker ? (
                    <p className="scroll-scrub__kicker">{scene.kicker}</p>
                  ) : null}
                  <Heading className="scroll-scrub__title">
                    {scene.title}
                  </Heading>
                  <p className="scroll-scrub__body">{scene.body}</p>
                  {scene.tags?.length ? (
                    <ul className="scroll-scrub__tags">
                      {scene.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  ) : null}
                  {scene.actions ? (
                    <div className="scroll-scrub__actions">{scene.actions}</div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
