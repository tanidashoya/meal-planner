import { supabase } from "../../lib/supabase";

//supabaseのsignUpメソッドもsignInWithPasswordメソッドも引数をオブジェクトとして受け取る
//それぞれの引数がキー名の一致するところに入っていく感じ
//サインアップ
//supabaseのconfirm-emailをオフにしたらできました。
//本番環境ではこれをオンにしてメールを送り認証されたらsupabase.auth.signInWithPasswordやsignUpメソッドが無事実行される
//confirm-emailをオフにせずローカル環境でサインインしてたけどメールを受け取ってもconfirm-emailがローカル環境だと認証されないので認証されない。
//だからHomeに遷移できなかったがconfirm-emailをオフにしたら無事に遷移できた。
//名前をuserNameとして返すようにした。
//✅✅✅supabaseは例外としてではなくオブジェクトとしてエラーを返ずため、try-catch文を使うエラーハンドリングはしない
export const authRepository = {


    async signup(name:string,email:string,password:string){
        const {data,error} = await supabase.auth.signUp(
            {
                email,
                password,
                options:{data:{name}}
            }
        )
        if (error != null || data.user == null) {
            throw new Error("サインアップに失敗しました")
        }
        //他の場所でdata.userが使われている場合直接書き換えると挙動がおかしくなる可能性があるのでスプレッド構文で返す
        return {
            ...data.user,
            userName:data.user.user_metadata.name,
            //accessTokenを返す
            accessToken:data.session!.access_token

        }
    },

    /*
        supabaseがsignUpメソッドで返すdataオブジェクトの構造
        {
            user: {
                id: string,
                email: string,
                user_metadata: { name: string },
                // その他多くのプロパティ
            },
            session: Session | null
        }
    */
    

    async signin(email:string,password:string){
        const {data,error} = await supabase.auth.signInWithPassword({email,password})
        if (!data.session) return;
        if (error != null || data.user == null){
            throw new Error("サインインに失敗しました")
        }
        return {
            ...data.user,
            userName:data.user.user_metadata.name,
            //accessTokenを返す
            accessToken:data.session.access_token

        }
    },

    //Supabase のセッションは ブラウザに長期間保存されるので、
    //通常は一度ログインしたら再ログインを求められずに使い続けられる。
    //App.tsxでgetCurrentUserを呼び出してグローバルステートにユーザーデータを格納している。
    async getCurrentUser(){
        const {data,error} = await supabase.auth.getSession()
        if (error !== null){
            throw new Error("ログイン中のユーザー情報の取得に失敗しました")
        }
        //セッションがnullの場合は、ログインしていないのでnullを返す
        if (!data.session) return
        return {
            ...data.session.user,
            userName:data.session.user.user_metadata.name,
            //accessTokenを返す
            accessToken:data.session.access_token
        }
    },


    // try-catch文を使用してエラーを捕捉して処理を停止させないようにする
    // supabase.auth.signOutメソッドが実行できてもtry文の中の条件分岐は判定される
    // catchはsupabase.auth.signOutメソッドでエラーが発生したとき、またはtry文内でthrowされたときに実行される

    async signout(){
      const {error} = await supabase.auth.signOut()
      
      // セッションがない場合は正常扱い（もうすでにログアウトしている場合はエラーが発生する）これは無視して正常終了する
      if (!error || error.message.includes('Auth session missing')) {
          return;
      }
      
      // その他のエラーは投げる
      console.error('ログアウト処理でエラーが発生:', error);
      throw new Error(`ログアウトに失敗しました: ${error.message}`)
  
    },


    //supabase.auth.updateUser() :「ログイン中のユーザーの認証情報（auth.usersテーブルのレコード）」を更新する関数
    //オブジェクトdataのnameにnewNameを代入して更新する
    //更新後のユーザー情報を返す
    //supabase.auth.updateUser({ data: { name: newName } })
    // 引数はオブジェクト { data: {...} }。
    // その中の data プロパティが Supabase の user_metadata に対応しています。
    // つまり「user_metadata.name を newName に更新してください」というリクエストを送っています。
    //App.tsxでgetCurrentUserを呼び出してグローバルステートにユーザーデータを格納している。
    //updateNameメソッドでの返り値はグローバルステートに格納することでユーザー情報をUI上で更新するので
    //⇒getCurrentUserの返り値とupdateNameメソッドの返り値の構造は同じでなければならない
    async updateName(newName:string){
        const {data,error} = await supabase.auth.updateUser({data:{name:newName}})
        if (error != null){
            throw new Error("名前の更新に失敗しました")
        }
        return {
            ...data.user,
            userName:data.user.user_metadata.name
        }
    }
}


/*メモ
dataの構造
{
  "data": {
    "user": {
      "id": "f4a9c9f6-xxxx-xxxx-xxxx-0c0ec5c71a7b",
      "aud": "authenticated",
      "role": "authenticated",
      "email": "test@example.com",
      "email_confirmed_at": "2025-09-27T09:00:00Z",
      "phone": "",
      "confirmed_at": "2025-09-27T09:00:00Z",
      "last_sign_in_at": "2025-09-27T09:05:00Z",
      "app_metadata": {
        "provider": "email",
        "providers": ["email"]
      },
      "user_metadata": {
        "name": "新しい名前"
      },
      "created_at": "2025-08-01T12:00:00Z",
      "updated_at": "2025-09-27T09:05:00Z"
    }
  },
  "error": null
}



更新した後の返り値の例
{
  "id": "f4a9c9f6-xxxx-xxxx-xxxx-0c0ec5c71a7b",
  "aud": "authenticated",
  "role": "authenticated",
  "email": "test@example.com",
  "email_confirmed_at": "2025-09-27T09:00:00Z",
  "phone": "",
  "confirmed_at": "2025-09-27T09:00:00Z",
  "last_sign_in_at": "2025-09-27T09:05:00Z",
  "app_metadata": {
    "provider": "email",
    "providers": ["email"]
  },
  "user_metadata": {
    "name": "新しい名前"
  },
  "created_at": "2025-08-01T12:00:00Z",
  "updated_at": "2025-09-27T09:05:00Z",

  "userName": "新しい名前"   // ← ここを自分で追加した
}

supabase.auth.getSession() が返す data.session は、以下のような構造
{
  access_token: string,       // JWT (Edge Function呼び出しに必要)
  token_type: "bearer",       // 常に "bearer"
  expires_in: number,         // 有効期限(秒)
  expires_at: number,         // UNIXタイムスタンプで有効期限
  refresh_token: string,      // リフレッシュ用トークン
  user: {
    id: string,               // ユーザーID (UUID)
    aud: string,              // "authenticated"
    role: string,             // "authenticated"
    email: string,            // ユーザーのメールアドレス
    email_confirmed_at: string, // メール認証済みの日時
    phone: string | null,     // 電話番号 (未使用なら null)
    app_metadata: {           // Supabase内部のメタ情報
      provider: "email" | "google" | ...,
      providers: string[]
    },
    user_metadata: {          // signup時に追加したカスタム情報
      name?: string,
      avatar_url?: string,
      ...
    },
    created_at: string,       // 作成日時
    updated_at: string        // 更新日時
  }
}




*/