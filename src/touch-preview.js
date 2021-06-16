import React from 'react';
import { usePreview } from 'react-dnd-preview';
import { isTouch } from './config';

const TouchPreview = ({cards}) => {
  // disabling since the dnd lib needs an item in this scope
  // eslint-disable-next-line no-unused-vars
  const {display, item, style} = usePreview();
  if (item) {
    let existingCard = cards.find((card) => card.cardId === item.id);
    if (!display || !isTouch) {
      return null;
    }
    return <div className="preview" style={style}>{existingCard.title}</div>;
  } else {
    return null;
  }
};

export default TouchPreview;