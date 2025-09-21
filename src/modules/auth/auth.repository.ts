import { supabase } from "../../lib/supabase";

//supabaseのsignUpメソッドもsignInWithPasswordメソッドも引数をオブジェクトとして受け取る
//それぞれの引数がキー名の一致するところに入っていく感じ
//サインアップ
//supabaseのconfirm-emailをオフにしたらできました。
//本番環境ではこれをオンにしてメールを送り認証されたらsupabase.auth.signInWithPasswordやsignUpメソッドが無事実行される
//confirm-emailをオフにせずローカル環境でサインインしてたけどメールを受け取ってもconfirm-emailがローカル環境だと認証されないので認証されない。
//だからHomeに遷移できなかったがconfirm-emailをオフにしたら無事に遷移できた。
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
            throw new Error(error?.message)
        }
        //他の場所でdata.userが使われている場合直接書き換えると挙動がおかしくなる可能性があるのでスプレッド構文で返す
        return {
            ...data.user,
            userName:data.user.user_metadata.name
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
        if (error != null || data.user == null){
            throw new Error(error?.message)
        }
        return {
            ...data.user,
            userName:data.user.user_metadata.name
        }
    },


    async getCurrentUser(){
        const {data,error} = await supabase.auth.getSession()
        if (error !== null){
            throw new Error(error?.message)
        }
        //セッションがnullの場合は、ログインしていないのでnullを返す
        if (data.session == null){
            return null
        }
        return {
            ...data.session!.user,
            userName:data.session!.user.user_metadata.name
        }
    },

    async signout(){
        const {error} = await supabase.auth.signOut()
        if (error != null){
            throw new Error(error?.message)
        }
    }
}
