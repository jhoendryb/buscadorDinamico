import * as Types from "../types";

/**
 * Máquina de estados finita dueña del ciclo abrir/cerrar del desplegable.
 * Estados: closed -> opening -> open -> closing -> closed.
 * Invariante: máximo UN timer vivo, siempre etiquetado con la generación vigente.
 */
export class VisibilityManager {
    #opts: Required<Types.VisibilityManagerOptions>;
    #phase: Types.DropdownPhase = 'closed';
    #lastCloseReason: Types.CloseReason = 'programmatic';
    #generation: number = 0;
    #timer: ReturnType<typeof setTimeout> | null = null;
    #pointerInside: boolean = false;
    #focusInside: boolean = false;
    #stickyUntil: number = 0;
    #listeners: Array<[HTMLElement, string, EventListener]> = [];
    #destroyed: boolean = false;

    constructor(options: Types.VisibilityManagerOptions) {
        this.#opts = {
            panel: options.panel,
            control: options.control ?? (() => null),
            listbox: options.listbox ?? (() => null),
            hideDelayMs: options.hideDelayMs ?? 200,
            reducedMotionMs: options.reducedMotionMs ?? 0,
            hooks: options.hooks ?? {}
        };
    }

    get phase(): Types.DropdownPhase {
        return this.#phase;
    }

    get isOpen(): boolean {
        return this.#phase === 'open' || this.#phase === 'opening';
    }

    open(reason: Types.OpenReason = 'programmatic'): void {
        if (this.#destroyed || this.isOpen) return;
        this.#generation++;
        this.#clearTimer();
        this.#ensureListeners();
        this.#enterOpening(reason);
    }

    close(options: Types.CloseOptions = {}): void {
        if (this.#destroyed || this.#phase === 'closed') return;
        if (!options.immediate && this.#phase === 'closing') return;

        const reason = options.reason ?? 'programmatic';
        this.#lastCloseReason = reason;
        this.#generation++;
        this.#clearTimer();
        this.#stickyUntil = 0;

        const duration = this.#duration();
        if (options.immediate || duration <= 0) {
            this.#opts.hooks.onClose?.(reason);
            this.#commitClose(reason);
            return;
        }

        this.#phase = 'closing';
        this.#syncDom();
        this.#opts.hooks.onClose?.(reason);
        this.#schedule(() => this.#resolveClosing(), duration);
    }

    toggle(): void {
        if (this.isOpen) {
            this.close({ reason: 'toggle' });
        } else {
            this.open('toggle');
        }
    }

    /**
     * Indica que hay una interacción en vuelo sobre el panel (click).
     * Suple el antiguo hack de mutar _isVisible desde appendItems.
     */
    stickForInteraction(): void {
        if (this.#destroyed) return;
        this.#stickyUntil = Date.now() + this.#opts.hideDelayMs;
        this.cancelPendingClose();
    }

    /** Revierte un cierre en curso (usado por pointerenter/focusin del panel). */
    cancelPendingClose(): void {
        if (this.#destroyed || this.#phase !== 'closing') return;
        this.#generation++;
        this.#clearTimer();
        this.#enterOpening('focus');
    }

    /** Re-sincroniza DOM desde la fase actual (escape hatch). */
    refresh(): void {
        if (this.#destroyed) return;
        this.#syncDom();
    }

    destroy(): void {
        this.#destroyed = true;
        this.#generation++;
        this.#clearTimer();
        this.#listeners.forEach(([element, eventName, fn]) =>
            element.removeEventListener(eventName, fn)
        );
        this.#listeners = [];
        this.#pointerInside = false;
        this.#focusInside = false;
        this.#stickyUntil = 0;
        this.#phase = 'closed';
    }

    #enterOpening(reason: Types.OpenReason): void {
        this.#phase = 'opening';
        this.#syncDom();
        this.#opts.hooks.onOpen?.(reason);

        const duration = this.#duration();
        if (duration <= 0) {
            this.#commitOpen(reason);
        } else {
            this.#schedule(() => this.#commitOpen(reason), duration);
        }
    }

    #commitOpen(reason: Types.OpenReason): void {
        if (this.#destroyed || !this.isOpen) return;
        this.#phase = 'open';
        this.#syncDom();
        this.#opts.hooks.onOpened?.(reason);
    }

    #commitClose(reason: Types.CloseReason): void {
        this.#phase = 'closed';
        this.#syncDom();
        this.#opts.hooks.onClosed?.(reason);
    }

    /**
     * Tick único que resuelve un closing pendiente.
     * Si algo pide quedarse abierto, revierte a apertura (fade inverso suave).
     */
    #resolveClosing(): void {
        if (this.#phase !== 'closing') return;
        if (this.#shouldStayOpen()) {
            this.cancelPendingClose();
            return;
        }
        this.#commitClose(this.#lastCloseReason);
    }

    #shouldStayOpen(): boolean {
        if (this.#pointerInside || this.#focusInside) return true;
        if (Date.now() < this.#stickyUntil) return true;
        const panel = this.#opts.panel();
        const active = typeof document !== 'undefined' ? document.activeElement : null;
        return !!panel && !!active && active !== document.body && panel.contains(active);
    }

    /**
     * Patrón generation-counter: cualquier transición nueva invalida
     * los callbacks previamente agendados.
     */
    #schedule(fn: () => void, ms: number): void {
        const gen = ++this.#generation;
        this.#clearTimer();
        this.#timer = setTimeout(() => {
            if (gen === this.#generation) fn();
        }, ms);
    }

    #clearTimer(): void {
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
    }

    #duration(): number {
        return this.#prefersReducedMotion()
            ? this.#opts.reducedMotionMs
            : this.#opts.hideDelayMs;
    }

    #prefersReducedMotion(): boolean {
        try {
            return (
                typeof matchMedia === 'function' &&
                matchMedia('(prefers-reduced-motion: reduce)').matches
            );
        } catch {
            return false;
        }
    }

    /** Único escritor de clases/atributos: elimina el drift por construcción. */
    #syncDom(): void {
        const panel = this.#opts.panel();
        if (!panel) return;

        const visible = this.#phase === 'open' || this.#phase === 'opening';

        panel.classList.toggle('content-pagination-visible', visible);
        panel.classList.toggle('content-pagination-hidden', !visible);

        if (visible) {
            panel.removeAttribute('hidden');
        } else if (this.#phase === 'closed') {
            // valor EXACTO: visibility.css usa el selector por valor [hidden="true"]
            panel.setAttribute('hidden', 'true');
        }

        this.#opts.control?.()?.setAttribute('aria-expanded', String(visible));
        this.#opts.listbox?.()?.setAttribute('aria-hidden', String(!visible));
    }

        /** Listeners delegados en el contenedor: cubren items añadidos dinámicamente. */
    #ensureListeners(): void {
        const panel = this.#opts.panel();
        if (!panel || this.#listeners.length > 0) return;

        this.#bind(panel, 'pointerdown', () => {
            this.#pointerInside = true;
            this.stickForInteraction();
        });
        this.#bind(panel, 'pointermove', () => {
            this.#pointerInside = true;
            this.stickForInteraction();
        });
        this.#bind(panel, 'pointerenter', () => { this.#pointerInside = true; });
        this.#bind(panel, 'pointerleave', () => { this.#pointerInside = false; });
        this.#bind(panel, 'touchstart', () => {
            this.#pointerInside = true;
            this.stickForInteraction();
        }, { passive: true });
        this.#bind(panel, 'focusin', () => { this.#focusInside = true; });
        this.#bind(panel, 'focusout', ((e: FocusEvent) => {
            const related = e.relatedTarget as Node | null;
            this.#focusInside = !!related && panel.contains(related);
        }) as EventListener);
    }

    #bind(element: HTMLElement, eventName: string, fn: EventListener, options?: AddEventListenerOptions): void {
        element.addEventListener(eventName, fn, options);
        this.#listeners.push([element, eventName, fn]);
    }
}