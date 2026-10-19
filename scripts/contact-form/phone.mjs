export function formatPhone(value, region = 'KR') {
  if (region !== 'KR' || /[^\d\s()-]/.test(value)) return value;
  const digits = value.replace(/\D/g, '');
  if (!digits.startsWith('0') || digits.length > 11) return value;
  const prefix = digits.startsWith('02') ? 2 : 3;
  if (digits.length <= prefix) return digits;
  if (digits.length <= prefix + 4) return `${digits.slice(0, prefix)}-${digits.slice(prefix)}`;
  const middle = digits.length === prefix + 8 ? 4 : 3;
  return `${digits.slice(0, prefix)}-${digits.slice(prefix, prefix + middle)}-${digits.slice(prefix + middle)}`;
}

export function formatPhoneInput(input, region) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  const before = input.value;
  const formatted = formatPhone(before, region);
  if (before === formatted) return;
  const position = index => {
    const digits = before.slice(0, index).replace(/\D/g, '').length;
    if (!digits) return 0;
    let seen = 0;
    for (let offset = 0; offset < formatted.length; offset += 1) {
      if (/\d/.test(formatted[offset])) seen += 1;
      if (seen === digits) return offset + 1;
    }
    return formatted.length;
  };
  input.value = formatted;
  input.setSelectionRange(position(start), position(end));
}
