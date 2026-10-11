import * as Types from "../types";

type Targets = {
    content: () => HTMLElement | null;
    panel: () => HTMLElement | null;
    input: () => HTMLElement | null;
    listbox: () => HTMLElement | null;
};

export class InteractionManager {
    #abort: AbortController | null = null;
    #targets: Targets;
    #keyboardEnabled: boolean;
    #hasSelection: () => boolean;
    #emit: (i: Types.Intention) => void;

    constructor(opts: {
        targets: Targets;
        keyboardEnabled: boolean;
        hasSelection: () => boolean;
        emit: (i: Types.Intention) => void;
    }) {
        this.#targets = opts.targets;
        this.#keyboardEnabled = opts.keyboardEnabled;
        this.#hasSelection = opts.hasSelection;
        this.#emit = opts.emit;
    }

    attach(): void {
        if (this.#abort) return;
        const content = this.#targets.content();
        const panel = this.#targets.panel();
        if (!content || !panel) return;

        this.#abort = new AbortController();
        const signal = this.#abort.signal;

        // HOY: app.ts L555-562 (focusin) + L541-552 (outside click)
        content.addEventListener('focusin', (e) => {
            const input = this.#targets.input();
            if (e.target !== input) return;
            const listbox = this.#targets.listbox();
            const count = listbox?.querySelectorAll('.items, .search-no-results').length ?? 0;
            if (count > 0) this.#emit({ type: 'open', source: 'focus' });
            document.addEventListener('click', this.#onOutsideClick, { signal });
        }, { signal });

        // HOY: app.ts L565-582 (click en item)
        content.addEventListener('click', (e) => {
            const listbox = this.#targets.listbox();
            if (!listbox) return;
            const item = (e.target as HTMLElement).closest('.items');
            if (!item) return;
            const items = listbox.querySelectorAll('.items');
            this.#emit({ type: 'select', index: Array.from(items).indexOf(item as Element) });
        }, { signal });

        // HOY: visibilityManager.ts L226-234 (Escape) + app.ts L586-604 (flechas/Enter)
        content.addEventListener('keydown', (e) => {
            const key = (e as KeyboardEvent).key;
            if (key === 'Escape') {
                e.preventDefault();
                this.#emit({ type: 'close', reason: 'blur', immediate: true });
                return;
            }
            if (!this.#keyboardEnabled) return;
            if (key === 'ArrowDown') {
                e.preventDefault();
                this.#emit({ type: 'navigate', delta: 1 });
            } else if (key === 'ArrowUp') {
                e.preventDefault();
                this.#emit({ type: 'navigate', delta: -1 });
            } else if (key === 'Enter') {
                if (!this.#hasSelection()) return;
                e.preventDefault();
                this.#emit({ type: 'select' });
            }
        }, { signal });

        // HOY: visibilityManager.ts L235-266 (pointer/focus/touch del panel)
        panel.addEventListener('pointerenter', () => this.#emit({ type: 'sticky', region: 'pointer', on: true }), { signal });
        panel.addEventListener('pointerleave', () => this.#emit({ type: 'sticky', region: 'pointer', on: false }), { signal });
        panel.addEventListener('pointerdown', () => this.#emit({ type: 'sticky', region: 'interaction', on: true }), { signal });
        panel.addEventListener('pointermove', () => this.#emit({ type: 'sticky', region: 'interaction', on: true }), { signal });
        panel.addEventListener('touchstart', () => this.#emit({ type: 'sticky', region: 'interaction', on: true }), { signal, passive: true });
        panel.addEventListener('focusin', () => this.#emit({ type: 'sticky', region: 'focus', on: true }), { signal });
        panel.addEventListener('focusout', (e) => {
            const related = (e as FocusEvent).relatedTarget as Node | null;
            this.#emit({ type: 'sticky', region: 'focus', on: !!related && panel.contains(related) });
        }, { signal });
    }

    // ANTES: 5 removeEventListener dispersos en destroy() de app.ts
    detach(): void {
        this.#abort?.abort();
        this.#abort = null;
    }

    #onOutsideClick = (e: MouseEvent): void => {
        const content = this.#targets.content();
        if (content && e.target instanceof Node && content.contains(e.target)) return;
        this.#emit({ type: 'close', reason: 'blur', immediate: true, resetScroll: true });
    };
}