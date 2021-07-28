import React, { useEffect, useState, useRef } from 'react';

import './game.scss';

import Planet from './Planet';
import Measuring from '../../utils/distance';
import Fight from '../../utils/fight';
import computerPlayer from '../../utils/computerPlayer';

let map;
const Game = ({ initialMap, abort, options }) => {
  map = initialMap;
  const [round, setRound] = useState(1);
  const [moves, setMoves] = useState([]);
  const distancePopup = useRef();
  const input = useRef('');
  const situationPopup = useRef();
  const movesPopup = useRef();
  const endPopup = useRef();
  
  // Using CSS variables to fit the size of the map within the screen
  useEffect(() => {
    let root = document.documentElement;
    let size;
    if (window.innerWidth > window.innerHeight) {
      size = window.innerHeight / options.mapHeight - 15;
    } else {
      size = window.innerWidth / options.mapWidth -15;
    }
    root.style.setProperty('--size2', `${size}px`);
    root.style.setProperty('--width', `${size * options.mapWidth + options.mapWidth + 1}px`);
  }, [initialMap, options])
  
  // Display instructions
  const instructionView = useRef();
  const [instruction, setInstruction] = useState('Choisissez la planète de départ.');
  useEffect(() => {
    instructionView.current.textContent = instruction;
  }, [instruction])

  // Handle player actions, i.e moving ships or measuring distance
  const [action, setAction] = useState('move');
  const [planet1, setPlanet1] = useState();
  const [planet2, setPlanet2] = useState();
  const [distance, setDistance] = useState();
  const [roundMeasuring, setRoundMeasuring] = useState();
  const endRoundButton = useRef();
  const clickOnPlanet = (col, row) => {
    switch (action) {
      case 'measuring':
        if (!planet1) {
          setPlanet1({col, row});
          setInstruction('Sélectionnez la planète d\'arrivée.');
        } else {
          const planet2 = {col, row};
          const result = Measuring(planet1, planet2);
          setDistance(result);
          setRoundMeasuring(Math.round(result / 2 + round));
          distancePopup.current.style.visibility = 'visible';
          setPlanet1('');
          setInstruction('Choisissez la planète de départ.');
          setAction('move');
        }
        break;
      case 'move':
        const owner = map[row][col].owner;
        const nbShips = map[row][col].nbShips;
        if (!planet1) {
          if (owner === 'Vous' && nbShips > 0) {
            planetRefs.current[`${col}-${row}`].children[3].classList.add('game-planet-blink');
            setPlanet1({col, row});
            setInstruction('Choisissez la planète d\'arrivée.');
            endRoundButton.current.disabled = true;
          }
        } else if (!planet2 && (row !== planet1.row || col !== planet1.col)) {
          Object.entries(planetRefs.current).forEach(
            key => key[1].children[3].classList.remove('game-planet-blink')
          );
          setPlanet2({col, row});
          setInstruction('Entrez le nombre de vaisseaux.');
          input.current.disabled = false;
          input.current.focus();
        }
      break;
      default: return;
    }
  }

  // Adding move to the moves stack
  const [shipsSent, setShipsSent] = useState();
  const moveShips = () => {
    if (shipsSent > 0) {
      map[planet1.row][planet1.col].nbShips -= shipsSent;
      const sourceOwner = map[planet1.row][planet1.col].owner;
      const sourceName = map[planet1.row][planet1.col].name;
      const sourceForce = map[planet1.row][planet1.col].force;
      const sourceColor = map[planet1.row][planet1.col].color;
      const destinationName = map[planet2.row][planet2.col].name;
      const destinationColor = map[planet2.row][planet2.col].color;
      const destinationCoordinates = [planet2.row, planet2.col];
      const result = Measuring(planet1, planet2);
      setDistance(result);
      const arrivalRound = Math.round(result / 2 + round);
      const move = {
        sourceOwner,
        sourceName,
        sourceForce,
        sourceColor,
        destinationName,
        destinationColor,
        destinationCoordinates,
        nbShips: shipsSent,
        round: arrivalRound,
        hidden: false
      };
      setMoves([...moves, move]);
      setShipsSent('');
      setInstruction('Choisissez la planète de départ.');
      input.current.disabled = true;
      input.current.blur();
      setPlanet1('');
      setPlanet2('');
      situation.player1.sentFleets += 1;
      endRoundButton.current.disabled = false;
    }
  }

  // Handle the number of ships sent input
  const handleShipsInput = (e) => {
    const value = e.target.value;
    if (value <= map[planet1.row][planet1.col].nbShips) {
      setShipsSent(value);
    }
  }
  
  // Handle the escape key
  document.onkeydown = (e) => {
    if (e.code === 'Escape') {
      setAction('move');
      setPlanet1('');
      setPlanet2('');
      setShipsSent('');
      input.current.blur();
      input.current.disabled = true;
      setInstruction('Choisissez la planète de départ.');
      endRoundButton.current.disabled = false;
      Object.entries(planetRefs.current).forEach(
        key => key[1].children[3].classList.remove('game-planet-blink')
      );
    }
  }
  
  const formSubmit = (e) => {
    e.preventDefault();
    moveShips()
  }

  useEffect(() => {
    situationPopup.current.style.visibility = 'hidden';
    movesPopup.current.style.visibility = 'hidden';
  }, []);

  const openClosePopup = (popup) => {
    if (popup.current.style.visibility === 'hidden') {
      if (popup.current.id === 'situation-popup') {
        calcSituation();
      }
      popup.current.style.visibility = 'visible';
    } else {
      popup.current.style.visibility = 'hidden';
    }
  }

  // Initialize the situation panel
  const [situation, setSituation] = useState({});
  useEffect(() => {
    const situationTable = {};
    for (let i=0; i<4; i++) {
      const player = `player${i+1}`;
      situationTable[player] = [];
      situationTable[player].name = options.players[player].name;
      situationTable[player].color = options.players[player].color;
      situationTable[player].madeShips = 10;
      situationTable[player].takenPlanets = 0;
      situationTable[player].sentFleets = 0;
      situationTable[player].destroyedFleets = 0;
      situationTable[player].destroyedShips = 0;
      situationTable[player].production = 10;
      situationTable[player].nbShips = 10;
    }
    setSituation(situationTable);
  }, [options]);
  
  // Calculate some stats in situation panel
  const calcSituation = () => {
    for (let i=1; i<=Object.keys(situation).length; i++) {
      situation[`player${i}`].production = 0;
      situation[`player${i}`].nbShips = 0;
    }
    for (let i=0; i<map.length; i++) {
      for (let j=0; j<map[0].length; j++) {
        if (map[i][j] !== 'free' && map[i][j].owner !== 'Personne') {
          for (let k=1; k<=Object.keys(situation).length; k++) {
            if (map[i][j].owner === situation[`player${k}`].name) {
              situation[`player${k}`].production += map[i][j].production;
              situation[`player${k}`].nbShips += map[i][j].nbShips;
            }
          }
        }
      }
    }
    moves.forEach((move) => {
      if (move.sourceOwner === 'Vous') {
        situation['player1'].nbShips += parseInt(move.nbShips);
      } else {
        const id = parseInt(move.sourceOwner[11]) + 1;
        situation[`player${id}`].nbShips += parseInt(move.nbShips);
      }
    })
    setSituation({...situation});
  }

  // Show planet infos when mouse hover
  const planetRefs = useRef({});
  const infos = useRef();
  const showInfos = (props, col, row) => {
    if (options.hiddenStats === false || props.owner === 'Vous' || props.owner === 'Personne') {
      const planetLeft = planetRefs.current[`${col}-${row}`].getBoundingClientRect().left;
      const planetTop = planetRefs.current[`${col}-${row}`].getBoundingClientRect().top;
      const planetSize = planetRefs.current[`${col}-${row}`].getBoundingClientRect().width;
      const infosWidth = infos.current.getBoundingClientRect().width;
      const infosHeight = infos.current.getBoundingClientRect().height;
      let x, y;
      if (col < options.mapWidth / 2) {
        x = planetLeft + planetSize;
      } else {
        x = planetLeft - infosWidth;
      }
      if (row < options.mapHeight / 2) {
        y = planetTop + planetSize;
      } else {
        y = planetTop - infosHeight;
      }
      const nbShips = map[row][col].nbShips;
      const production = map[row][col].production;
      infos.current.style.left = `${x}px`;
      infos.current.style.top = `${y}px`;
      infos.current.style.visibility = 'visible';
      infos.current.children[0].textContent = `Nom de la planète : ${props.name}`;
      infos.current.children[1].textContent = `Propriétaire : ${props.owner}`;
      infos.current.children[2].textContent = `Vaisseaux : ${nbShips}`;
      infos.current.children[3].textContent = `Production : ${production}`;
      infos.current.children[4].textContent = `Force : ${props.force}`;
    }
  }

  const hideInfos = () => {
    infos.current.style.visibility = 'hidden';
  }

  // End of round
  const endRound = () => {
    setRound(round + 1);

    // fight or reinforcement
    for (let i=0; i<moves.length; i++) {
      if (moves[i].round === round + 1) {
        const row = moves[i].destinationCoordinates[0];
        const col = moves[i].destinationCoordinates[1];
        const item = map[row][col];
        const sourceOwner = moves[i].sourceOwner;
        const destinationOwner = map[moves[i].destinationCoordinates[0]][moves[i].destinationCoordinates[1]].owner;
        const sourceNbShips = parseInt(moves[i].nbShips);
        const destinationNbShips = parseInt(map[moves[i].destinationCoordinates[0]][moves[i].destinationCoordinates[1]].nbShips);

        if (sourceOwner === destinationOwner) {
          item.nbShips = sourceNbShips + destinationNbShips;
        } else {
          const sourceForce = moves[i].sourceForce;
          const destinationForce = map[moves[i].destinationCoordinates[0]][moves[i].destinationCoordinates[1]].force;
          const result = Fight(
            {owner: sourceOwner, nbShips: sourceNbShips, force: sourceForce},
            {owner: destinationOwner, nbShips: destinationNbShips, force: destinationForce}
          );
          item.owner = result.winner;
          item.nbShips = result.nbShips;
          for (let j=0; j<Object.keys(options.players).length; j++) {
            if (result.winner === options.players[`player${j+1}`].name) {
              item.color = options.players[`player${j+1}`].color;
              if (result.who === 'attacker') {
                situation[`player${j+1}`].takenPlanets += 1;
                if (options.incrementalProduction) {
                  map[row][col].production = map[row][col].startProduction;
                }
              }
              situation[`player${j+1}`].destroyedFleets += 1;
              situation[`player${j+1}`].destroyedShips += result.destroyed;
            }
          }
        }
      }
    }

    // Computer turn
    for (const player in options.players) {
      const id = player;
      const name = options.players[player].name;
      if (name !== 'Vous') {
        computerPlayer(id, name, map, options, round+1, setMoves, situation);
      }
    }

    // Increase planets stats
    for (let i=0; i<map.length; i++) {
      for (let j=0; j<map[0].length; j++) {
        if (map[i][j] !== 'free') {
          if (map[i][j].owner === 'Personne') {
            map[i][j].nbShips += 1;
          } else {
            if (options.incrementalProduction === true) {
              map[i][j].production += 1;
            }
            map[i][j].nbShips += map[i][j].production;
            for (let k=1; k<=Object.keys(situation).length; k++) {
              if (map[i][j].owner === situation[`player${k}`].name) {
                situation[`player${k}`].madeShips += map[i][j].production;
              }
            }
          }
        }
      }
    }

    // Calculate situation to know whether it's an endgame or not
    calcSituation();
  }

  // If end of game, determine whether it's a victory or a defeat
  const [endGame, setEndGame] = useState(false);
  const [endMessage, setEndMessage] = useState();
  useEffect(() => {
    if (Object.keys(situation).length !== 0) {
      let playerProduction;
      let playerFleet;
      let countProduction = 0;
      let countFleet = 0;
      Object.keys(situation).forEach((player) => {
        if (player === 'player1') {
          playerProduction = situation[player].production;
          playerFleet = situation[player].nbShips;
        } else {
          if (situation[player].production > 0) countProduction += 1;
          if (situation[player].nbShips > 0) countFleet += 1;
        }
      })
      if (countProduction === 0 && countFleet === 0) {
        setEndGame(true);
        setEndMessage('Victoire !');
      }
      if (playerProduction === 0 && playerFleet === 0) {
        setEndGame(true);
        setEndMessage('Défaite...');
      }
    }

  }, [situation])

  useEffect(() => {
    setMoves(moves.filter(item => item.round !== round));
  }, [round])

  return (
    <>
      <div className='game-header'>
        <button className='game-header-button' onClick={abort}>Mettre fin à la partie</button>
        <button
          className='game-header-button'
          onClick={() => {setInstruction('Sélectionnez la planète de départ.'); setAction('measuring')}}
        >Mesurer une distance</button>
        <button className='game-header-button' onClick={() => openClosePopup(situationPopup)}>Afficher la situation</button>
        <button className='game-header-button' onClick={() => openClosePopup(movesPopup)}>Vue d'ensemble de la flotte</button>    
      </div>

      <div className='game-actions'>
        <div ref={instructionView} className='game-instruction'></div>
        <div className='game-command'>
          <form onSubmit={formSubmit}>
            Nombre de vaisseaux :
            <input
              ref={input}
              type='number'
              disabled='disabled'
              value={shipsSent}
              onChange={handleShipsInput}
              className='game-command-input'
            />
            <button type="submit" className='game-command-submit-button'></button>
          </form>
          <button ref={endRoundButton} onClick={endRound}>Fin du tour</button>
        </div>
      </div>

      <div className='game-table-container'>
        <table className='game-table'>
          <tbody>
            {Object.keys(map).map((row) => (
              <tr key={`tr${row}`}>
                {Object.keys(map[row]).map((col) => (
                  <td key={`td${row}${col}`}>
                    {typeof(map[row][col]) === 'object' &&
                      <Planet
                        key={`planet${col}-${row}`}
                        ref={ref => planetRefs.current[`${col}-${row}`] = ref}
                        props={
                          {
                            infos: map[row][col],
                            click: () => clickOnPlanet(col, row),
                            mouseEnter: () => showInfos(map[row][col], col, row),
                            mouseLeave: () => hideInfos(),
                            hiddenStats: options.hiddenStats
                          }
                        }
                      />
                    }
                    {typeof(map[row][col]) === 'string' &&
                      <div key={`void${row}${col}`} className="game-void"></div>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div ref={infos} className='game-infos'>
        <div className='game-infos-name'></div>
        <div className='game-infos-owner'></div>
        <div className='game-infos-ships'></div>
        <div className='game-infos-production'></div>
        <div className='game-infos-force'></div>
      </div>
      
      <div className='game-footer'>Tour {round}</div>

      <div ref={distancePopup} className='game-popup game-distance-popup'>
        La distance est de {distance} années-lumière, un vaisseau partant maintenant arrivera au tour {roundMeasuring}.
        <button className='game-distance-popup-button' onClick={() => openClosePopup(distancePopup)}>OK</button>
      </div>
      
      <div ref={situationPopup} id='situation-popup' className='game-popup game-situation-popup'>
        <table className='game-popup-table'>
          <thead>
            <tr>
              <td width='160px'>Joueur</td>
              <td>Vaisseaux construits</td>
              <td>Planètes conquises</td>
              <td>Flottes lancées</td>
              <td>Flottes détruites</td>
              <td>Vaisseaux détruits</td>
              <td>Production actuelle</td>
              <td>Taille actuelle de la flotte</td>
            </tr>
          </thead>
          <tbody>
            {Object.keys(situation).map((player, index) => (
              <tr key={`stats${index}`}>
                <td><div className={`game-popup-color game-popup-color-${situation[player].color}`}></div>{situation[player].name}</td>
                <td>{situation[player].madeShips}</td>
                <td>{situation[player].takenPlanets}</td>
                <td>{situation[player].sentFleets}</td>
                <td>{situation[player].destroyedFleets}</td>
                <td>{situation[player].destroyedShips}</td>
                <td>{situation[player].production}</td>
                <td>{situation[player].nbShips}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='game-popup-close'>
          <button onClick={() => openClosePopup(situationPopup)}>OK</button>
        </div>
      </div>

      <div ref={movesPopup} className='game-popup game-moves-popup'>
        <div className='game-moves-popup-scrollable'>
          <table className='game-popup-table'>
            <thead>
              <tr>
                <td>Départ</td>
                <td>Destination</td>
                <td>Vaisseaux</td>
                <td>Tour d'arrivée</td>
              </tr>
            </thead>
            <tbody>
              {moves.map((move, index) => move.hidden === false && (
                  <tr key={`move${index}`}>
                    <td><div className={`game-popup-color game-popup-color-${move.sourceColor}`}></div>{move.sourceName}</td>
                    <td><div className={`game-popup-color game-popup-color-${move.destinationColor}`}></div>{move.destinationName}</td>
                    <td>{move.nbShips}</td>
                    <td>{move.round}</td>
                  </tr>     
              ))}
            </tbody>
          </table>
        </div>
        <div className='game-popup-close'>
          <button onClick={() => openClosePopup(movesPopup)}>OK</button>
        </div>
      </div>

      {endGame === true &&
        <div ref={endPopup} className='game-end-popup'>
          <div className='game-end-popup-message'>
            {endMessage}
          </div>
          <div className='game-popup-close'>
            <button onClick={abort}>OK</button>
          </div>
        </div>
      }

    </>
  )
}

export default Game;