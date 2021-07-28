import Measuring from '../distance';

let playerId, playerName, planets, hiddenStats, incrementalProduction, mapWidth, mapHeight, nbPlanets;
let ownPlanets = [];

const getNeutralsPercent = () => {
  let count = 0;
  for (let i=0; i<mapHeight; i++) {
    for (let j=0; j<mapWidth; j++) {
      if (planets[i][j].owner === 'Personne') {
        count++;
      }
    }
  }
  return count * 100 / nbPlanets;
}

const getNbShips = () => {
  let count = 0;
  for (let i=0; i<mapHeight; i++) {
    for (let j=0; j<mapWidth; j++) {
      if (planets[i][j].owner === playerName) {
        count += planets[i][j].nbShips;
      }
    }
  }
  return count;
}

const getForceNbShips = () => {
  let count = 0;
  for (let i=0; i<mapHeight; i++) {
    for (let j=0; j<mapWidth; j++) {
      if (planets[i][j].owner === playerName) {
        count += planets[i][j].nbShips * planets[i][j].force;
      }
    }
  }
  return count;
}

const listOwnPlanets = () => {
  ownPlanets = [];
  for (let i=0; i<mapHeight; i++) {
    for (let j=0; j<mapWidth; j++) {
      if (planets[i][j].owner === playerName) {
        ownPlanets.push({row: i, col: j});
      }
    }
  }
}

const calculateCentroid = () => {
  listOwnPlanets();
  const centroidX = ownPlanets.reduce((a, b) => a + b.col, 0) / ownPlanets.length;
  const centroidY = ownPlanets.reduce((a, b) => a + b.row, 0) / ownPlanets.length;
  return {x: centroidX, y:centroidY};
}

const sortEnnemyPlanetsByDistance = () => {
  const centroid = calculateCentroid();
  const virtualPlanet = {col: Math.round(centroid.x), row: Math.round(centroid.y)};
  let table = [];
  for (let i=0; i<mapHeight; i++) {
    for (let j=0; j<mapWidth; j++) {
      if (planets[i][j].owner !== playerName && planets[i][j] !== 'free') {
        const ennemyPlanet = {col: j, row: i};
        table.push({col: j, row: i, distance: Measuring(virtualPlanet, ennemyPlanet)});
      }
    }
  }
  table.sort((a, b) => a.distance - b.distance);
  return table;
}

const sortPlanetsByDistance = (target) => {
  let table = [];
  for (let i=0; i<mapHeight; i++) {
    for (let j=0; j<mapWidth; j++) {
      if (planets[i][j].owner === playerName && planets[i][j] !== 'free') {
        const planet = {col: j, row: i};
        table.push({col: j, row: i, distance: Measuring(planet, target)});
      }
    }
  }
  table.sort((a, b) => a.distance - b.distance);
  return table;
}

const sendFleet = (source, destination, nbShips, round, setMoves, situation) => {
  planets[source.row][source.col].nbShips -= nbShips;
  const sourcePlanet = planets[source.row][source.col];
  const destinationPlanet = planets[destination.row][destination.col];
  const destinationCoordinates = [destination.row, destination.col];
  const result = Measuring({col: source.col, row: source.row}, {col: destination.col, row: destination.row});
  const arrivalRound = Math.round(result / 2 + round);
  const move = {
    sourceOwner: sourcePlanet.owner,
    sourceName: sourcePlanet.name,
    sourceForce: sourcePlanet.force,
    sourceColor: sourcePlanet.color,
    destinationName: destinationPlanet.name,
    destinationColor: destinationPlanet.color,
    destinationCoordinates,
    nbShips,
    round: arrivalRound,
    hidden: true
  };
  setMoves(moves => [...moves, move]);
  situation[playerId].sentFleets += 1;
}

const computerPlayer = (id, name, map, options, round, setMoves, situation) => {
  playerId = id;
  playerName = name;
  planets = map;
  hiddenStats = options.hiddenStats;
  incrementalProduction = options.incrementalProduction;
  mapWidth = options.mapWidth;
  mapHeight = options.mapHeight;
  nbPlanets = options.nbPlanets;
  
  const ratio = .6;
  let availableShips = Math.round(ratio * getNbShips());
  let forceAvailableShips = Math.round(ratio * getForceNbShips());
  let sentShips = 0;
  const ennemyPlanets = sortEnnemyPlanetsByDistance();
  for (const planet of ennemyPlanets) {
    if (hiddenStats === false && availableShips > sentShips) {
      const planetNbShips = map[planet.row][planet.col].nbShips;
      const planetForce = map[planet.row][planet.col].force;
      const forceNecessaryShips = Math.round(1.1 * planetNbShips * planetForce);
      let forceShipsSent = 0;
      const closestPlanets = sortPlanetsByDistance({col: planet.col, row: planet.row});
      for (const ownPlanet of closestPlanets) {
        const nbShips = map[ownPlanet.row][ownPlanet.col].nbShips;
        const force = map[ownPlanet.row][ownPlanet.col].force;
        if (forceShipsSent < forceNecessaryShips && forceAvailableShips > forceNecessaryShips) {
          forceShipsSent += Math.round(ratio * nbShips * force);
          forceAvailableShips -= forceShipsSent;
          sentShips += Math.round(ratio * nbShips);
          availableShips -= sentShips;
          sendFleet({col: ownPlanet.col, row: ownPlanet.row}, {col: planet.col, row: planet.row}, Math.round(ratio * nbShips), round, setMoves, situation)
        }
      }
    }
  }

}

export default computerPlayer;