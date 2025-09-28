import { Recipe } from "../../modules/recipes/recipe.entity";
import { Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";


interface RatingItemProps {
    recipes: Recipe[];
}

export const RatingItem = ({recipes}:RatingItemProps) => {


    const navigate = useNavigate();

    const moveToDetail = (id: number) => {
        navigate(`/recipes/${id}`);
    }


    return (
        
        <div>
            {recipes.length === 0 && (
                <div className="font-['Inter'] text-center text-gray-400 text-base lg:text-2xl mb-5 lg:mb-8">
                    レシピがありません
                </div>
            )}
            {recipes.map((recipe,index) => {
                return (
                    <div key={index} 
                    className="flex gap-4 lg:gap-6 justify-center items-center mb-5 lg:mb-8 cursor-pointer" 
                    onClick={() => moveToDetail(recipe.id)}
                    >
                        <Utensils className="w-5 h-5 lg:w-7 lg:h-7 fill-gray-200 text-gray-400" strokeWidth={1.0} />
                        <h3 className="font-['Inter'] text-lg lg:text-2xl text-gray-700">{recipe.title}</h3>
                        {/* <a href={recipe.source || ""} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-lg">
                            {recipe.source}
                        </a> */}
                        {/* <div className="flex items-center gap-2">
                            <Star className="lg:w-7 lg:h-7 w-6 h-6 fill-yellow-200 text-gray-400" strokeWidth={1.0} />
                            <span className="text-xl">{recipe.rating}</span>
                        </div> */}
                    </div>
                )
            })}
        </div>
    )

}
