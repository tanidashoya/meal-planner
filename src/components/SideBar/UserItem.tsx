//サイドバーにユーザー情報とログアウトボタンを実装する
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Item } from "./Item";
import { CheckCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { authRepository } from "@/modules/auth/auth.repository";
import { useCurrentUserStore } from "@/modules/auth/current-user.state";
import { ExtendedUser } from "@/modules/auth/current-user.state";

interface UserItemProps {
    userName:string,
    userEmail:string,
    signout:() => void;
}


export const UserItem = ({userName,userEmail,signout}:UserItemProps) => {

    const [newName,setNewName] = useState(userName);
    const {set} = useCurrentUserStore();
    const handleChangeName = (e:React.ChangeEvent<HTMLInputElement>) => {
        setNewName(e.target.value);
    }

    //名前をUI上でリアルタイムに更新する
    //名前を更新すると同時にグローバルステートも更新する
    const handleUpdateName = async () => {
        const updatedUser = await authRepository.updateName(newName);
        set(updatedUser as ExtendedUser);
        //名前を更新したら一応名前入力欄にも新しい名前を入れる。そもそも入っているが入れておく
        setNewName(updatedUser.userName);
    }


    return(
        <DropdownMenu>
            {/* asChildは子要素をトリガー要素として使用する */}
            {/* role="button"はボタンの役割を持つ要素を指定する */}
            <DropdownMenuTrigger asChild>
                <div role="button" className="cursor-pointer py-4 mt-2 px-4 mb-2 text-xl hover:bg-primary/5">
                    <span>{userName}さんの情報</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="ml-4">
                <div className="flex flex-col px-4 py-2">
                    <div className="flex">
                        <span>Email：</span>
                        <span className="ml-2">{userEmail}</span>
                    </div>
                    <div className="flex mt-2 py-1">
                        <span>Name：</span>
                        <input type="text" value={newName} onChange={handleChangeName} className="pl-1 border border-gray-300 rounded-md bg-white" />
                    </div>
                    <div className="flex py-1 justify-end ">
                        <button onClick={handleUpdateName} className="flex items-center gap-2 p-1 mr-2">
                            <CheckCircle className="w-5 h-5" />
                            <span>名前を更新</span>
                        </button>
                    </div>
                </div>
                {/* Itemコンポーネントを使用してログアウトボタンを実装 */}
                {/* Itemコンポーネントはアイコン、テキスト、機能を渡してボタンを作成するコンポーネント */}
                {/* bg-primary:index.cssで定義されている 。/5:不透明度5％*/}
                {/* {LogOut}これ自体がLucideIcon型のコンポーネントであり、渡し先で使うときには<Icon/>で囲む */}
                <DropdownMenuItem className="border-t hover:bg-primary/5">
                    <Item label="ログアウト" onClick={signout} icon={LogOut}/>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}