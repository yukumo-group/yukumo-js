export function wavBlob(wav: Uint8Array): Blob {
  return new Blob([new Uint8Array(wav)], { type: "audio/wav" });
}

export function wavFilename(content: string): string {
  const slug = content
    .replace(/[\\/:*?"<>|\r\n]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 80)
    .replace(/\.+$/, "");
  return `yukumo_${slug || "audio"}.wav`;
}

export function downloadWav(wav: Uint8Array, filename = "yukumo.wav") {
  const url = URL.createObjectURL(wavBlob(wav));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function createPlayback(wav: Uint8Array, onEnded: () => void): {
  audio: HTMLAudioElement;
  stop: () => void;
} {
  const url = URL.createObjectURL(wavBlob(wav));
  const audio = new Audio(url);
  let released = false;

  const release = () => {
    if (released) {
      return;
    }
    released = true;
    audio.pause();
    audio.currentTime = 0;
    URL.revokeObjectURL(url);
  };

  audio.addEventListener("ended", () => {
    release();
    onEnded();
  });

  return { audio, stop: release };
}
