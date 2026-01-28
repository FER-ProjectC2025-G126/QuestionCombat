import React from "react";
import heart_full from "../assets/icons/hearts/heart-full.svg"
import heart_half from "../assets/icons/hearts/heart-half.svg"
import heart_empty from "../assets/icons/hearts/heart-empty.svg"


const MAX_HEARTS = 5;
const HP_PER_HEART = 2;

const HPHearts = ({ hp }) => {
  return (
    <div className="HPhearts">
      {Array.from({ length: MAX_HEARTS }).map((_, i) => {
        const heartHp = hp - i * HP_PER_HEART;

        if (heartHp >= 2) return <img key={i} src={heart_full} alt="full heart" />;
        if (heartHp === 1) return <img key={i} src={heart_half} alt="half heart" />;
        return <img key={i} src={heart_empty} alt="empty heart" />;
      })}
    </div>
  );
};

export default HPHearts;


