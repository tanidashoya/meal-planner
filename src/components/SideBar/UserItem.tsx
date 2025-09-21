//サイドバーにユーザー情報とログアウトボタンを実装する
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Item } from "./Item";
import { LogOut } from "lucide-react";

interface UserItemProps {
    userName:string,
    userEmail:string,
    signout:() => void;
}


export const UserItem = ({userName,userEmail,signout}:UserItemProps) => {

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
                    <span>Email：{userEmail}</span>
                    <span>Name：{userName}</span>
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