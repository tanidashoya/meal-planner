import meatIcon from "../assets/meat.webp";
import fishIcon from "../assets/fish.webp";
import donIcon from "../assets/don.webp";
import menIcon from "../assets/men.webp";
import kozareIcon from "../assets/kozara.webp";
import otherIcon from "../assets/other.webp";

interface RecipeIconProps {
  category: string;
}

export const RecipeIcon = ({ category }: RecipeIconProps) => {
  return (
    <div>
      {category === "肉料理" && (
        <img src={meatIcon} alt="meat icon" className="w-7 h-7 lg:w-7 lg:h-7" />
      )}
      {category === "魚料理" && (
        <img src={fishIcon} alt="fish icon" className="w-7 h-7 lg:w-7 lg:h-7" />
      )}
      {category === "丼・ルー料理" && (
        <img src={donIcon} alt="dish icon" className="w-7 h-7 lg:w-7 lg:h-7" />
      )}
      {category === "麺料理" && (
        <img
          src={menIcon}
          alt="noodle icon"
          className="w-7 h-7 lg:w-7 lg:h-7"
        />
      )}
      {category === "小物" && (
        <img
          src={kozareIcon}
          alt="kozare icon"
          className="w-7 h-7 lg:w-7 lg:h-7"
        />
      )}
      {category === "その他" && (
        <img
          src={otherIcon}
          alt="other icon"
          className="w-7 h-7 lg:w-7 lg:h-7"
        />
      )}
    </div>
  );
};
