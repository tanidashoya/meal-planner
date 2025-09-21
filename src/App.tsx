import { BrowserRouter,Routes,Route } from "react-router-dom"
import { Layout } from "./Layout"
import { Home } from "./pages/Home"
import { Signup } from "./pages/Signup"
import {Signin} from "./pages/Signin"
import { authRepository } from "./modules/auth/auth.repository"
import { useEffect, useState } from "react"
import { useCurrentUserStore } from "./modules/auth/current-user.state"
import { RecipeDetail } from "./pages/RecipeDetail"


function App() {
  const [isLoading,setIsLoading] = useState(true)
  const currentUserStore = useCurrentUserStore();

  const fetchCrrentUser = async() => {
    const currentUser = await authRepository.getCurrentUser()
    currentUserStore.set(currentUser!)
    setIsLoading(false)
  }

  useEffect(() => {
      fetchCrrentUser()
  },[])


  //ローディング中は何も表示しない
  if (isLoading){
    return <div/>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Home/>}/>
          <Route path="/recipes/:id" element={<RecipeDetail/>}/>
        </Route>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/signin" element={<Signin/>}/>
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
