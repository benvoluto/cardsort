import React from 'react';
import NewGroupName from './new';

const GroupNameEdit = ({
  group,
  editGroupId, 
  handleGroupNameSubmit, 
  handleGroupName, 
  clickGroupNameChange, 
  newGroupName
}) => (group.id > 0) ? (
<div className="group-add">
  {
    (editGroupId === group.id) ? (
      <NewGroupName 
        id={group.id}
        oldGroupName={group.name}
        handleGroupNameSubmit={handleGroupNameSubmit}
        handleGroupName={handleGroupName}
        newGroupName={newGroupName}
      /> ): (
        <button className="group-name-edit" name={group.id} onClick={clickGroupNameChange}>
          {(group.name === '') ? 'Add a label for this group' : group.name}
        </button>
      )
  }
</div>
) : null;

export default GroupNameEdit;