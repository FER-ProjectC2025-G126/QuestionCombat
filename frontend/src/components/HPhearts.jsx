import React from "react";

const MAX_HEARTS = 5;
const HP_PER_HEART = 2;

const HPHearts = ({ hp }) => {
  return (
    <div className="HPhearts">
      {Array.from({ length: MAX_HEARTS }).map((_, i) => {
        const heartHp = hp - i * HP_PER_HEART;

        if (heartHp >= 2) return <img key={i} src="/heart-full.svg" alt="full heart" />;
        if (heartHp === 1) return <img key={i} src="/heart-half.svg" alt="half heart" />;
        return <img key={i} src="/heart-empty.svg" alt="empty heart" />;
      })}
    </div>
  );
};

export default HPHearts;


