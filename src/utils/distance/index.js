const distance = (point1, point2) => {
  const p1x = parseInt(point1.col);
  const p1y = parseInt(point1.row);
  const p2x = parseInt(point2.col);
  const p2y = parseInt(point2.row);
  return Math.round(Math.sqrt(Math.pow((p1x - p2x), 2) + Math.pow((p1y - p2y), 2)));
}

export default distance;