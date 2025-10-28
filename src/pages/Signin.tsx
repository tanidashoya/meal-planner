import { useState } from "react";
import { authRepository } from "../modules/auth/auth.repository";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { Link, Navigate } from "react-router-dom";

export function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const currentUserStore = useCurrentUserStore();
  // const navigate = useNavigate();

  const handleSignIn = async () => {
    const user = await authRepository.signin(email, password);
    currentUserStore.set(user);
    console.log(user);
  };

  if (currentUserStore.currentUser != null) {
    return <Navigate replace to="/" />;
  }

  //classNameの!はimportantを意味する(詳細度を高める⇒CSSの優先度を高める)
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] lg:w-screen">
      <span className="text-4xl font-bold mb-8">ログイン</span>
      <div className="flex flex-col items-center justify-center gap-y-2 border border-gray-300 rounded-md p-6 w-[90%] md:w-[480px]">
        <div className="flex flex-col justify-center gap-y-2 w-[90%] md:w-96">
          <span className="text-lg">Eメールアドレス：</span>
          <input
            type="email"
            placeholder="メールアドレスを入力"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col justify-center gap-y-2 w-[90%] md:w-96">
          <span className="text-lg">パスワード：</span>
          <input
            type="password"
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          disabled={!email || !password}
          onClick={handleSignIn}
          className="w-60 p-2 border border-gray-300 rounded-md bg-blue-200 mb-8 mt-8 disabled:bg-gray-100 disabled:!cursor-not-allowed disabled:!border-gray-200"
        >
          <span className="text-lg">ログイン</span>
        </button>
        <span className="text-lg">
          アカウントをお持ちでない方は
          <Link to="/signup">
            <span className="text-center text-lg hover:border-b hover:border-blue-300 ml-2 transition-all duration-200 mt-2">
              アカウントを新規作成
            </span>
          </Link>
        </span>
      </div>
    </div>
  );
}
