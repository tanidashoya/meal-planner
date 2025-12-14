import { SpeechToText } from "./SpeechToText";
import aiIcon from "../../assets/ai_search.png";
import { motion } from "framer-motion";

interface AiInputProps {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  aiWord: string;
  handleClick: () => void;
}

export const AiInput = ({
  handleChange,
  aiWord,
  handleClick,
}: AiInputProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center mt-[-12px]">
      <motion.img
        src={aiIcon}
        alt="ai icon"
        className="h-28 m-auto"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 3, // 1往復にかかる時間
          repeat: Infinity, // 永久に繰り返す
          repeatType: "mirror", //アニメーションが往復する（行って戻る）
          ease: "easeInOut", // ゆっくり往復
        }}
      />
      <span className="text-base font-medium text-center w-full text-gray-500 mt-2">
        検索ワードを入力してください！
      </span>
      <div className="py-5 px-3 rounded-md border-2 border-gray-300 mt-3 ">
        <div className="flex flex-row items-center justify-center mb-4 gap-1">
          <input
            type="text"
            className="w-full p-2 rounded-md border-2 border-gray-300  
                                focus:!outline-none 
                                focus-visible:!outline-none 
                                focus:!ring-1 
                                focus-visible:!ring-1 
                                focus:!ring-blue-500 
                                focus-visible:!ring-blue-500"
            placeholder="（例：レシピ名、材料）"
            value={aiWord}
            onChange={handleChange}
          />
          <SpeechToText />
        </div>
        <div className="flex flex-row gap-4 mt-4 w-full">
          <button
            onClick={() => handleClick()}
            className="w-3/5 mx-auto bg-green-500 text-white px-4 py-2 rounded-md  shadow-md"
          >
            検索を開始
          </button>
        </div>
      </div>
    </div>
  );
};
