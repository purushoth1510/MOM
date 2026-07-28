function TranscriptViewer({
  transcript,
}) {

  return (

    <div className="bg-white rounded-3xl p-6">

      <h2 className="font-bold text-xl mb-4">
        Transcript
      </h2>

      <div className="max-h-[400px] overflow-y-auto">

        {transcript}

      </div>

    </div>

  );
}

export default TranscriptViewer;