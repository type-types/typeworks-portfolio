export function advanceTextInput(event, inputs, onLast) {
  if (event.key !== 'Enter' || event.isComposing || event.keyCode === 229 || !event.target.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])')) return;
  const index = inputs.indexOf(event.target);
  if (index < 0) return;
  event.preventDefault();
  const next = inputs[index + 1];
  if (next) next.focus();
  else onLast();
}
