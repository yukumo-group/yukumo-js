import { useI18n } from "../i18n/I18nProvider.tsx";

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
  const { t } = useI18n();

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
      <button disabled={playDisabled} onClick={onPlay}>
        {loading ? t.loading : t.play}
      </button>
      <button disabled={stopDisabled} onClick={onStop}>
        {t.stop}
      </button>
      <button disabled={downloadDisabled} onClick={onDownload}>
        {t.download}
      </button>
    </div>
  );
}
