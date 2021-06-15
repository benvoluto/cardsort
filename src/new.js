import React from 'react';
import { Checkmark } from 'react-checkmark';

const NewGroupName = ({ id, handleGroupNameSubmit, handleGroupName, newGroupName, oldGroupName }) => {
  return (
    <form onSubmit={handleGroupNameSubmit} name={id} className="group-form">
      <input
        type="text"
        id="newGroupName"
        autoFocus
        className="group-name-input"
        name={id}
        autoComplete="off"
        value={newGroupName}
        onChange={handleGroupName}
        placeholder={ (oldGroupName !== '') ? oldGroupName : ''}
      />
      <button className="group-name-save-button" type="submit">Ok</button>
    </form>
  )
};

export default NewGroupName;