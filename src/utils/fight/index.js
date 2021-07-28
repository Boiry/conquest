const fight = (player1, player2) => {
  let army1 = player1.nbShips * player1.force;
  let army2 = player2.nbShips * player2.force;
  if (army1 > army2) {
    army1 -= army2;
    army1 = Math.round(army1 / player1.force);
    const winner = player1.owner;
    return {winner, nbShips: army1, who: 'attacker', destroyed: parseInt(player2.nbShips)};
  } else {
    army2 -= army1;
    army2 = Math.round(army2 / player2.force);
    const winner = player2.owner;
    return {winner, nbShips: army2, who: 'defender', destroyed: parseInt(player1.nbShips)};
  }
}

export default fight;