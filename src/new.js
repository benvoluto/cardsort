import React from 'react';

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
        placeholder={ (oldGroupName !== '') ? oldGroupName : "New Group name"}
      />
      <button className="group-name-save-button" type="submit">Ok</button>
    </form>
  )
};

export default NewGroupName;