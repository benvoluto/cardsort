import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';

const Group = ({ status, changeCardGroup, children }) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: 'card',
    drop(item) {
      changeCardGroup(item.id, status);
    },
  });
  drop(ref);
  return <div className={`group ${status === 0 ? 'ungrouped' : ''}`} ref={ref}> {children}</div>;
};

export default Group;