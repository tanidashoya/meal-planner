import { Select, SelectTrigger, SelectValue } from "./ui/select";
import { SelectContent, SelectItem } from "./ui/select";
import { ListIcon } from "lucide-react";
import meatIcon from "../assets/meat.webp";
import fishIcon from "../assets/fish.webp";
import donIcon from "../assets/don.webp";
import menIcon from "../assets/men.webp";
import kozareIcon from "../assets/kozara.webp";
import otherIcon from "../assets/other.webp";

interface SelectCategoryProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  isSelectOpen: boolean;
  setIsSelectOpen: (open: boolean) => void;
  className?: string;
  showAllOption?: boolean;
}

export const SelectCategory = ({
  selectedCategory,
  setSelectedCategory,
  isSelectOpen,
  setIsSelectOpen,
  className,
  showAllOption = false,
}: SelectCategoryProps) => {
  return (
    <div className="flex items-center gap-2.5">
      <Select
        value={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value)}
        open={isSelectOpen}
        onOpenChange={setIsSelectOpen}
      >
        {/* onTouchStart */}
        <SelectTrigger
          className={`${className} bg-gray-100 focus:!outline-none focus-visible:!outline-none focus:!ring-1 focus:!ring-blue-500`}
          onTouchStart={() => {
            // スマホでキーボードが開いている場合は少し遅らせて閉じる
            if (
              document.activeElement &&
              document.activeElement instanceof HTMLElement
            ) {
              // タッチ開始から少し待ってからキーボードを閉じる
              setTimeout(() => {
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
                // キーボードが閉じた後にSelectを開く
                setTimeout(() => {
                  setIsSelectOpen(true);
                }, 200);
              }, 150);
            } else {
              // キーボードが開いていない場合は即座にSelectを開く
              setIsSelectOpen(true);
            }
          }}
        >
          <SelectValue
            placeholder="カテゴリの選択"
            className="focus:outline-none focus:ring-1 focus:!ring-blue-500"
          />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="全てのレシピ" className="text-lg pl-1">
              <ListIcon className="ml-1 h-7 w-7" />
              全てのレシピ
            </SelectItem>
          )}
          <SelectItem value="肉料理" className="text-lg">
            <img src={meatIcon} alt="meat icon" className="h-6 w-6" />
            肉料理
          </SelectItem>
          <SelectItem value="魚料理" className="text-lg">
            <img src={fishIcon} alt="fish icon" className="h-6 w-6" />
            魚料理
          </SelectItem>
          <SelectItem value="丼・ルー料理" className="text-lg">
            <img src={donIcon} alt="dish icon" className="h-6 w-6" />
            丼・ルー料理
          </SelectItem>
          <SelectItem value="麺料理" className="text-lg">
            <img src={menIcon} alt="noodle icon" className="h-6 w-6" />
            麺料理
          </SelectItem>
          <SelectItem value="小物" className="text-lg">
            <img src={kozareIcon} alt="kozare icon" className="h-6 w-6" />
            小物
          </SelectItem>
          <SelectItem value="その他" className="text-lg">
            <img src={otherIcon} alt="other icon" className="h-6 w-6" />
            その他
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
