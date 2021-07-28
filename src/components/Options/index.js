import React, { useState } from 'react';

import './options.scss';
import Map from './Map';

const Options = ({ mapData, start, setOptions }) => {
  const [defaultValues, setDefaultValues] = useState({
    players: {
      player1: {
        name: 'Vous',
        color: 'purple'
      },
      player2: {
        name: 'Ordinateur 1',
        color: 'yellow'
      },
      player3: {
        name: 'Ordinateur 2',
        color: 'red'
      },
      player4: {
        name: 'Ordinateur 3',
        color: 'green'
      }
    },
    mapWidth: 12,
    mapHeight: 12,
    nbPlanets: 55,
    hiddenStats: false,
    incrementalProduction: true
  })
  
  const changeInput = (input, value) => {
    setDefaultValues({...defaultValues, [input]: parseInt(value)});
    let root = document.documentElement;
    if ((input === 'mapWidth' && parseInt(value) > defaultValues.mapHeight) || (input === 'mapHeight' && parseInt(value) > defaultValues.mapWidth)) {
      root.style.setProperty('--size1', `${24/value}rem`);
    } else if (input === 'mapWidth') {
      root.style.setProperty('--size1', `${24/defaultValues.mapHeight}rem`);
    } else if (input === 'mapHeight') {
      root.style.setProperty('--size1', `${24/defaultValues.mapWidth}rem`);
    }
    updateMap();
  }

  const [generateNewMap, setGenerateNewMap] = useState(0);
  const updateMap = () => {
    setGenerateNewMap(generateNewMap + 1);
  }

  const [planetInfo, setPlanetInfo] = useState({owner: "Personne", production: 0, force: 0});
  const getPlanetInfo = (info) => {
    setPlanetInfo(info);
  }

  const saveMapTable = (map) => {
    mapData(map);
  }

  const handleCheckBox = (target, checked) => {
    setDefaultValues({...defaultValues, [target]: checked});
  }

  const startGame = () => {
    setOptions(defaultValues);
    start();
  }

  return (
    <>
      <div className="options-container">

        <section className="options-players">
          Joueurs
          <div className="options-frame">
            {Object.keys(defaultValues.players).map((player, index) => (
              <div key={`optionsPlayer${index}`} className="options-player">
                <span className={`options-players-color options-players-color-${defaultValues.players[player].color}`}></span>
                <span>{defaultValues.players[player].name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="options-map">
          Carte
          <div className="options-frame">
            <table className="options-map-inputs-table">
              <tbody>
                <tr>
                  <td><label htmlFor="nbPlanets">Nombre de planètes :</label></td>
                  <td className="options-map-input-td">
                    <input
                      className="options-map-input"
                      type="number"
                      id="nbPlanets"
                      value={defaultValues.nbPlanets}
                      onChange={(e) => changeInput("nbPlanets", e.target.value)}
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="mapWidth">Largeur :</label></td>
                  <td className="options-map-input-td">
                    <input
                      className="options-map-input"
                      type="number"
                      id="mapWidth"
                      value={defaultValues.mapWidth}
                      onChange={(e) => changeInput("mapWidth", e.target.value)}
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="mapHeight">Hauteur :</label></td>
                  <td className="options-map-input-td">
                    <input
                      className="options-map-input"
                      type="number"
                      id="mapHeight"
                      value={defaultValues.mapHeight}
                      onChange={(e) => changeInput("mapHeight", e.target.value)}
                    ></input>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div className="options-map-draw">
              <Map
                className="options-map-map"
                width={defaultValues.mapWidth}
                height={defaultValues.mapHeight}
                planets={defaultValues.nbPlanets}
                players={
                  Object.keys(defaultValues.players).map((player) => (
                    defaultValues.players[player].name
                  ))
                }
                colors={
                  Object.keys(defaultValues.players).map((player) => (
                    defaultValues.players[player].color
                  ))
                }
                onclick={(info) => getPlanetInfo(info)}
                generate={generateNewMap}
                saveMap={map => saveMapTable(map)}
              />
            </div>

            <table className="options-map-inputs-table">
              <tbody>
                <tr>
                  <td>Propriétaire :</td>
                  <td>{planetInfo.owner}</td>
                </tr>
                <tr>
                  <td>Production :</td>
                  <td>{planetInfo.production}</td>
                </tr>
                <tr>
                  <td>Force :</td>
                  <td>{planetInfo.force}</td>
                </tr>
              </tbody>
            </table>

            <button className="options-map-button" onClick={updateMap}>Changer de carte</button>
          </div>
        </section>

        <section className="options-options">
          Options
          <div className="options-frame">
            <div>
              <input
                type="checkbox"
                id="hiddenMap"
                checked={defaultValues.hiddenStats}
                onChange={(e) => handleCheckBox('hiddenStats', e.target.checked)}
              />
              <label htmlFor="hiddenMap">Carte cachée</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="incProduction"
                checked={defaultValues.incrementalProduction}
                onChange={(e) => handleCheckBox('incrementalProduction', e.target.checked)}
              />
              <label htmlFor="incProduction">Production incrémentale</label>
            </div>
          </div>
        </section>

      </div>
      <hr className="options-hr" />
      <div className="options-confirmation">
        <button className="options-confirmation-button" onClick={startGame}>OK</button>
      </div>
    </>
  )
}

export default Options;