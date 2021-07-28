import React, { useState } from 'react';

import Options from '../Options';
import Game from '../Game';

const App = () => {
  const [map, setMap] = useState();
  const [page, setPage] = useState('options');
  const [options, setOptions] = useState();

  return (
    <div className='container'>
      {page === 'options' && <Options mapData={map => setMap(map)} start={() => setPage('game')} options={options} setOptions={opt => setOptions(opt)} />}
      {page === 'game' && <Game initialMap={map} abort={() => setPage('options')} options={options} />}
    </div>
  )
}

export default App;