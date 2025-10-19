import { SpeechToText } from "./SpeachToText";

interface AiInputProps {
    mode: "free" | "strict";
    setMode: (mode: "free" | "strict") => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    aiWord: string;
    handleClick: () => void;
}


export const AiInput = ({ mode, setMode, handleChange, aiWord, handleClick }: AiInputProps) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">AIによるレシピ探索</h2>
            <div className="border py-6 px-3 rounded-md shadow-md">
                <div className="flex flex-row items-center justify-center">
                    <input type="text" 
                        className="mb-6 w-full p-2 rounded-md border-2 border-gray-300  
                                focus:!outline-none 
                                focus-visible:!outline-none 
                                focus:!ring-1 
                                focus-visible:!ring-1 
                                focus:!ring-blue-500 
                                focus-visible:!ring-blue-500" 
                        placeholder="食べたいご飯を教えてください" 
                        value={aiWord} 
                        onChange={handleChange} 
                    />
                    <SpeechToText />
                </div>
                {/* relative → 子要素である「背景スライダー」を絶対位置で配置できるようにする。
                    inline-flex → 内側に横並びのボタン2つを配置。
                    rounded-full → 全体を丸く。
                    border border-gray-300 bg-white → 枠線と白背景。
                    overflow-hidden → スライダーの角がはみ出さないようにする。⇒子要素がはみ出たら非表示になる 
                    max-w-xs:要素の最大幅を制限する xs(20rem = 320px)*/}
                <div className="relative inline-flex w-full max-w-xs rounded-full border border-gray-300 bg-white overflow-hidden">
                    {/* 背景スライダー */}
                    {/* 「装飾専用（表示目的のみ）」の div */}
                    {/* 選択中のボタンがグレーになる */}
                    {/* transition-property: transform;： 「transform（＝位置・回転・拡大などの変化）をなめらかにアニメーションする」という設定。*/}
                    {/* durationはアニメーションの時間を指定する。300ms = 0.3秒 */}
                    {/* 状態がstrictの場合は右に移動（"translate-x-full"）し、freeの場合は左に移動する */}
                    {/* translate-x-full:要素自身の幅の 100% 移動 */}
                    <div
                        className={`absolute top-0 left-0 h-full w-1/2 bg-gray-500 rounded-full transition-transform duration-300 ${
                        mode === "strict" ? "translate-x-full" : "translate-x-0"
                        }`}
                    ></div>

                    {/* ボタン2つ */}
                    <button
                        onClick={() => setMode("free")}
                        className={`relative w-1/2 z-10 py-2 text-sm font-medium
                        focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 focus:!ring-0 focus:!ring-offset-0
                        ${mode === "free" ? "text-white" : "text-gray-600"}`}
                        >
                        自由モード
                    </button>

                    <button
                        onClick={() => setMode("strict")}
                        className={`relative w-1/2 z-10 py-2 text-sm font-medium
                        focus:!outline-none focus-visible:!outline-none focus-visible:!ring-0 focus:!ring-0 focus:!ring-offset-0
                        ${mode === "strict" ? "text-white" : "text-gray-600"}`}
                    >
                        精密モード
                    </button>
                </div>

                <div className="flex flex-row w-full justify-between mt-2">
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-sm text-blue-500 font-bold">抽象的な検索に強い</span>
                        <span className="text-sm text-gray-500">例：あっさりご飯</span>
                        <span className="text-sm text-gray-500">〇〇に合う副菜</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-sm text-gray-500 text-2xl">⇔</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-sm text-red-500 font-bold">厳密な検索に強い</span>
                        <span className="text-sm text-gray-500">例：「料理名」</span>
                        <span className="text-sm text-gray-500">「材料」を使うレシピ</span>
                    </div>
                </div>
                <div className="flex flex-row gap-4 mt-6 w-full">
                    <button onClick={() => handleClick()} className="w-3/5 mx-auto bg-green-500 text-white px-4 py-2 rounded-md  shadow-md">
                        探索を開始する
                    </button>
                </div>
            </div>
        </div>
    )
}