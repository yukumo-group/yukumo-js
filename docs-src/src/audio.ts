export async function playWav(wav: Uint8Array) {
  const blob = new Blob([new Uint8Array(wav)], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await audio.play();
  URL.revokeObjectURL(url);
}
