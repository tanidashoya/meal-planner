import { useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAiChoiceStore } from "../../modules/aiChoice/ai-choice.state";
import { MicIcon } from "lucide-react";
import { Recording } from "./Recording";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_API_KEY = import.meta.env.VITE_SUPABASE_API_KEY;

export const SpeechToText = () => {
  //音声文字起こし処理中かどうかを制御する状態
  const [isProcessing, setIsProcessing] = useState(false);
  //録音中かどうかを制御する状態
  const [recording, setRecording] = useState(false);
  //出力されたテキストを管理する状態(※※※※※本番ではグローバルステートに入れる)
  const aiChoiceStore = useAiChoiceStore();
  //useRef:参照保持
  //mediaRecorderRef：MediaRecorder（録音装置）のインスタンスを保持
  //audioChunksRef：録音したデータ（音声の断片）をためる配列
  //MediaRecorder は「Reactの再レンダーに影響させたくない・させる必要がないオブジェクト」だから
  //useRefに入れて保持⇒useRef に入れずに普通の変数として宣言してしまうと、
  //Reactが再レンダーするたびに初期化（＝消える）・・・再レンダー＝関数が再実行され初期化される
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  //navigator.mediaDevices.getUserMedia({ audio: true }):
  //⇒ブラウザに「マイクを使っていいですか？」と許可を求める関数。
  //許可されると、マイク音声の**ストリーム（流れ）**が返ってきます。
  //これを MediaRecorder (🎛️ 録音装置)に渡して録音準備完了
  //mediaRecorderRef.current = mediaRecorder;：MediaRecorder のインスタンスを保存しておく
  //audioChunksRef.current = [];：録音データ（音声チャンク）を空にリセットしておく
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    //mediaRecorderRef.current = mediaRecorder;：参照先オブジェクトが同じ
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    //mediaRecorder.ondataavailable:これはオブジェクトのプロパティ
    //ondataavailable は、MediaRecorder に組み込まれているイベントハンドラ（コールバック）を
    //登録するためのプロパティ
    //録音中に生成される音声データ（小さな断片＝チャンク）を配列にためていく処理を格納
    //「一定時間ごと」または「録音が停止したとき」に ondataavailable が発火
    mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

    //onstop:録音を止まったときに実行する関数を登録するプロパティ
    //録音がとまったあとに自動で発火する。
    //const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    //⇒「録音した複数の音声データを1つの .webm ファイル（第二引数で指定）にまとめる」
    //const formData = new FormData();：サーバーに送る準備（送信用のオブジェクト作成）
    //append （オブジェクトにデータを追加）の引数はこの3つ👇
    //"file"：サーバー側でこの項目を識別するための「名前」
    //blob：実際のデータ（ここでは録音した音声ファイル）
    //"audio.webm"：ファイル名として送られる文字列（任意）
    //⇒
    //FormData {
    //  file: (Blobオブジェクト: audio/webm)
    //}
    mediaRecorder.onstop = async () => {
      setIsProcessing(true);
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");

      try {
        // supabase.functions.invoke()は通常のJSON送信には便利だが、
        // FormData（ファイル送信）には対応していないため、通常のfetchを使用
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/transcribe`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: SUPABASE_API_KEY,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          console.error("Transcribe error:", response.statusText);
          setIsProcessing(false);
          return;
        }

        const result = await response.json();
        console.log("Response data:", result);
        console.log("Text extracted:", result?.text);

        if (result?.text) {
          aiChoiceStore.setAiWord(result.text);
        }
        setIsProcessing(false);
      } catch (error) {
        console.error("Transcribe error:", error);
        setIsProcessing(false);
      }
    };

    mediaRecorder.start();
    setRecording(true);
  };

  //録音を止める関数
  //mediaRecorderRef.current?.stop();：これで録音を止める
  //useRef は単なる「入れ物」
  //.current が中身
  //.stop() はその中身（MediaRecorderインスタンス）のメソッド
  //mediaRecorder.onstop：ここに登録した関数が自動で発火する
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    //マイクの使用を停止
    //mediaRecorderRef.current?.stream：マイクの使用を停止
    //mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());：マイクの使用を停止
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    setRecording(false);
  };

  return (
    <div className="m-0">
      <button onClick={recording ? stopRecording : startRecording}>
        <MicIcon
          className={`size-8 border-[1px] border-gray-300 rounded-md p-1 ${
            recording ? "text-red-500" : "text-green-500"
          }`}
        />
      </button>
      {(recording || isProcessing) && (
        <Recording stopRecording={stopRecording} isProcessing={isProcessing} />
      )}
    </div>
  );
};
/*
  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-semibold mb-2">🎙️ 音声文字起こし</h2>
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded text-white ${
          recording ? "bg-red-500" : "bg-green-500"
        }`}
      >
        {recording ? "停止" : "録音開始"}
      </button>
      <p className="mt-4 whitespace-pre-wrap">{text}</p>
    </div>
  );
}
*/
