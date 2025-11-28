// src/pages/Signup.tsx
import { useState } from "react";
import { authRepository } from "../modules/auth/auth.repository";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { signUpSchema } from "../lib/auth";
import { toast } from "react-toastify";
import { ZodError } from "zod";

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  //各フィールドのエラーメッセージを管理するオブジェクト
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const currentUserStore = useCurrentUserStore();
  const navigate = useNavigate();
  //zodによるバリデーションではなく、
  // フォーカスが外れたら確認用パスワードの文字列がパスワードと一致しているかを検証する関数
  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "パスワードが一致しません",
      }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };
  // サインアップボタンをクリックしたらサインアップ処理を実行
  // 型定義されたオブジェクトを定義する
  //error.errorsは配列なのでforEachで一つずつ取り出す
  //err.path[0]はエラーが発生したフィールドのパス(name,email,password,confirmPasswordのいずれか)
  //err.messageはエラーメッセージ
  //fielderrorsオブジェクトにerr.path(nameやpasswordなど)をキーとして
  // エラーが起こったフィールドのエラーメッセージを値としている
  //keyof:右辺のオブジェクト型の“キー名”だけを取り出して union 型にする演算子
  //typeof:右辺にある“実際の変数やオブジェクト”の型を抽出し、その型情報を左側（型システム）で使う
  //✔ as keyof typeof fieldErrors は“実行時の安全”は保証しない
  // ✔ 保証するのは “TypeScript（開発時）に対しての意図だけ”
  // 実行時に間違ったキーが来てもバグになる（TSは止めてくれない）
  // 開発者には「ここは fieldErrors のキーだよ」と意図を示せる
  // TypeScript の型エラーを抑えて通すための宣言
  // ■ では何のために使うのか？
  // ✔ ① コードの意図を明確にし、他の開発者が理解しやすくするため
  // ✔ ② TypeScript の型チェックを無理に通して、開発時の警告を防ぐため
  // ✔ ③（今回のケースなら） Zod が必ず正しいキーを返すので実務上安全（公開したときにはZodで制御されている）
  // エラーを設定
  //fieldErrorsオブジェクトをsetErrors関数に渡してerrors状態オブジェクトを更新
  const handleSignUp = async () => {
    try {
      //「スキーマに値を渡して “正しいかどうか判定してもらっている”」
      //.parseはスキーマに値を流し込んでルールにあっているか検証する
      // 検証成功: 値をそのまま返す（例外は投げない）
      // 検証失敗: ZodErrorを投げる ⇒ 検証失敗した場合はcatchブロックでエラーを処理する
      signUpSchema.parse({ name, email, password, confirmPassword });
      // 検証成功した場合はerrors状態オブジェクトをクリア
      setErrors({});
      //検証で失敗した場合はcatchブロックでエラーを処理する
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const fieldErrors: {
          name?: string;
          email?: string;
          password?: string;
          confirmPassword?: string;
        } = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[
              err.path[0] as "name" | "email" | "password" | "confirmPassword"
            ] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }
    // サインアップ処理
    try {
      setIsLoading(true);
      const user = await authRepository.signup(name, email, password);
      currentUserStore.set(user);
      toast.success("アカウントが作成されました");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "サインアップに失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ログインしている場合はHomeにリダイレクト
  if (currentUserStore.currentUser != null) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] lg:w-screen">
      <span className="text-3xl font-bold mb-4">新規作成</span>
      <div className="flex flex-col items-center justify-center gap-y-1 border border-gray-300 rounded-md p-6 w-[90%] md:w-[480px]">
        {/* 名前 */}
        <div className="flex flex-col justify-center gap-y-2 w-[90%] md:w-96">
          <label className="text-sm font-bold" htmlFor="name">
            名前：
          </label>
          <input
            id="name"
            type="text"
            placeholder="名前を入力"
            value={name}
            onChange={(e) => setName(e.target.value)}
            // エラーがある場合は赤色の枠線になり、フォーカスが当たったら青色の枠線になる
            className={`p-2 border rounded-md w-full focus:outline-none focus:ring-1 ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {/* エラーがある場合（errorsオブジェクトにnameキーがある場合）はエラーメッセージを表示 */}
          {errors.name && (
            <span className="text-sm text-red-500">{errors.name}</span>
          )}
        </div>
        {/* メールアドレス */}
        <div className="flex flex-col justify-center gap-y-2 w-[90%] md:w-96">
          <label className="text-sm font-bold" htmlFor="email">
            Eメールアドレス：
          </label>
          <input
            id="email"
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
          <label className="text-sm font-bold" htmlFor="password">
            パスワード：
          </label>
          <input
            id="password"
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
          <span className="text-xs text-gray-500">
            ※ 6文字以上、英字と数字を含む
          </span>
        </div>
        {/* 確認用パスワード */}
        <div className="flex flex-col justify-center gap-y-2 w-[90%] md:w-96">
          <label className="text-sm font-bold" htmlFor="confirmPassword">
            確認用パスワード：
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="パスワードを再入力"
            onBlur={(e) => validateConfirmPassword(e.target.value)} //フォーカスが外れたら検証
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`p-2 border rounded-md w-full focus:outline-none focus:ring-1 ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-500">
              {errors.confirmPassword}
            </span>
          )}
        </div>
        <button
          // 入力欄がなにも入力されていない場合はボタンを無効化
          disabled={
            !name || !email || !password || !confirmPassword || isLoading
          }
          onClick={handleSignUp}
          className="w-60 p-2 border border-gray-300 rounded-md bg-blue-200 mb-6 mt-6 disabled:bg-gray-100 disabled:!cursor-not-allowed disabled:!border-gray-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <span className="text-base">新規作成</span>
          )}
        </button>
        <span className="text-base">
          アカウントを既にお持ちの方は
          <Link to="/signin">
            <p className="text-center text-base hover:border-b hover:border-blue-300 ml-2 transition-all duration-200 mt-2">
              ログイン画面へ
            </p>
          </Link>
        </span>
      </div>
    </div>
  );
}

//Zodエラーの形
// {
//   errors: [
//     { path: ["email"], message: "正しいメール形式で入力してください" },
//     { path: ["password"], message: "6文字以上で入力してください" }
//   ]
// }
