import React from 'react';

import './planet.scss';

const Planet = ({ props, click }) => {
  const handleClick = () => {
    click(props);
  }

  return (
    <div className={`options-planet options-planet-color-${props.color}`} onClick={handleClick}></div>
  )
}

export default Planet;