export type InputAction = 'LEFT' | 'RIGHT' | 'JUMP' | 'SLIDE' | 'PAUSE';

export class InputController {
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private isPointerDown = false;
  private minSwipeDistance = 20; // px threshold
  private maxSwipeTime = 700; // ms

  private lastActionTimes: Partial<Record<InputAction, number>> = {};
  private listeners: ((action: InputAction) => void)[] = [];

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;
  private isEnabled = true;

  constructor() {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundPointerDown = this.handlePointerDown.bind(this);
    this.boundPointerUp = this.handlePointerUp.bind(this);
    this.attach();
  }

  public onAction(cb: (action: InputAction) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private dispatch(action: InputAction) {
    if (!this.isEnabled) return;

    // Small debounce (80ms) to prevent unintended double-strokes
    const now = performance.now();
    const last = this.lastActionTimes[action] || 0;
    if (now - last < 80) {
      return;
    }
    this.lastActionTimes[action] = now;

    for (const cb of this.listeners) {
      cb(action);
    }
  }

  public trigger(action: InputAction) {
    this.dispatch(action);
  }

  public setEnabled(val: boolean) {
    this.isEnabled = val;
  }

  private attach() {
    window.addEventListener('keydown', this.boundKeyDown, { passive: false });
    window.addEventListener('pointerdown', this.boundPointerDown, { passive: true });
    window.addEventListener('pointerup', this.boundPointerUp, { passive: true });
  }

  public detach() {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('pointerdown', this.boundPointerDown);
    window.removeEventListener('pointerup', this.boundPointerUp);
  }

  private handleKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    const code = e.code;
    const key = (e.key || '').toLowerCase();

    // LEFT: ArrowLeft, A, Q (AZERTY), Numpad4
    if (
      code === 'ArrowLeft' ||
      code === 'KeyA' ||
      code === 'Numpad4' ||
      key === 'arrowleft' ||
      key === 'a' ||
      key === 'q'
    ) {
      e.preventDefault();
      this.dispatch('LEFT');
      return;
    }

    // RIGHT: ArrowRight, D, Numpad6
    if (
      code === 'ArrowRight' ||
      code === 'KeyD' ||
      code === 'Numpad6' ||
      key === 'arrowright' ||
      key === 'd'
    ) {
      e.preventDefault();
      this.dispatch('RIGHT');
      return;
    }

    // JUMP: ArrowUp, W, Z (AZERTY), Space, Numpad8
    if (
      code === 'ArrowUp' ||
      code === 'KeyW' ||
      code === 'Space' ||
      code === 'Numpad8' ||
      key === 'arrowup' ||
      key === 'w' ||
      key === 'z' ||
      key === ' '
    ) {
      e.preventDefault();
      this.dispatch('JUMP');
      return;
    }

    // SLIDE: ArrowDown, S, Numpad2
    if (
      code === 'ArrowDown' ||
      code === 'KeyS' ||
      code === 'Numpad2' ||
      key === 'arrowdown' ||
      key === 's'
    ) {
      e.preventDefault();
      this.dispatch('SLIDE');
      return;
    }

    // PAUSE: P, Escape
    if (code === 'KeyP' || code === 'Escape' || key === 'p' || key === 'escape') {
      e.preventDefault();
      this.dispatch('PAUSE');
      return;
    }
  }

  private handlePointerDown(e: PointerEvent) {
    // Ignore pointer events on interactive UI buttons (e.g. Pause, HUD, Shop)
    const target = e.target as HTMLElement;
    if (target && target.closest('button, a, input, [role="button"]')) {
      return;
    }

    this.touchStartX = e.clientX;
    this.touchStartY = e.clientY;
    this.touchStartTime = performance.now();
    this.isPointerDown = true;
  }

  private handlePointerUp(e: PointerEvent) {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;

    const deltaX = e.clientX - this.touchStartX;
    const deltaY = e.clientY - this.touchStartY;
    const elapsed = performance.now() - this.touchStartTime;

    if (elapsed > this.maxSwipeTime) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < this.minSwipeDistance && absY < this.minSwipeDistance) {
      return;
    }

    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0) {
        this.dispatch('RIGHT');
      } else {
        this.dispatch('LEFT');
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        this.dispatch('SLIDE');
      } else {
        this.dispatch('JUMP');
      }
    }
  }
}
