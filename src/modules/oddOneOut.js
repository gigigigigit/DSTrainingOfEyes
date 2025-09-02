export function createOddOneOut({ mount, level, onScore }) {
  const root = document.createElement('div');
  const info = document.createElement('div');
  const grid = document.createElement('div');
  root.appendChild(info);
  root.appendChild(grid);
  mount.appendChild(root);

  let round = 0;
  const params = computeParams(level);

  function computeParams(lv) {
    const size = Math.min(8, 3 + lv); // 4..8
    const delta = 35 - lv * 5; // 30..10 (color gap)
    return { size, delta };
  }

  function randInt(n) { return Math.floor(Math.random() * n); }
  function randHue() { return Math.floor(Math.random() * 360); }

  function renderRound() {
    round += 1;
    grid.className = 'grid';
    grid.style.gridTemplateColumns = `repeat(${params.size}, 1fr)`;
    grid.innerHTML = '';

    const baseHue = randHue();
    const diffHue = (baseHue + (Math.random() < 0.5 ? params.delta : -params.delta) + 360) % 360;
    const specialIndex = randInt(params.size * params.size);

    info.innerHTML = `<div>ラウンド ${round}：違う色のタイルを1つ見つけてください。</div>`;

    for (let i = 0; i < params.size * params.size; i++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      const hue = (i === specialIndex) ? diffHue : baseHue;
      const sat = 70;
      const light = 55;
      cell.style.background = `hsl(${hue} ${sat}% ${light}%)`;
      cell.setAttribute('aria-label', 'タイル');
      cell.addEventListener('click', () => {
        const correct = i === specialIndex;
        if (correct) {
          onScore?.(10);
          info.innerHTML = `<div class="result">正解！ +10点。次のラウンドに進みます。</div>`;
        } else {
          onScore?.(-5);
          info.innerHTML = `<div class="result">不正解… -5点。もう一度挑戦！</div>`;
        }
        setTimeout(renderRound, 650);
      });
      grid.appendChild(cell);
    }
  }

  renderRound();

  return {
    destroy() {
      mount.removeChild(root);
    },
    restart() {
      round = 0;
      renderRound();
    }
  };
}

