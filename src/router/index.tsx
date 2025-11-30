import { Routes, Route } from "react-router-dom";
import { Layout } from "../Layout";
import { Home } from "../pages/Home";
import { RecipeDetail } from "../pages/RecipeDetail";
import { TasteSort } from "../pages/TasteSort";
import { TasteList } from "../pages/TasteList";
import { TimeSort } from "../pages/TimeSort";
import { TimeList } from "../pages/TimeList";
import { Picks } from "../pages/Picks";
import { MatchRecipe } from "../pages/MatchRecipe";
import { OutSideSite } from "../pages/OutSideSite";
import { UnratedRecipes } from "../pages/UnratedRecipes";
import { AllRecipes } from "../pages/AllRecipes";
import { SuggestRecipes } from "../pages/SuggestRecipes";
import { Signup } from "../pages/Signup";
import { Signin } from "../pages/Signin";
import { ProtectedRoute } from "../components/ui/ProtectedRoute";

export const AppRoutes = () => (
  //ProtectedRouteコンポーネントで囲われたコンポーネントは、currentUserがnullの場合はサインインページにリダイレクト

  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          {/* ← 親：先に実行される */}
          <Layout /> {/* ← 子：children として渡される */}
        </ProtectedRoute>
      }
    >
      <Route index element={<Home />} />
      <Route path="/recipes/:id" element={<RecipeDetail />} />
      <Route path="/star-sort" element={<TasteSort />} />
      <Route path="/star-list/:star" element={<TasteList />} />
      <Route path="/time-sort" element={<TimeSort />} />
      <Route path="/time-list/:time" element={<TimeList />} />
      <Route path="/picks" element={<Picks />} />
      <Route path="/match-recipe" element={<MatchRecipe />} />
      <Route path="/outside-site" element={<OutSideSite />} />
      <Route path="/unrated-recipes" element={<UnratedRecipes />} />
      <Route path="/all-recipes" element={<AllRecipes />} />
      <Route path="/suggest-recipes" element={<SuggestRecipes />} />
    </Route>
    <Route path="/signup" element={<Signup />} />
    <Route path="/signin" element={<Signin />} />
  </Routes>
);
