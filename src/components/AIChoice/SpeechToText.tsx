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
    //再レンダリングしても保持できるようにしている
    mediaRecorderRef.current = mediaRecorder;
    //録音データ（音声チャンク）を空にリセットしておく
    audioChunksRef.current = [];

    //mediaRecorder.ondataavailable:これはオブジェクトのプロパティ
    //ondataavailable は、MediaRecorder に組み込まれているイベントハンドラ（コールバック）を
    //登録するためのプロパティ
    //録音中に生成される音声データ（小さな断片＝チャンク）を配列にためていく処理を格納
    //「一定時間ごと」または「録音が停止したとき」に ondataavailable が発火
    //new Blob(
    //   第1引数: データの配列（ここでは音声チャンクを格納した配列）,
    //   第2引数: オプション（MIMEタイプなど）
    // )
    //e.data:音声チャンクを格納したBlobオブジェクト
    //audioChunksRef.current.push(e.data);：音声チャンクを配列に追加
    //録音中順次ondataavailableが発火して、録音した音声チャンク（Blobオブジェクト）をaudioChunk配列に追加していく
    //audioChunksRef.current = [Blob1, Blob2, Blob3, Blob4,・・・]⇒メディアレコーダーから Blob が返るためBlob型のオブジェクトが格納されていく
    mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

    //onstop:録音を止まったときに実行する関数を登録するプロパティ
    //録音がとまったあとに自動で発火する。
    //const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    //Blobクラスのインスタンスを作成（Blobは非テキストデータを保持しておくためのオブジェクト）
    //⇒第一引数：データの配列（ここでは音声チャンクを格納した配列）⇒この時バイナリデータとして結合される
    //⇒第二引数：オプション（MIMEタイプなど）「audio/webm」はWebM形式の音声ファイル
    //const formData = new FormData();：サーバーに送る準備（送信用のオブジェクト作成）
    //append （オブジェクトにデータを追加）の引数はこの3つ👇
    //"file"：サーバー側でこの項目を識別するための「名前」
    //blob：実際のデータ（ここでは録音した音声ファイル）
    //"audio.webm"：ファイル名として送られる文字列（任意）
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      //BlobではJSONで送れないのでFormDataを使用してサーバーに送る（FormDataはファイルを送信するためのオブジェクト）
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");
      // ⇒ FormDataにエントリを追加
      //  "file" = キー
      //  blob = 実際のデータ
      //  "audio.webm" = ファイル名

      // supabase.functions.invoke()は通常のJSON送信には便利だが、
      // FormData（ファイル送信）には対応していないため、通常のfetchを使用
      //dataの中のsessionを取得して、access_tokenを取得して、Authorizationヘッダーに追加
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        //fetch：サーバーにデータを取りに行く関数
        //第1引数：URL（ここではSupabaseのFunctionsのURL）
        //第2引数：オプション（メソッド、ヘッダー、ボディ）
        //method：メソッド（ここではPOST）
        //headers：ヘッダー（ここではAuthorizationヘッダーとapikeyヘッダー）
        //body：ボディ（ここではformData）
        //response：サーバーからのレスポンス
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

        //.json()はサーバーなどから帰ってきたJSON文字列をオブジェクトに変換するメソッド
        const result = await response.json();
        console.log("Response data:", result);
        console.log("Text extracted:", result?.text);

        // 無音時のノイズレスポンスを除外
        const noiseResponses = [
          "ご視聴ありがとうございました",
          "Thank you for watching",
        ];

        if (result?.text) {
          const trimmedText = result.text.trim();
          if (trimmedText && !noiseResponses.includes(trimmedText)) {
            aiChoiceStore.setAiWord(trimmedText);
          }
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
    //録音を停止⇒onstop(録音が停止したときに発火する非同期関数)が発火する
    //stop()メソッドで録音は停止するが、マイクは動き続けるので下部のコードで停止する
    mediaRecorderRef.current?.stop();
    //マイクの使用を停止
    //mediaRecorderRef.current?.stream：マイクの使用を停止
    //mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());：マイクの使用を停止
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream
        .getTracks() //stream内の全てのトラック（マイクからの音声データの流れ）
        .forEach((track) => track.stop()); //各トラックを停止⇒マイクの使用を停止
    }
    setRecording(false);
    // オーバーレイが一瞬消えないように、すぐに処理中状態にする
    setIsProcessing(true);
  };

  return (
    <div className="m-0">
      <button onClick={recording ? stopRecording : startRecording}>
        <MicIcon
          className={`size-8 ${recording ? "text-red-500" : "text-green-500"}`}
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
