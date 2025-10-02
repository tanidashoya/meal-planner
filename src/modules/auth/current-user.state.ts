import { atom, useAtom } from "jotai";
import { User } from "@supabase/supabase-js";

//signinやsignupメソッドでuserName:data.user.user_metadata.nameとしてuserNameを追加している
//それをExtendedUser型としてUserNameを追加している
type ExtendedUser = User & {
    userName: string;
    accessToken: string;
  };
//atomの作成
//グローバルステートを格納するための箱を作っている
// サインインしていない状態が自然に表現できるので、ほとんどのケースでは型を<User | null>として初期値をnullとする
const currentUserAtom = atom<ExtendedUser | null>(null)


//先ほど作った箱を使用するためのカスタムフックを作成
export const useCurrentUserStore = () => {
    const [currentUser, setCurrentUser] = useAtom(currentUserAtom)
    return {currentUser, set:setCurrentUser}
}