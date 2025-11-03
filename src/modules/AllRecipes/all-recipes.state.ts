import { atom, useAtom } from "jotai";

const selectedCategoryAtom = atom<string>("全てのレシピ");
const searchTextAtom = atom<string>("");
const isSelectOpenAtom = atom<boolean>(false);

export const useAllRecipesStore = () => {
  const [selectedCategory, setSelectedCategory] = useAtom(selectedCategoryAtom);
  const [searchText, setSearchText] = useAtom(searchTextAtom);
  const [isSelectOpen, setIsSelectOpen] = useAtom(isSelectOpenAtom);
  return {
    selectedCategory,
    setSelectedCategory,
    searchText,
    setSearchText,
    isSelectOpen,
    setIsSelectOpen,
  };
};
