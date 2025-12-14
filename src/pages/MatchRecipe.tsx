import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";
import { useAiChoiceStore } from "../modules/aiChoice/ai-choice.state";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { useRecipeStore } from "../modules/recipes/recipe.state";
import { recipeRepository } from "../modules/recipes/recipe.repository";
import { AiResult } from "../components/AIChoice/AiResult";
import { AiInput } from "../components/AIChoice/AiInput";
import { SearchRecipeResult } from "../modules/aiChoice/aichoice.entity";

export const MatchRecipe = () => {
  const { currentUser } = useCurrentUserStore();
  const recipeStore = useRecipeStore();
  //追加したレシピかの判定に使う
  const [isAddingRecipe, setIsAddingRecipe] = useState<{
    [id: string | number]: boolean;
  }>({});
  const aiChoiceStore = useAiChoiceStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    aiChoiceStore.setAiWord(e.target.value);
  };

  const handleRecipesSearch = async (text: string) => {
    aiChoiceStore.setAiSearchLoading(true);
    //ai結果の読み込みが完了したかを判定する状態
    aiChoiceStore.setHasSearched(false);
    aiChoiceStore.set([]);
    const { data, error } = await supabase.functions.invoke("recipes-search", {
      body: { query: text },
    });
    if (error) {
      console.error("レシピ検索に失敗", error.message);
      toast.error("レシピ検索に失敗");
    } else {
      toast.success("レシピ検索が完了");
    }
    //ai結果をグローバルステートに保管
    //dataはSearchRecipeResult型の配列
    //export type SearchRecipeResult = {
    //   id: number | string;
    //   title?: string | null;
    //   title_original?: string | null;
    //   title_core?: string | null;
    //   url?: string | null;
    //   category?: string | null;
    // };
    aiChoiceStore.set(data);
    //ai結果の読み込みが完了したかを判定する状態をtrueにする
    aiChoiceStore.setHasSearched(true);
    //ai結果の読み込み中をグローバルステートに保管
    aiChoiceStore.setAiSearchLoading(false);
  };

  const handleClick = () => {
    if (!aiChoiceStore.aiWord) {
      toast.warn("検索ワードを入力してください");
      return;
    }
    handleRecipesSearch(aiChoiceStore.aiWord);
  };

  const addRecipeToMyRecipe = async (params: SearchRecipeResult) => {
    //idがnullやundefinedの場合は早期return
    if (!params.id) {
      toast.error("レシピIDが見つかりません");
      return;
    }
    if (!currentUser) {
      toast.error("ユーザーが正しく認証されていません");
      return;
    }
    //isAddingRecipeのidをキーにしてtrueにする
    //追加しましたの判断で使う
    setIsAddingRecipe({ ...isAddingRecipe, [params.id]: true });
    try {
      const recipe = await recipeRepository.create(currentUser.id, {
        title: params.title_original ?? "", //各値をリネームして渡している
        category: params.category ?? "", //nullの可能性があるため、?? ""としている
        source: params.url ?? "", //nullの可能性があるため、?? ""としている
      });
      if (recipe == null) return;
      recipeStore.set([recipe]);
      toast.success("レシピの追加に成功しました");
    } catch (error) {
      // エラー時のローディング状態（setIsAddingRecipe）をリセット（必須）
      //追加失敗時にisAddingRecipeのidをキーにしてfalseにする
      setIsAddingRecipe((prev) => {
        const newState = { ...prev };
        if (params.id !== undefined) {
          delete newState[params.id as string | number]; // 追加中レシピを格納するオブジェクトから追加失敗時にレシピIDのキーを削除して元の【Myレシピに追加】ボタンを表示させる
        }
        return newState;
      });

      // Errorオブジェクトからメッセージを抽出してトースト表示
      // error instanceof Error は、error が Error オブジェクトかどうかをチェックする
      const message =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 mb-24 mt-18 ">
      <AiInput
        handleChange={handleChange}
        aiWord={aiChoiceStore.aiWord}
        handleClick={handleClick}
      />
      <AiResult
        aiChoice={aiChoiceStore.aiChoice}
        isAddingRecipe={isAddingRecipe}
        addRecipeToMyRecipe={addRecipeToMyRecipe}
        hasSearched={aiChoiceStore.HasSearched}
        isLoading={aiChoiceStore.aiSearchLoading}
      />
    </div>
  );
};
