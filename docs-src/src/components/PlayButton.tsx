export function PlayButton({
  disabled,
  loading,
  onClick,
}: {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button disabled={disabled} onClick={onClick}>
      {loading ? "Loading..." : "PLAY!"}
    </button>
  );
}
