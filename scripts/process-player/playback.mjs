export function createPlayback({
  count,
  delay = 10000,
  manualDelay = 20000,
  onChange,
  onTiming = () => {},
  clock = globalThis,
}) {
  let current = 0;
  let enabled = true;
  let duration = delay;
  let remaining = delay;
  let started = 0;
  let timer;
  const pauses = new Set();
  const stop = () => {
    if (timer === undefined) return;
    remaining = Math.max(0, remaining - (clock.performance.now() - started));
    clock.clearTimeout(timer);
    timer = undefined;
  };
  const schedule = () => {
    stop();
    const running = enabled && pauses.size === 0;
    onTiming({ enabled, running, remaining, duration });
    if (!running) return;
    started = clock.performance.now();
    timer = clock.setTimeout(() => {
      timer = undefined;
      select(current + 1, false);
    }, remaining);
  };
  const select = (index, manual = true) => {
    stop();
    current = ((index % count) + count) % count;
    duration = manual ? manualDelay : delay;
    remaining = duration;
    onChange(current, manual);
    schedule();
  };
  return {
    select,
    next: (manual = true) => select(current + 1, manual),
    previous: () => select(current - 1),
    enable(value) {
      stop();
      enabled = value;
      schedule();
    },
    pause(reason, value) {
      if (pauses.has(reason) === Boolean(value)) return;
      stop();
      value ? pauses.add(reason) : pauses.delete(reason);
      schedule();
    },
    destroy() {
      stop();
      enabled = false;
    },
    get index() {
      return current;
    },
    get enabled() {
      return enabled;
    },
  };
}

export function getProgressSegments(index, count, fraction) {
  return Array.from({ length: count }, (_, position) =>
    position < index
      ? 1
      : position === index
        ? Math.max(0, Math.min(1, fraction))
        : 0,
  );
}

export function createTapNavigation({
  onHold,
  onNavigate,
  clock = globalThis,
  holdDelay = 450,
  tolerance = 10,
}) {
  const contacts = new Map();
  let multiple = false;
  return {
    start({ pointerId, clientX, clientY, button = 0 }) {
      if (button !== 0) return false;
      contacts.set(pointerId, {
        x: clientX,
        y: clientY,
        at: clock.performance.now(),
        moved: false,
      });
      if (contacts.size > 1) multiple = true;
      onHold(true);
      return true;
    },
    move({ pointerId, clientX, clientY }) {
      const start = contacts.get(pointerId);
      if (start && Math.hypot(clientX - start.x, clientY - start.y) > tolerance)
        start.moved = true;
    },
    finish({ pointerId, clientX, clientY }, bounds, cancelled = false) {
      const start = contacts.get(pointerId);
      if (!start) return;
      contacts.delete(pointerId);
      const inside =
        clientX >= bounds.left &&
        clientX <= bounds.right &&
        clientY >= bounds.top &&
        clientY <= bounds.bottom;
      const moved =
        start.moved ||
        Math.hypot(clientX - start.x, clientY - start.y) > tolerance;
      if (
        !cancelled &&
        !multiple &&
        !contacts.size &&
        inside &&
        !moved &&
        clock.performance.now() - start.at < holdDelay
      ) {
        onNavigate(start.x < (bounds.left + bounds.right) / 2 ? -1 : 1);
      }
      if (!contacts.size) {
        multiple = false;
        onHold(false);
      }
    },
    cancel() {
      contacts.clear();
      multiple = false;
      onHold(false);
    },
    get holding() {
      return contacts.size > 0;
    },
  };
}
