function ToggleSwitch({ enabled, setEnabled, disabled = false }) {

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          setEnabled(!enabled);
        }
      }}
      className={
        (enabled
          ? "bg-green-600 w-14 h-8 rounded-full relative"
          : "bg-gray-300 w-14 h-8 rounded-full relative") +
        (disabled ? " opacity-50 cursor-not-allowed" : "")
      }
    >

      <div
        className={
          enabled
            ? "bg-white w-6 h-6 rounded-full absolute top-1 right-1"
            : "bg-white w-6 h-6 rounded-full absolute top-1 left-1"
        }
      />

    </button>
  );
}

export default ToggleSwitch;