import { SearchRecipeResult } from "../../modules/aiChoice/aichoice.entity";
import { motion } from "framer-motion";
import { ImageOgp } from "../ImageOgp";
import { Check } from "lucide-react";
import ArrowRight from "../../assets/arrow_right.png";
import { Plus } from "lucide-react";
import downArrow from "../../assets/down_arrow.png";

type MatchRecipeParams = {
  id: string;
  title_original: string;
  title_core: string | null;
  url: string | null;
  category: string | null;
};

interface AiResultProps {
  aiChoice: SearchRecipeResult[];
  isAddingRecipe: { [id: string | number]: boolean };
  addRecipeToMyRecipe: (params: MatchRecipeParams) => void;
  hasSearched: boolean;
  isLoading: boolean;
}

export const AiResult = ({
  aiChoice,
  isAddingRecipe,
  addRecipeToMyRecipe,
  hasSearched,
  isLoading,
}: AiResultProps) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* aiChoiceが配列であり、かつ要素が0より大きい場合は以下のモーションを表示 */}
      {Array.isArray(aiChoice) && aiChoice.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 10 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-row justify-center items-center mt-4 mb-12 gap-2">
            <p className="text-gray-500 text-center font-bold text-lg ">
              こんなレシピはどう？(全{aiChoice.length}件)
            </p>
            <img
              src={downArrow}
              alt="down arrow"
              className="w-8 h-8 animate-pulse"
            />
          </div>
          {aiChoice.map((recipe: SearchRecipeResult, index: number) => (
            <div key={recipe.id}>
              <motion.a
                href={recipe.url || ""}
                target="_blank"
                rel="noopener noreferrer"
                //initialはmotion.aが表示される前の最初の状態を指定
                initial={{ opacity: 0, filter: "blur(8px)" }} // 最初は完全に透明＋ぼかし⇒opacity:0は透明、filter: "blur(8px)"は8px分のぼかし
                //animateはmotion.aが表示される際の状態を指定
                animate={{
                  opacity: [0, 0.5, 1],
                  filter: ["blur(8px)", "blur(2px)", "blur(0px)"],
                }} // 徐々にクリアに⇒opacity: [0, 0.5, 1]は透明から0.5まで徐々に表示、filter: ["blur(8px)", "blur(2px)", "blur(0px)"]は8px分のぼかしから2px分のぼかし、0px分のぼかしに徐々に変化
                //transition:アニメーションの時間的な動き方を設定
                //delay:アニメーションの遅延時間を設定
                //duration:アニメーションの持続時間を設定
                //ease:アニメーションのイージングを設定
                //initial⇒animateの状態変化をどのようにするかを設定
                transition={{
                  delay: 0.3, // 1つずつ少し遅れて出る（delayはアニメーションが始まるまでの待機時間）
                  duration: 0.8, // アニメーションの持続時間(initial → animate への変化にかかる時間)
                  ease: [0.22, 1, 0.36, 1], // ゆっくり自然なカーブ(easeはアニメーションの速度カーブ)
                }}
                className="block"
              >
                <div className="flex flex-row mb-1">
                  <span className="text-sm text-gray-700 break-all font-bold">
                    {index + 1}．{recipe.title_original || recipe.title}
                  </span>
                </div>

                <div className="flex flex-row gap-2 border p-2 rounded-md justify-center items-center">
                  <ImageOgp url={recipe.url || ""} className="w-[148px]" />
                  <div className="flex flex-1 flex-col gap-1 w-1/2">
                    <span className="text-sm bleak-all text-gray-500">
                      {recipe.title_original || recipe.title}
                    </span>
                    <span className="text-sm truncate text-blue-500 font-medium">
                      {recipe.url}
                    </span>
                  </div>
                </div>
              </motion.a>
              <motion.div
                initial={{ opacity: 0, filter: "blur(8px)" }} // 最初は完全に透明＋ぼかし
                animate={{
                  opacity: [0, 0.5, 1],
                  filter: ["blur(8px)", "blur(2px)", "blur(0px)"],
                }} // 徐々にクリアに
                transition={{
                  delay: 0.3, // 1つずつ少し遅れて出る
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1], // ゆっくり自然なカーブ
                }}
                className="flex justify-end mt-2 mb-4"
              >
                {isAddingRecipe[recipe.id] ? (
                  <div className="flex items-center gap-1 bg-secondary-500 rounded-md px-4 py-2">
                    <Check className="h-4 w-4 text-white-500" />
                    <span className=" text-sm">追加しました</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mb-4">
                    <img
                      src={ArrowRight}
                      alt="arrow-right"
                      className="w-6 h-6 mr-2 opacity-60"
                    />
                    <button
                      onClick={() =>
                        addRecipeToMyRecipe({
                          id: recipe.id.toString(),
                          title_original:
                            recipe.title_original || recipe.title || "",
                          title_core: recipe.title_core || recipe.title || null,
                          url: recipe.url || null,
                          category: recipe.category || null,
                        })
                      }
                      className="flex items-center gap-1 bg-green-400 text-white px-1 py-2 mr-4 rounded-md"
                    >
                      <div className="flex items-center gap-1">
                        <Plus className="h-4 w-4 text-white-500" />
                        <span className="text-white text-sm">
                          Myレシピに追加
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          ))}
        </motion.div>
      ) : hasSearched ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-gray-500 text-center font-bold text-xl mt-8 mb-6">
            レシピが見つかりませんでした
          </p>
        </motion.div>
      ) : (
        isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="animate-pulse text-sm text-gray-500 text-center font-bold text-xl mt-4 mb-2">
              AIが検索中...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </motion.div>
        )
      )}
    </div>
  );
};
