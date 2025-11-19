import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { useRecipeStore } from "../modules/recipes/recipe.state";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DeleteButtonProps {
  id: number;
  className?: string;
  size?: string;
}

export const DeleteButton = ({ id, className, size }: DeleteButtonProps) => {
  const { currentUser } = useCurrentUserStore();
  const recipesStore = useRecipeStore();
  const deleteRecipe = async () => {
    if (!currentUser) return;
    // recipe.state.ts で既にエラーハンドリングとトースト表示が行われているため、
    // ここでは成功時のトーストのみ表示
    await recipesStore.delete(currentUser.id, id);
    toast.success("レシピを削除しました");
  };

  return (
    <AlertDialog>
      {/* asChild を付けると AlertDialogTrigger 自体は DOM を生成せず、
    子要素（ここでは button）をトリガーとして扱う */}
      <AlertDialogTrigger asChild>
        <button
          className={className}
          //削除ボタンをクリックしたときに実行されるイベントハンドラ
          onClick={(e) => {
            // 親要素のonClickイベントへの伝播を防ぐ
            e.stopPropagation();
          }}
        >
          <Trash2 className={size} />
        </button>
      </AlertDialogTrigger>

      {/* 👇全画面ダイアログ */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は取り消せません。レシピデータは完全に削除されます。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {/* キャンセル（何もしない） */}
          <AlertDialogCancel
            onClick={(e) => {
              // 親要素のonClickイベントへの伝播を防ぐ
              e.stopPropagation();
            }}
          >
            いいえ
          </AlertDialogCancel>

          {/* はい → deleteRecipe を実行 */}
          <AlertDialogAction
            onClick={(e) => {
              // 親要素のonClickイベントへの伝播を防ぐ
              e.stopPropagation();
              deleteRecipe();
            }}
          >
            はい
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
