export const OutSideSite = () => {
  return (
    <div className="flex flex-col gap-4 items-center justify-center h-full">
      <p className="text-2xl font-bold mb-8 tracking-wider">
        外部サイトへのリンク
      </p>
      <div className="flex flex-col gap-12 items-center justify-center">
        <div className="flex flex-col gap-2 items-center justify-center">
          <h2 className="text-xl font-bold mb-2">★クックパッド</h2>
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
          <h2 className="text-xl font-bold mb-2">★クラシル</h2>
          <a
            href="https://www.kurashiru.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://www.kurashiru.com/assets/widget/kurashiru_banner_l.png"
              alt="クラシル｜料理レシピ動画サービス"
              className="w-[200px] h-[40px] border-0"
            />
          </a>
        </div>
      </div>
    </div>
  );
};
