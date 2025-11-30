import { Navigate } from "react-router-dom";
import { useCurrentUserStore } from "../../modules/auth/current-user.state";

type Props = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: Props) => {
  const { currentUser } = useCurrentUserStore();

  // 未認証の場合はサインインページにリダイレクト
  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>;
};
