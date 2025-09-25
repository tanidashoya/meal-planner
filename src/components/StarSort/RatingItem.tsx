import { Recipe } from "../../modules/recipes/recipe.entity";
import { Star } from "lucide-react";
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
            {recipes.map((recipe,index) => {
                return (
                    <div key={index} className="flex gap-10 justify-center items-center mb-6 cursor-pointer" onClick={() => moveToDetail(recipe.id)}>
                        <h3 className="text-2xl">{recipe.title}</h3>
                        {/* <a href={recipe.source || ""} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-lg">
                            {recipe.source}
                        </a> */}
                        <div className="flex items-center gap-2">
                            <Star className="w-7 h-7 fill-yellow-200 text-gray-400" strokeWidth={1.0} />
                            <span className="text-xl">{recipe.rating}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )

}
