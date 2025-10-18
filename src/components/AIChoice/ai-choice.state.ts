import { atom,useAtom } from "jotai";


const aiChoiceAtom = atom<{}[]>([])


export const useAiChoiceStore = () => {
    const [aiChoice, setAiChoice] = useAtom(aiChoiceAtom)
    return { aiChoice, set: setAiChoice }
}