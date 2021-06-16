import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { usePreview } from 'react-dnd-preview';
 
const MyPreview = ({card}) => {
  // disabling since the dnd lib needs an item in this scope
  // eslint-disable-next-line no-unused-vars
  const {display, item, style} = usePreview();
  if (!display) {
    return null;
  }
  return <div className="item-list__item" style={style}>{card}</div>;
};

const Card = ({ id, children }) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'card', id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(ref);
  return (
    <div ref={ref} style={{ opacity }}>
      {children}
      <MyPreview card={children} />
    </div>
  );
};

export default Card;