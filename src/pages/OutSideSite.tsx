import kuraIcon from "../assets/kura_icon.webp";

export const OutSideSite = () => {
  return (
    <div className="flex flex-col gap-4 items-center justify-center h-full">
      <p className="text-2xl font-bold mb-8 tracking-wider">
        外部サイトでレシピを探す
      </p>
      <div className="flex flex-col gap-10 items-center justify-center">
        <div className="flex flex-col gap-2 items-center justify-center">
          {/* <h2 className="text-xl font-bold mb-2">★クックパッド</h2> */}
          <a
            href="https://cookpad.com/?utm_source=link_banner&utm_medium=link_banner&utm_content=bnr200x40"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://cookpad.com/assets/widget/cookpad_banner_l.png"
              alt="レシピ検索No.1 料理レシピ載せるなら クックパッド"
              className="w-[200px] h-[40px] border-0"
            />
          </a>
        </div>
        <div className="flex flex-col gap-2 items-center justify-center">
          {/* <h2 className="text-xl font-bold mb-2">★クラシル</h2> */}
          <a
            href="https://www.kurashiru.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="w-[200px] h-[40px] border border-gray-300 rounded-md flex items-center justify-center">
              <img
                src={kuraIcon}
                alt="クラシル｜料理レシピ動画サービス"
                className=" border-0 size-12"
              />
              <span className="text-lg font-bold text-gray-600">クラシル</span>
            </div>
          </a>
        </div>
        <div className="flex flex-col gap-2 items-center justify-center">
          {/* <h2 className="text-xl font-bold mb-2">★デリッシュキッチン</h2> */}
          <a
            href="https://delishkitchen.tv"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="w-[200px] h-[40px] border border-gray-300 rounded-md flex items-center justify-center">
              <span className="text-lg font-bold text-yellow-600">
                デリッシュキッチン
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
