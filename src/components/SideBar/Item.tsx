//アイコン＋テキストで何かを実行するようなコンポーネント

import { LucideIcon } from "lucide-react";

//iconをLucideIcon型として定義する
interface ItemProps {
    label:string,
    onClick:() => void,
    icon:LucideIcon
    className?:string
}

//iconをIconという名前にリネームしている
export const Item = (
    {label,onClick,icon:Icon,className}:ItemProps
) => {
    return(
        <div onClick={onClick} className={`text-lg w-full flex items-center cursor-pointer px-4 py-2 ${className ?? ""}`}>
            <Icon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground"/>
            <span>{label}</span>
        </div>
    )
}


/*
Iconのtailwindcss

1.shrink-0
Flexbox の挙動を制御するクラス。
flex-shrink: 0; を指定 → 要素が 縮まない（小さくならない） ようにする。

2. w-[18px] h-[18px]
任意の幅・高さを指定する Tailwind の「任意値」構文。
w-[18px] → width: 18px;
h-[18px] → height: 18px;
→ アイコンを 18×18px に固定。

3. mr-2
右マージンを付ける。
Tailwind の spacing scale で 2 = 0.5rem (8px)。
→ アイコンとテキストの間に 8px の余白。

4. text-muted-foreground
Tailwind の テーマカラー（おそらく shadcn/ui のプリセット）。
color: var(--muted-foreground); のように変換される。
通常はグレーっぽい色が割り当てられていて、目立たない前景色として使う。
*/