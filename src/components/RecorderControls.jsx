function RecorderControls({
  onStart,
  onStop,
}) {

  return (

    <div className="flex gap-4">

      <button
        onClick={onStart}
        className="bg-green-600 text-white px-5 py-3 rounded-xl"
      >
        🎤 Start Recording
      </button>

      <button
        onClick={onStop}
        className="bg-red-600 text-white px-5 py-3 rounded-xl"
      >
        ⏹ Stop Recording
      </button>

    </div>

  );
}

export default RecorderControls;