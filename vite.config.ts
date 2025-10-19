/*
Tailwind v4 専用の @tailwindcss/vite プラグイン を使う。
PostCSS 設定不要。@import "tailwindcss"; だけで動く。
一番シンプルで公式が推奨するやり方。
*/

//Vite 設定を型安全に書くための関数
import { defineConfig } from "vite"
//Vite に React を使えるようにする公式プラグイン。
import react from "@vitejs/plugin-react"
//Tailwind を自動的に組み込み、@import "tailwindcss"; が効くようになる。
import tailwindcss from "@tailwindcss/vite"
//Node.js の標準ライブラリ。
//ファイルの場所を絶対パスに変換するために使う。
import { fileURLToPath, URL } from "node:url"


/* plugins → React と Tailwind を Vite に組み込む。
           → これで JSX と Tailwind クラスが使えるようになる。*/

/* resolve.alias
→ パスエイリアス設定。@ を src ディレクトリに対応させる。
→ これで import Header from "@/components/Header" のように短く書ける。 */

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 10000,
    allowedHosts: ["meal-planner-v17f.onrender.com"], // ← ここを追加！
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } // @ → src
  }
})

