import { atom,useAtom } from "jotai";


const aiWordAtom = atom<string>("")


export const useAiWordStore = () => {
    const [aiWord, setAiWord] = useAtom(aiWordAtom)
    return { aiWord, set: setAiWord }
}