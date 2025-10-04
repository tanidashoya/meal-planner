import { useEffect } from "react"
import { picksRepository } from "../modules/picks/picks.repository"

export const Picks = () => {

    useEffect(() => {
        const fetchPicksData = async () => {
            try {
                // 1. ランダムレシピを取得
                const picksResult = await picksRepository.randomPick()
                console.log("picks result:", picksResult)
                
                // 2. 日付レコードを作成
                const daily = await picksRepository.dateCreate()
                console.log("daily:", daily)
                
                
                const picksSave = await picksRepository.picksSave(daily, picksResult)
                console.log("picksSave:", picksSave)
            } catch (error) {
                console.error("Error in fetchPicksData:", error)
            }
        }
        
        fetchPicksData()
    },[])
    
    return (
        <div>
            <h1>Picks</h1>
        </div>
    )
}