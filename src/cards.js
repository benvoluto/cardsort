import React from 'react';
import Card from './card';

const Cards = ({cards, group, handleCardRemove}) => {
  return (cards) ? cards
    .filter((cardItem) => cardItem.status === group.id)
    .map((cardItem) => (
      <Card key={cardItem.cardId} text={cardItem} id={cardItem.cardId}>
        <div className="card">
          <button name={cardItem.cardId} className="close-button" onClick={handleCardRemove}>
          &times;
          </button>
          {cardItem.title}
        </div>
      </Card>
    )) : null;
};

export default Cards;