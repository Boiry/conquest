import React, { forwardRef } from 'react';

import './planet.scss';

const Planet = forwardRef((props, ref) => (
  <div
    ref={ref}
    onClick={props.props.click}
    onMouseEnter={props.props.mouseEnter}
    onMouseLeave={props.props.mouseLeave}
    className={`game-planet game-planet-${props.props.infos.color}`}
  >
    <div className='game-planet-name'>{props.props.infos.name}</div>
    <div className='game-planet-img'></div>
    <div className='game-planet-ships'>{
      (props.props.hiddenStats === false || props.props.infos.owner === 'Vous' || props.props.infos.owner === 'Personne') &&
      props.props.infos.nbShips
    }</div>
    <div className='game-planet-transparent'></div>
  </div>
))

export default Planet;