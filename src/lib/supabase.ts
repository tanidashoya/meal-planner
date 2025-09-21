import { createClient } from '@supabase/supabase-js';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Recipe } from '@/modules/recipes/recipe.entity';
import { RealtimeChannel } from '@supabase/supabase-js';


//import.meta.env の役割    
// Vite がビルドするとき、.env にある値を読み込みます。
// そのうち VITE_ で始まるものだけを import.meta.env に展開して、JavaScript の中で使えるようにします。]

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_API_KEY
)

//リアルタイム通信
//.channel("notes-changes") チャンネル名を指定（任意の文字列）※複数のリアルタイム接続を識別するために設定
//.on:どのイベントを監視するかを定義。イベントリスナーを登録するメソッド。「〜が起きた時に、この処理を実行して」という指示を出すもの
//onの第一引数:postgres_changes: PostgreSQLデータベースの変更イベント（データベースに変更があるかを監視するイベント）
//onの第二引数: データベースの変更イベントの監視条件を細かく指定する設定オブジェク
//onの第三引数: 監視対象のイベントが発生した時に実行するコールバック関数
//今回の例ではcallback関数にはeventの種類に応じてグローバルステートnoteStoreのデータを更新する関数を渡している
//.subscribe():チャンネルを実際に購読（監視）開始するメソッド
//呼び出しもとにRealtimeChannel オブジェクトが返される
//第二引数での変更条件の部分に変更が起こった場合、第三引数のcallback関数に変更情報が引数payloadに渡される
//onの第二引数で指定したテーブルの場所で指定したイベントが発生したら第三引数で渡されているcallbackの第一引数にpayloadが渡される
export const subscribe = (
    userId:string, 
    callback:(payload:RealtimePostgresChangesPayload<Recipe>)=>void
) => {
    return supabase
        .channel('recipes-changes')
        .on<Recipe>('postgres_changes', 
        {
            event:'*',
            schema:'public',
            table:'recipes',
            filter:`user_id=eq.${userId}`
        },
        callback
        )
        .subscribe();
    };

export const unsubscribe = (channel:RealtimeChannel) => {
    supabase.removeChannel(channel);
};
