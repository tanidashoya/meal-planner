// src/pages/Signin.tsx
import { useState } from "react";
import { authRepository } from "../modules/auth/auth.repository";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { signInSchema } from "../lib/auth";
import { toast } from "react-toastify";
import { ZodError } from "zod";
export function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const currentUserStore = useCurrentUserStore();
  const navigate = useNavigate();
  //入力欄の値をそれぞれスキーマに渡してバリデーションを行う
  //バリデーションに失敗した場合はcatchブロックで空のオブジェクトを定義して
  //エラーが起こったフィールドのエラーメッセージを値としている
  //そのオブジェクトをsetErrors関数に渡してerrors状態オブジェクトを更新する
  const handleSignIn = async () => {
    // 送信前の全体バリデーション
    //.parse()に渡すオブジェクトのキー名が、スキーマで定義されたキーと一致する必要がある
    try {
      signInSchema.parse({ email, password });
      setErrors({});
      //catch説でのエラーはunknown型で受け取るのが一般的
      //様々なエラーが入ってくる可能性があるからunknown型としておくのがいい
      //any:型チェックを“完全にオフ”にする危険スイッチ(TypeScriptの型チェックを完全に無視する)
      //unknown:型チェックを“部分的にオフ”にする安全スイッチ(TypeScriptの型チェックを部分的に無視する)
    } catch (error: unknown) {
      //unknown型を使った場合は型ガードしないとアクセスできない（unknownの場合型ガード必須）
      //instanceof演算子はオブジェクトの型を判定する演算子
      //ZodError型かどうかを判定する
      if (error instanceof ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as "email" | "password"] = err.message;
          }
        });
        setErrors(fieldErrors);
        //ここでreturnすることでログイン処理が実行されないようにする
        return;
      }
    }
    // ログイン処理
    try {
      setIsLoading(true);
      const user = await authRepository.signin(email, password);
      currentUserStore.set(user);
      toast.success("ログインに成功しました");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ログインに失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  };
  if (currentUserStore.currentUser != null) {
    return <Navigate replace to="/" />;
  }
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] lg:w-screen">
      <span className="text-4xl font-bold mb-8">ログイン</span>
      <div className="flex flex-col items-center justify-center gap-y-2 border border-gray-300 rounded-md p-6 w-[90%] md:w-[480px]">
        {/* メールアドレス */}
        <div className="flex flex-col justify-center gap-y-2 w-[90%] md:w-96">
          <span className="text-base font-bold">Eメールアドレス：</span>
          <input
            type="email"
            placeholder="メールアドレスを入力"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`p-2 border rounded-md w-full focus:outline-none focus:ring-1 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.email && (
            <span className="text-sm text-red-500">{errors.email}</span>
          )}
        </div>
        {/* パスワード */}
        <div className="flex flex-col justify-center gap-y-2 w-[90%] md:w-96">
          <span className="text-base font-bold">パスワード：</span>
          <input
            type="password"
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`p-2 border rounded-md w-full focus:outline-none focus:ring-1 ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.password && (
            <span className="text-sm text-red-500">{errors.password}</span>
          )}
        </div>
        <button
          disabled={
            !email || !password || isLoading || Object.keys(errors).length > 0
          }
          onClick={handleSignIn}
          className="w-60 p-2 border border-gray-300 rounded-md bg-blue-200 mb-8 mt-8 disabled:bg-gray-100 disabled:!cursor-not-allowed disabled:!border-gray-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <span className="text-base">ログイン</span>
          )}
        </button>
        <span className="text-base">
          アカウントをお持ちでない方は
          <Link to="/signup">
            <p className="text-center text-base hover:border-b hover:border-blue-300 ml-2 transition-all duration-200 mt-2">
              アカウントを新規作成
            </p>
          </Link>
        </span>
        {/* パスワードリセットへのリンク（機能2で実装） */}
        {/* <Link to="/reset-password">
          <p className="text-sm text-blue-600 hover:underline mt-2">
            パスワードをお忘れの方
          </p>
        </Link> */}
      </div>
    </div>
  );
}
