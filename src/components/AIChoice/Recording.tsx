import { XIcon } from "lucide-react";

interface RecordingProps {
  stopRecording: () => void;
  isProcessing: boolean;
}

export const Recording = ({ stopRecording, isProcessing }: RecordingProps) => {
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 pointer-events-auto">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 pointer-events-auto">
      <p className="text-2xl font-bold text-white animate-pulse">録音中...</p>
      <button
        onClick={stopRecording}
        className="text-white text-2xl font-bold mt-12 bg-red-500 px-4 py-2 rounded-md pointer-events-auto"
      >
        <XIcon className="size-6" />
      </button>
    </div>
  );
};
