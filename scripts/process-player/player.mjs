import {
  createPlayback,
  createTapNavigation,
  getProgressSegments,
} from "./playback.mjs";

function initializeProcessPlayer(root) {
  root.classList.add("is-enhanced");
  root.querySelector(".step-choices").hidden = false;
  root.querySelector(".display-meta").hidden = false;
  const viewport = root.querySelector(".step-viewport");
  viewport.tabIndex = 0;
  viewport.setAttribute(
    "aria-label",
    "작업 단계 화면. 왼쪽을 누르면 이전 단계, 오른쪽을 누르면 다음 단계입니다. 길게 누르면 자동 진행이 멈춥니다. 방향키로도 이동할 수 있습니다.",
  );
  const panels = [...root.querySelectorAll(".step-panel")];
  const choices = [...root.querySelectorAll(".step-choice")];
  const fills = [...root.querySelectorAll(".segment-fill")];
  const toggle = root.querySelector(".playback-toggle");
  const counter = root.querySelector(".current-step");
  const announcement = root.querySelector(".step-announcement");
  const titles = panels.map((panel) => panel.querySelector("h2").textContent);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let direction = 1;
  let progressAnimation;
  let entranceAnimation;
  const playback = createPlayback({
    count: panels.length,
    onChange(index, manual) {
      const previous = current;
      const entryDirection = direction;
      direction = 1;
      entranceAnimation?.cancel();
      current = index;
      panels.forEach((panel, i) => {
        panel.classList.toggle("is-current", i === index);
        panel.setAttribute("aria-hidden", String(i !== index));
        panel.inert = i !== index;
      });
      choices.forEach((button, i) => {
        button.classList.toggle("is-current", i === index);
        if (i === index) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
      });
      counter.textContent = `0${index + 1} / 0${panels.length}`;
      if (manual)
        announcement.textContent = `${index + 1}단계, ${titles[index]}`;
      if (
        previous !== index &&
        !reducedMotion.matches &&
        panels[index].animate
      ) {
        entranceAnimation = panels[index].animate(
          [
            {
              opacity: 0.25,
              transform: `translateX(${entryDirection * 14}px)`,
            },
            { opacity: 1, transform: "translateX(0)" },
          ],
          { duration: 210, easing: "cubic-bezier(.22,1,.36,1)" },
        );
      }
    },
    onTiming({ enabled, running, remaining, duration }) {
      if (toggle.getAttribute("aria-pressed") !== String(enabled)) {
        toggle.setAttribute("aria-pressed", String(enabled));
        toggle.setAttribute(
          "aria-label",
          enabled ? "자동 넘김 멈춤" : "자동 넘김 시작",
        );
        toggle.innerHTML = enabled
          ? '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 5v14M16 5v14"/></svg>'
          : '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m8 5 11 7-11 7Z"/></svg>';
      }
      progressAnimation?.cancel();
      const fraction = 1 - remaining / duration;
      getProgressSegments(current, fills.length, fraction).forEach(
        (value, i) => {
          fills[i].style.transform = `scaleX(${value})`;
        },
      );
      if (running && !reducedMotion.matches && fills[current].animate) {
        progressAnimation = fills[current].animate(
          [{ transform: `scaleX(${fraction})` }, { transform: "scaleX(1)" }],
          { duration: remaining, easing: "linear", fill: "forwards" },
        );
      }
    },
  });
  const tapping = createTapNavigation({
    onHold(holding) {
      viewport.classList.toggle("is-holding", holding);
      playback.pause("press", holding);
    },
    onNavigate(side) {
      direction = side;
      playback.select(current + side);
    },
  });
  const selectStep = (index) => {
    tapping.cancel();
    direction = index < current ? -1 : 1;
    playback.select(index);
  };
  choices.forEach((button) =>
    button.addEventListener("click", () => {
      selectStep(Number(button.dataset.step));
    }),
  );
  toggle.addEventListener("click", () => playback.enable(!playback.enabled));
  viewport.addEventListener("keydown", (event) => {
    if (event.target.closest("a,button,input,select,textarea")) return;
    const target = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: panels.length - 1,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    selectStep(target);
    viewport.focus({ preventScroll: true });
  });
  viewport.addEventListener("pointerdown", (event) => {
    if (event.target.closest("a,button,input,select,textarea")) return;
    if (tapping.start(event)) {
      if (event.pointerType === "mouse") event.preventDefault();
      viewport.setPointerCapture(event.pointerId);
    }
  });
  viewport.addEventListener("pointermove", (event) => tapping.move(event));
  viewport.addEventListener("pointerup", (event) =>
    tapping.finish(event, viewport.getBoundingClientRect()),
  );
  viewport.addEventListener("pointercancel", (event) =>
    tapping.finish(event, viewport.getBoundingClientRect(), true),
  );
  viewport.addEventListener("lostpointercapture", (event) =>
    tapping.finish(event, viewport.getBoundingClientRect(), true),
  );
  viewport.addEventListener("contextmenu", (event) => {
    if (tapping.holding) event.preventDefault();
  });
  viewport.addEventListener(
    "touchstart",
    () => playback.pause("touch-contact", true),
    { passive: true },
  );
  const releaseTouch = (event) => {
    if (!event.touches.length) playback.pause("touch-contact", false);
  };
  document.addEventListener("touchend", releaseTouch, { passive: true });
  document.addEventListener("touchcancel", releaseTouch, { passive: true });
  const buttonContacts = new Set();
  root.addEventListener(
    "pointerdown",
    (event) => {
      playback.pause("focus", false);
      if (event.button !== 0 || !event.target.closest("button")) return;
      buttonContacts.add(event.pointerId);
      playback.pause("control-press", true);
    },
    { capture: true },
  );
  const releaseButton = (event) => {
    buttonContacts.delete(event.pointerId);
    if (!buttonContacts.size) playback.pause("control-press", false);
  };
  document.addEventListener("pointerup", releaseButton);
  document.addEventListener("pointercancel", releaseButton);
  root.addEventListener("focusin", () => {
    if (document.documentElement.dataset.focusInput === "keyboard")
      playback.pause("focus", true);
  });
  root.addEventListener("focusout", () =>
    queueMicrotask(() => {
      if (!root.contains(document.activeElement))
        playback.pause("focus", false);
    }),
  );
  const releaseContacts = () => {
    tapping.cancel();
    buttonContacts.clear();
    playback.pause("control-press", false);
    playback.pause("touch-contact", false);
  };
  window.addEventListener("blur", () => {
    playback.pause("window", true);
    releaseContacts();
  });
  window.addEventListener("focus", () => playback.pause("window", false));
  window.addEventListener("pagehide", () => {
    playback.pause("page", true);
    releaseContacts();
  });
  window.addEventListener("pageshow", () => playback.pause("page", false));
  window.addEventListener("resize", releaseContacts);
  document.addEventListener("visibilitychange", () =>
    playback.pause("document", document.hidden),
  );
  const observer = new IntersectionObserver(
    (entries) =>
      playback.pause("viewport", entries[0].intersectionRatio < 0.25),
    { threshold: 0.25 },
  );
  observer.observe(viewport);
  const menuObserver = new MutationObserver(() =>
    playback.pause(
      "menu",
      document.documentElement.classList.contains("menu-open"),
    ),
  );
  menuObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      releaseContacts();
      entranceAnimation?.cancel();
      playback.enable(false);
    }
  });
  playback.pause("document", document.hidden);
  playback.pause(
    "menu",
    document.documentElement.classList.contains("menu-open"),
  );
  playback.pause("viewport", true);
  playback.enable(!reducedMotion.matches);
  playback.select(0, false);
}

document
  .querySelectorAll(".process-experience")
  .forEach(initializeProcessPlayer);
