import { atom,useAtom } from "jotai";
import { aiChoice } from "./aichoice.entity";


//AI結果をグローバルステートに保管
export const aiChoiceAtom = atom<aiChoice[]>([])
//AI結果の読み込み中をグローバルステートに保管
export const aiSearchLoadingAtom = atom(false);
//AI結果の読み込みエラーをグローバルステートに保管
export const aiSearchErrorAtom = atom<string | null>(null);
//AI結果の読み込みが完了したかどうかをグローバルステートに保管
export const aiHasSearchedAtom = atom(false);
//AI検索ワードをグローバルステートに保管
export const aiWordAtom = atom<string>("")


export const useAiChoiceStore = () => {
    const [aiChoice, setAiChoice] = useAtom(aiChoiceAtom)
    const [aiSearchLoading, setAiSearchLoading] = useAtom(aiSearchLoadingAtom)
    const [aiSearchError, setAiSearchError] = useAtom(aiSearchErrorAtom)
    const [HasSearched, setHasSearched] = useAtom(aiHasSearchedAtom)
    const [aiWord, setAiWord] = useAtom(aiWordAtom)
    return { 
        aiChoice, 
        set: setAiChoice, 
        aiSearchLoading, 
        setAiSearchLoading, 
        aiSearchError, 
        setAiSearchError, 
        HasSearched, 
        setHasSearched,
        aiWord,
        setAiWord }
}