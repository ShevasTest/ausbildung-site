export function encodeLlmLabel(label: string): string {
  return encodeURIComponent(label);
}

export function decodeLlmLabel(label: string | null): string {
  if (!label) {
    return "";
  }

  try {
    return decodeURIComponent(label);
  } catch {
    return label;
  }
}
