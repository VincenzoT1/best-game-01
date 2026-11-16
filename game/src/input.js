// Input State Tracker: Keyboard & Mouse
export function createInput(canvas) {
  const state = {
    up: false,
    down: false,
    left: false,
    right: false,
    firing: false,
    emp: false,
    pause: false,
    mouseX: 0,
    mouseY: 0,
  };

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') state.up = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') state.down = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') state.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') state.right = true;
    if (e.code === 'Space') state.emp = true;
    if (e.code === 'KeyP' || e.code === 'Escape') state.pause = !state.pause;
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') state.up = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') state.down = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') state.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') state.right = false;
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    state.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    state.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) state.firing = true;
    if (e.button === 2) {
      state.emp = true;
      e.preventDefault();
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) state.firing = false;
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  return state;
}
