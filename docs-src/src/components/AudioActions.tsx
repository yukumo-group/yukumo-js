export function AudioActions({
  loading,
  playDisabled,
  stopDisabled,
  downloadDisabled,
  onPlay,
  onStop,
  onDownload,
}: {
  loading: boolean;
  playDisabled: boolean;
  stopDisabled: boolean;
  downloadDisabled: boolean;
  onPlay: () => void;
  onStop: () => void;
  onDownload: () => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
      <button disabled={playDisabled} onClick={onPlay}>
        {loading ? "Loading..." : "PLAY!"}
      </button>
      <button disabled={stopDisabled} onClick={onStop}>
        Stop
      </button>
      <button disabled={downloadDisabled} onClick={onDownload}>
        Download WAV
      </button>
    </div>
  );
}
