import { XIcon } from "lucide-react";

interface RecordingProps {
  stopRecording: () => void;
}

export const Recording = ({ stopRecording }: RecordingProps) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex flex-col items-center justify-center z-10">
      <p className="text-2xl font-bold text-white">録音中...</p>
      <button
        onClick={stopRecording}
        className="text-white text-2xl font-bold mt-4 bg-red-500 px-4 py-2 rounded-md"
      >
        <XIcon className="size-6" />
      </button>
    </div>
  );
};
