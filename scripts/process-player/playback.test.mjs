import test from "node:test";
import assert from "node:assert/strict";
import {
  createPlayback,
  createTapNavigation,
  getProgressSegments,
} from "./playback.mjs";

function setup() {
  let now = 0;
  let nextId = 1;
  const tasks = new Map();
  const changes = [];
  const clock = {
    performance: { now: () => now },
    setTimeout(fn, delay) {
      const id = nextId++;
      tasks.set(id, { fn, at: now + delay });
      return id;
    },
    clearTimeout(id) {
      tasks.delete(id);
    },
  };
  const advance = (ms) => {
    const end = now + ms;
    while (true) {
      const next = [...tasks].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > end) break;
      now = next[1].at;
      tasks.delete(next[0]);
      next[1].fn();
    }
    now = end;
  };
  const playback = createPlayback({
    count: 4,
    clock,
    onChange: (index, manual) => changes.push({ index, manual }),
  });
  return { playback, advance, tasks, changes };
}
test("automatic sequence uses 10 seconds and wraps after the fourth step", () => {
  const { playback, advance } = setup();
  playback.select(0, false);
  advance(9999);
  assert.equal(playback.index, 0);
  advance(1);
  assert.equal(playback.index, 1);
  advance(30000);
  assert.equal(playback.index, 0);
});
test("manual selection gets 20 seconds, then continues from that step", () => {
  const { playback, advance } = setup();
  playback.select(2);
  advance(19999);
  assert.equal(playback.index, 2);
  advance(1);
  assert.equal(playback.index, 3);
  advance(10000);
  assert.equal(playback.index, 0);
});
test("overlapping pause reasons preserve remaining reading time", () => {
  const { playback, advance, tasks } = setup();
  playback.select(0, false);
  advance(4000);
  playback.pause("hover", true);
  playback.pause("document", true);
  advance(50000);
  assert.equal(playback.index, 0);
  playback.pause("hover", false);
  assert.equal(tasks.size, 0);
  playback.pause("document", false);
  advance(5999);
  assert.equal(playback.index, 0);
  advance(1);
  assert.equal(playback.index, 1);
});
test("rapid selections replace old timers and keep only one pending transition", () => {
  const { playback, advance, tasks } = setup();
  playback.select(0, false);
  advance(9000);
  playback.select(3);
  playback.select(1);
  assert.equal(tasks.size, 1);
  advance(19999);
  assert.equal(playback.index, 1);
  advance(1);
  assert.equal(playback.index, 2);
});
test("explicit stop stays stopped across visibility changes and selection", () => {
  const { playback, advance, tasks } = setup();
  playback.enable(false);
  playback.select(2);
  playback.pause("viewport", true);
  playback.pause("viewport", false);
  advance(60000);
  assert.equal(playback.index, 2);
  assert.equal(tasks.size, 0);
  playback.enable(true);
  advance(20000);
  assert.equal(playback.index, 3);
  playback.destroy();
  assert.equal(tasks.size, 0);
});

test("progress marks earlier segments complete, only current segment timed and later segments empty", () => {
  assert.deepEqual(getProgressSegments(0, 4, 0.3), [0.3, 0, 0, 0]);
  assert.deepEqual(getProgressSegments(2, 4, 0.4), [1, 1, 0.4, 0]);
  assert.deepEqual(getProgressSegments(3, 4, 0.8), [1, 1, 1, 0.8]);
  assert.deepEqual(getProgressSegments(1, 4, -0.1), [1, 0, 0, 0]);
  assert.deepEqual(getProgressSegments(1, 4, 1.2), [1, 1, 0, 0]);
});

