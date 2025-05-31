let grid;

function setup() {
  createCanvas(800, 800);
  grid = createGrid(10, 10, width / 128, width / 128);
}

function draw() {
  background(220);
  renderGrid(grid);
}

function createGrid(columns, rows, gap, margin) {
  const colWidth = (width - 2 * margin - (columns - 1) * gap) / columns;
  const rowHeight = (height - 2 * margin - (rows - 1) * gap) / rows;

  const cells = [];
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const x = margin + i * (colWidth + gap);
      const y = margin + j * (rowHeight + gap);
      cells.push({ x, y, w: colWidth, h: rowHeight });
    }
  }

  return {
    columns,
    rows,
    gap,
    margin,
    colWidth,
    rowHeight,
    cells,
  };
}

function renderGrid(grid) {
  for (const cell of grid.cells) {
    rect(cell.x, cell.y, cell.w, cell.h);
  }
}
