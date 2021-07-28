import React, { useState, useEffect } from 'react';

import './map.scss';
import Planet from './Planet';

const Map = ({ width, height, planets, players, colors, onclick, generate, saveMap }) => {
  // Map generator
  const [finalTable, setFinalTable] = useState([]);
  
  useEffect(() => {
    if (finalTable) {
      saveMap(finalTable);
    }
  })

  const mapGenerator = () => {
    let mapTable = [];
  
    for (let i=0; i<planets; i++) {
      const name = String.fromCharCode(i+65);
      let owner = "Personne";
      let color = "none";
      let nbShips = 1;
      let startProduction = Math.floor(Math.random() * (16 - 5)) + 5;
      let production = startProduction;
      let force = Math.floor(Math.random() * (11 - 1)) + 1;
      if (i<players.length) {
        owner = players[i];
        color = colors[i];
        nbShips = 10;
        startProduction = 10;
        production = 10;
        force = 5;
      }
      const index = Math.floor(Math.random() * (mapTable.length+1));
      mapTable.splice(index, 0, {name, owner, color, nbShips, startProduction, production, force});
    }
  
    let size = planets;
    for (let i=0; i<size; i++) {
      const index = Math.floor(Math.random() * (size+1));
      mapTable.splice(index, 0, "free");
      if (size < width * height - planets) {
        size++;
      }
    }
  
    for (let i=0; i<width*height; i+=width) {
      let rowTable = [];
      for (let j=0; j<width; j++) {
        rowTable.push(mapTable[i+j])
      }
      setFinalTable(finalTable => [...finalTable, rowTable]);
    }
  }

  useEffect(() => {
    mapGenerator();
  }, [])

  useEffect(() => {
    setFinalTable([]);
    mapGenerator();
  }, [generate])

  // Handle click on planet
  const clickOnPlanet = (props) => {
    onclick(props);
  }

  return (
    <div className='options-map-map'>
      <table className='options-map-table'>
        <tbody>
          {Object.keys(finalTable).map((row) => (
            <tr key={`tr${row}`}>
              {Object.keys(finalTable[row]).map((line) => (
                <td key={`td${row}${line}`}>
                  {typeof(finalTable[row][line]) === 'object' &&
                    <Planet key={`planet${row}${line}`} props={finalTable[row][line]} click={clickOnPlanet} />
                  }
                  {typeof(finalTable[row][line]) === 'string' &&
                    <div key={`void${row}${line}`} className="void"></div>
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Map;