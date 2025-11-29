import { Link, useNavigate } from "react-router-dom";

interface BackLinkProps {
  className?: string;
  text?: string;
}

export const BackLink = ({ className, text }: BackLinkProps) => {
  const navigate = useNavigate();
  return (
    //#はダミーのURLで、実際にはe.preventDefault()によって遷移しない
    // （ここでは遷移する機能はonClickイベントハンドラで実装する）
    //e.preventDefault()は、デフォルトの動作を防止するためのメソッド
    //ここではデフォルトの動作（ページ遷移）を防止して、onClickイベントハンドラで遷移するようにしている
    //navigate(-1)は、ブラウザの履歴を一つ戻る
    <Link
      to="#"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(-1);
      }}
    >
      {text}
    </Link>
  );
};
