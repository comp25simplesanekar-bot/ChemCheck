let pending = { file: null, text: "" };

export function setPending(value) {
  pending = { file: null, text: "", ...value };
}

export function takePending() {
  const value = pending;
  pending = { file: null, text: "" };
  return value;
}
