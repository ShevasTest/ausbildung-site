const OPEN = "<think>";
const CLOSE = "</think>";

function partialTagLength(buf: string, tag: string): number {
  const max = Math.min(buf.length, tag.length - 1);
  for (let len = max; len > 0; len--) {
    if (buf.endsWith(tag.slice(0, len))) {
      return len;
    }
  }
  return 0;
}

/**
 * Stateful filter that removes <think>…</think> reasoning blocks from a
 * streamed text sequence. Reasoning models (e.g. Qwen3 thinking variants)
 * emit their chain of thought inside these tags; without filtering it leaks
 * into user-facing output. Tags may be split across arbitrary chunk
 * boundaries, so the filter carries partial-tag state between chunks.
 */
export function createThinkStripper() {
  let inThink = false;
  let carry = "";

  const process = (chunk: string): string => {
    let buf = carry + chunk;
    carry = "";
    let out = "";

    for (;;) {
      if (inThink) {
        const end = buf.indexOf(CLOSE);
        if (end === -1) {
          carry = buf.slice(buf.length - Math.min(buf.length, CLOSE.length - 1));
          return out;
        }
        buf = buf.slice(end + CLOSE.length);
        inThink = false;
        continue;
      }

      const start = buf.indexOf(OPEN);
      if (start === -1) {
        const tail = partialTagLength(buf, OPEN);
        out += tail > 0 ? buf.slice(0, buf.length - tail) : buf;
        carry = tail > 0 ? buf.slice(buf.length - tail) : "";
        return out;
      }

      out += buf.slice(0, start);
      buf = buf.slice(start + OPEN.length);
      inThink = true;
    }
  };

  /** Emits whatever safe text is still buffered once the stream ends. */
  const flush = (): string => {
    const rest = inThink ? "" : carry;
    carry = "";
    inThink = false;
    return rest;
  };

  return { process, flush };
}