const bounds = { left: 20, right: 360, top: 100, bottom: 600 };
function tapSetup() {
  let now = 0;
  const holds = [],
    directions = [];
  const tap = createTapNavigation({
    clock: { performance: { now: () => now } },
    onHold: (value) => holds.push(value),
    onNavigate: (value) => directions.push(value),
  });
  return {
    tap,
    holds,
    directions,
    advance: (ms) => {
      now += ms;
    },
  };
}
test("a short tap in the left half selects the previous step", () => {
  const { tap, directions, holds, advance } = tapSetup();
  tap.start({ pointerId: 1, clientX: 80, clientY: 200 });
  advance(100);
  tap.finish({ pointerId: 1, clientX: 80, clientY: 200 }, bounds);
  assert.deepEqual(directions, [-1]);
  assert.deepEqual(holds, [true, false]);
});
test("a short tap in the right half selects the next step", () => {
  const { tap, directions, advance } = tapSetup();
  tap.start({ pointerId: 1, clientX: 280, clientY: 200 });
  advance(120);
  tap.finish({ pointerId: 1, clientX: 280, clientY: 200 }, bounds);
  assert.deepEqual(directions, [1]);
});
test("the virtual middle belongs to the right half and small movement keeps the original side", () => {
  const { tap, directions } = tapSetup();
  tap.start({ pointerId: 1, clientX: 190, clientY: 200 });
  tap.finish({ pointerId: 1, clientX: 190, clientY: 200 }, bounds);
  tap.start({ pointerId: 1, clientX: 188, clientY: 200 });
  tap.finish({ pointerId: 1, clientX: 193, clientY: 200 }, bounds);
  assert.deepEqual(directions, [1, -1]);
});
test("a long press pauses reading and never navigates when released", () => {
  const { tap, directions, holds, advance } = tapSetup();
  tap.start({ pointerId: 1, clientX: 280, clientY: 200 });
  advance(3000);
  assert.equal(tap.holding, true);
  tap.finish({ pointerId: 1, clientX: 280, clientY: 200 }, bounds);
  assert.deepEqual(directions, []);
  assert.deepEqual(holds, [true, false]);
});
test("horizontal drags never navigate in either direction", () => {
  const { tap, directions } = tapSetup();
  tap.start({ pointerId: 1, clientX: 280, clientY: 200 });
  tap.move({ pointerId: 1, clientX: 80, clientY: 200 });
  tap.finish({ pointerId: 1, clientX: 80, clientY: 200 }, bounds);
  tap.start({ pointerId: 1, clientX: 80, clientY: 200 });
  tap.move({ pointerId: 1, clientX: 280, clientY: 200 });
  tap.finish({ pointerId: 1, clientX: 280, clientY: 200 }, bounds);
  assert.deepEqual(directions, []);
});
test("moving away and back to the starting point does not become a tap", () => {
  const { tap, directions } = tapSetup();
  tap.start({ pointerId: 1, clientX: 80, clientY: 200 });
  tap.move({ pointerId: 1, clientX: 150, clientY: 200 });
  tap.move({ pointerId: 1, clientX: 80, clientY: 200 });
  tap.finish({ pointerId: 1, clientX: 80, clientY: 200 }, bounds);
  assert.deepEqual(directions, []);
});
test("vertical scrolling, cancellation and releases outside do not navigate", () => {
  const { tap, directions } = tapSetup();
  tap.start({ pointerId: 1, clientX: 280, clientY: 200 });
  tap.move({ pointerId: 1, clientX: 280, clientY: 260 });
  tap.finish({ pointerId: 1, clientX: 280, clientY: 260 }, bounds);
  tap.start({ pointerId: 1, clientX: 280, clientY: 200 });
  tap.finish({ pointerId: 1, clientX: 280, clientY: 200 }, bounds, true);
  tap.start({ pointerId: 1, clientX: 24, clientY: 200 });
  tap.finish({ pointerId: 1, clientX: 18, clientY: 200 }, bounds);
  assert.deepEqual(directions, []);
});
test("multiple fingers and interrupted input always release the pause without navigating", () => {
  const { tap, directions, holds } = tapSetup();
  tap.start({ pointerId: 1, clientX: 80, clientY: 200 });
  tap.start({ pointerId: 2, clientX: 280, clientY: 200 });
  tap.finish({ pointerId: 1, clientX: 80, clientY: 200 }, bounds);
  assert.equal(tap.holding, true);
  tap.finish({ pointerId: 2, clientX: 280, clientY: 200 }, bounds);
  assert.deepEqual(directions, []);
  assert.equal(holds.at(-1), false);
  tap.start({ pointerId: 1, clientX: 280, clientY: 200 });
  tap.cancel();
  tap.finish({ pointerId: 1, clientX: 280, clientY: 200 }, bounds);
  assert.equal(tap.holding, false);
  assert.deepEqual(directions, []);
});
test("holding preserves remaining time while a completed tap starts a new 20 second reading interval", () => {
  const { playback, advance } = setup();
  let tapNow = 0;
  const tap = createTapNavigation({
    clock: { performance: { now: () => tapNow } },
    onHold: (held) => playback.pause("press", held),
    onNavigate: (side) => playback.select(playback.index + side),
  });
  playback.select(0, false);
  advance(4000);
  tap.start({ pointerId: 1, clientX: 280, clientY: 200 });
  advance(30000);
  tapNow = 30000;
  tap.finish({ pointerId: 1, clientX: 280, clientY: 200 }, bounds);
  advance(5999);
  assert.equal(playback.index, 0);
  advance(1);
  assert.equal(playback.index, 1);
  tap.start({ pointerId: 1, clientX: 280, clientY: 200 });
  tapNow += 100;
  tap.finish({ pointerId: 1, clientX: 280, clientY: 200 }, bounds);
  assert.equal(playback.index, 2);
  advance(19999);
  assert.equal(playback.index, 2);
  advance(1);
  assert.equal(playback.index, 3);
});
