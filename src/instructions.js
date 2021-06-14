import React from 'react';

const Instructions = ({ step, instructions }) => (
  <div className="instructions">{instructions[step] ? instructions[step].text : null}</div>
);

export default Instructions;