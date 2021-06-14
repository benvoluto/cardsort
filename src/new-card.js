import React from 'react';

const NewCard = ({group, newCard, handleNewCard, handleNewCardSubmit}) => (group.id === 0) ? (
  <form onSubmit={handleNewCardSubmit} className="add-form">
    <input
      type="text"
      id="new-show"
      className="showInput"
      name={group.id}
      autoComplete="off"
      value={newCard}
      onChange={handleNewCard}
      placeholder="show title"
    />
    <button type="submit" className="button add-card">
      Add card
    </button>
  </form>
) : null;

export default NewCard;