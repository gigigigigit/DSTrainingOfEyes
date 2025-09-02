export function createTracking({ mount, level, onScore }) {
  const root = document.createElement('div');
  const info = document.createElement('div');
  const stage = document.createElement('div');
  root.appendChild(info);
  root.appendChild(stage);
  mount.appendChild(root);

  info.className = 'center hint';
  stage.className = 'stage';

  let targetIdx = 0;
  let balls = [];
  let phase = 'mark'; // 'mark' | 'shuffle' | 'guess'
  let shuffleCount = Math.min(10, 3 + level);
  let speed = 600 - level * 80; // ms per swap

  function layoutBall(el, x, y) {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  function getSlots() {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const pad = 40;
    const y = H/2 - 18;
    const x1 = pad;
    const x2 = W/2 - 18;
    const x3 = W - pad - 36;
    return [ [x1,y], [x2,y], [x3,y] ];
  }

  function setPhase(p) {
    phase = p;
    if (p === 'mark') {
      info.textContent = '黄色枠のボールを覚えてください…';
    } else if (p === 'shuffle') {
      info.textContent = 'シャッフル中… 目で追いましょう';
    } else if (p === 'guess') {
      info.textContent = 'どのボールだった？ クリックして回答';
    }
  }

  function spawn() {
    stage.innerHTML = '';
    const slots = getSlots();
    balls = [0,1,2].map(i => {
      const el = document.createElement('div');
      el.className = 'ball';
      layoutBall(el, slots[i][0], slots[i][1]);
      stage.appendChild(el);
      el.addEventListener('click', () => {
        if (phase !== 'guess') return;
        const correct = i === targetIdx;
        if (correct) {
          onScore?.(15);
          info.textContent = '正解！ +15点';
        } else {
          onScore?.(-7);
          info.textContent = '不正解… -7点';
        }
        // Next round
        setTimeout(initRound, 900);
      });
      return el;
    });
  }

  async function animateSwap(aIdx, bIdx, duration) {
    return new Promise(resolve => {
      const slots = getSlots();
      const [ax, ay] = slots[aIdx];
      const [bx, by] = slots[bIdx];
      const a = balls[aIdx];
      const b = balls[bIdx];
      a.style.transition = b.style.transition = `left ${duration}ms ease, top ${duration}ms ease`;
      layoutBall(a, bx, by);
      layoutBall(b, ax, ay);
      setTimeout(() => {
        a.style.transition = b.style.transition = '';
        // swap references
        const tmp = balls[aIdx];
        balls[aIdx] = balls[bIdx];
        balls[bIdx] = tmp;
        resolve();
      }, duration + 20);
    });
  }

  async function shuffleLoop() {
    setPhase('shuffle');
    const swaps = [ [0,1], [1,2], [0,2] ];
    for (let n = 0; n < shuffleCount; n++) {
      const pick = swaps[Math.floor(Math.random() * swaps.length)];
      await animateSwap(pick[0], pick[1], Math.max(160, speed));
    }
    setPhase('guess');
  }

  function markTarget() {
    targetIdx = Math.floor(Math.random() * 3);
    balls[targetIdx].classList.add('target');
    setPhase('mark');
    setTimeout(() => {
      balls[targetIdx].classList.remove('target');
      shuffleLoop();
    }, 900);
  }

  function initRound() {
    spawn();
    markTarget();
  }

  // initial mount after layout
  const ro = new ResizeObserver(() => {
    // relayout balls on resize
    const slots = getSlots();
    balls.forEach((el, i) => layoutBall(el, slots[i][0], slots[i][1]));
  });
  ro.observe(stage);

  initRound();

  return {
    destroy() {
      ro.disconnect();
      mount.removeChild(root);
    },
    restart() {
      shuffleCount = Math.min(10, 3 + level);
      initRound();
    }
  };
}

