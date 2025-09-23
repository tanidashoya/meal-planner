import { useState } from "react";
import { authRepository } from "../modules/auth/auth.repository";
import { useCurrentUserStore } from "../modules/auth/current-user.state";
import { Link, Navigate } from "react-router-dom";

export function Signup(){

    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const currentUserStore = useCurrentUserStore();


    const handleSignUp = async (name:string,email:string,password:string) => {
        const user = await authRepository.signup(name,email,password);
        currentUserStore.set(user);
    }

    if (currentUserStore.currentUser != null) {
        return <Navigate replace to="/" />;
    }

    return(
        <div className="flex flex-col items-center justify-center h-[100dvh] lg:w-screen">
            <span className="text-4xl font-bold mb-8">新規作成</span>
            <div className="flex flex-col items-center justify-center gap-y-2 border border-gray-300 rounded-md p-6 w-9/10 md:w-120">
                <div className="flex flex-col justify-center gap-y-2 w-9/10 md:w-96">
                    <span className="text-lg">名前：</span>
                    <input 
                        type="name" 
                        placeholder="名前を入力" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    />
                </div>
                <div className="flex flex-col justify-center gap-y-2 w-9/10 md:w-96">
                    <span className="text-lg">Eメールアドレス：</span>
                    <input 
                        type="email" 
                        placeholder="メールアドレスを入力" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-col justify-center gap-y-2 w-9/10 md:w-96">
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
                    disabled={!name || !email || !password} 
                    onClick={() => handleSignUp(name,email,password)} 
                    className="w-60 p-2 border border-gray-300 rounded-md bg-blue-200 mb-6 mt-6 disabled:bg-gray-100 disabled:!cursor-not-allowed disabled:!border-gray-200"
                >
                    <span className="text-lg">新規作成</span>
                </button>
                <span className="text-lg">アカウントを既にお持ちの方は
                    <Link to="/signin">
                        <p className="text-center text-lg hover:border-b-1 hover:border-blue-300 ml-2 transition-all duration-200 mt-2">ログイン</p>
                    </Link>
                </span>
            </div>
        </div>
    )
}