
import { VisibilityManager } from '../../js/renderer/visibilityManager';

describe('VisibilityManager', () => {
    let panel: HTMLElement;
    let control: HTMLElement;
    let listbox: HTMLElement;
    let manager: VisibilityManager;
    let hooks: {
        onOpen: jest.Mock;
        onOpened: jest.Mock;
        onClose: jest.Mock;
        onClosed: jest.Mock;
    };

    beforeEach(() => {
        jest.useFakeTimers();
        panel = document.createElement('div');
        control = document.createElement('input');
        listbox = document.createElement('ul');
        document.body.append(panel, control, listbox);
        hooks = {
            onOpen: jest.fn(),
            onOpened: jest.fn(),
            onClose: jest.fn(),
            onClosed: jest.fn()
        };
        manager = new VisibilityManager({
            panel: () => panel,
            control: () => control,
            listbox: () => listbox,
            hideDelayMs: 200,
            hooks
        });
    });

    afterEach(() => {
        manager.destroy();
        panel.remove();
        control.remove();
        listbox.remove();
        delete (globalThis as any).matchMedia;
        jest.useRealTimers();
    });

    test('T1: open->close->open en el mismo tick deja abierto y sin timers residuales', () => {
        manager.open('focus');
        manager.close({ reason: 'blur' });
        manager.open('focus');

        expect(manager.phase).toBe('opening');

        jest.advanceTimersByTime(300);

        expect(manager.phase).toBe('open');
        expect(panel.hasAttribute('hidden')).toBe(false);
        expect(jest.getTimerCount()).toBe(0);

        // cerrar repetidamente mientras cierra NO apila timers ni callbacks
        manager.close({ reason: 'blur' });
        manager.close({ reason: 'blur' });
        manager.close({ reason: 'blur' });

        jest.advanceTimersByTime(300);

        expect(manager.phase).toBe('closed');
        expect(hooks.onClose).toHaveBeenCalledTimes(1);
        expect(hooks.onClosed).toHaveBeenCalledTimes(1);
    });

    test('T2: stickForInteraction a mitad de fade revierte a abierto; sin stick commitea cierre', () => {
        manager.open();
        jest.advanceTimersByTime(300); // open
        manager.close({ reason: 'blur' });
        jest.advanceTimersByTime(100); // mid-fade, fase closing

        manager.stickForInteraction();

        expect(manager.phase).toBe('opening');
        jest.advanceTimersByTime(300);

        expect(manager.phase).toBe('open');
        expect(panel.hasAttribute('hidden')).toBe(false);

        // variante sin stick: cierre normal commitea todos los atributos
        manager.close({ reason: 'blur' });
        jest.advanceTimersByTime(300);

        expect(manager.phase).toBe('closed');
        expect(panel.getAttribute('hidden')).toBe('true');
        expect(control.getAttribute('aria-expanded')).toBe('false');
        expect(listbox.getAttribute('aria-hidden')).toBe('true');
    });

    test('T3: close({immediate:true}) commitea sincrónicamente sin timers', () => {
        manager.open();
        jest.advanceTimersByTime(300);

        manager.close({ reason: 'select', immediate: true });

        expect(manager.phase).toBe('closed');
        expect(panel.getAttribute('hidden')).toBe('true');
        expect(hooks.onClosed).toHaveBeenCalledWith('select');
        expect(jest.getTimerCount()).toBe(0);
    });

    test('T4: matriz de toggle cubre las cuatro fases', () => {
        manager.toggle(); // closed -> opening
        expect(manager.phase).toBe('opening');

        manager.toggle(); // opening -> closing
        expect(manager.phase).toBe('closing');

        manager.toggle(); // closing -> reopening (mata el timer del close)
        expect(manager.phase).toBe('opening');

        jest.advanceTimersByTime(300);
        expect(manager.phase).toBe('open');

        manager.toggle(); // open -> closing
        expect(manager.phase).toBe('closing');

        jest.advanceTimersByTime(300);
        expect(manager.phase).toBe('closed');
        expect(hooks.onClosed).toHaveBeenCalledTimes(1);
    });

    test('T5: invariante ARIA sincronizada en toda transición', () => {
        manager.open();

        expect(control.getAttribute('aria-expanded')).toBe('true');
        expect(listbox.getAttribute('aria-hidden')).toBe('false');

        jest.advanceTimersByTime(300);
        expect(control.getAttribute('aria-expanded')).toBe('true');

        manager.close();

        expect(control.getAttribute('aria-expanded')).toBe('false');
        expect(listbox.getAttribute('aria-hidden')).toBe('true');

        jest.advanceTimersByTime(300);
        expect(control.getAttribute('aria-expanded')).toBe('false');
        expect(listbox.getAttribute('aria-hidden')).toBe('true');
    });

    test('T6: prefers-reduced-motion commitea sincrónicamente sin timers', () => {
        (globalThis as any).matchMedia = jest.fn().mockReturnValue({ matches: true });

        manager.open();

        expect(manager.phase).toBe('open'); // SIN avanzar timers
        expect(jest.getTimerCount()).toBe(0);

        manager.close({ reason: 'blur' });

        expect(manager.phase).toBe('closed');
        expect(panel.getAttribute('hidden')).toBe('true');
    });

    test('T7: puntero dentro del panel mantiene abierto pese al blur', () => {
        manager.open();
        jest.advanceTimersByTime(300);

        panel.dispatchEvent(new Event('pointerenter'));
        manager.close({ reason: 'blur' });
        jest.advanceTimersByTime(300);

        expect(manager.phase).toBe('open'); // rebote

        // al salir el puntero, el siguiente blur sí cierra
        panel.dispatchEvent(new Event('pointerleave'));
        manager.close({ reason: 'blur' });
        jest.advanceTimersByTime(300);

        expect(manager.phase).toBe('closed');
    });

    test('T7b: foco dentro del panel mantiene abierto', () => {
        manager.open();
        jest.advanceTimersByTime(300);

        const btn = document.createElement('button');
        panel.appendChild(btn);
        btn.focus();
        panel.dispatchEvent(new Event('focusin'));

        manager.close({ reason: 'blur' });
        jest.advanceTimersByTime(300);

        expect(manager.phase).toBe('open');
    });

    test('T7c: pointerdown en el panel anula un cierre pendiente (reemplaza el hack)', () => {
        manager.open();
        jest.advanceTimersByTime(300);

        manager.close({ reason: 'blur' });
        jest.advanceTimersByTime(100);

        panel.dispatchEvent(new Event('pointerdown'));
        jest.advanceTimersByTime(400);

        expect(manager.phase).toBe('open');
    });

    test('T8: destroy cancela cierres pendientes y apaga la instancia', () => {
        manager.open();
        jest.advanceTimersByTime(300);

        manager.close({ reason: 'blur' });
        manager.destroy();

        expect(() => jest.advanceTimersByTime(500)).not.toThrow();
        expect(hooks.onClosed).not.toHaveBeenCalled();
        expect(manager.isOpen).toBe(false);

        manager.open(); // no-op tras destroy
        expect(manager.phase).toBe('closed');
    });

    test('T9: dos instancias son completamente independientes', () => {
        const otherPanel = document.createElement('div');
        document.body.appendChild(otherPanel);
        const other = new VisibilityManager({ panel: () => otherPanel });

        try {
            manager.open();
            other.open();
            jest.advanceTimersByTime(300);

            manager.close();
            jest.advanceTimersByTime(300);

            expect(otherPanel.classList.contains('content-pagination-visible')).toBe(true);
            expect(otherPanel.hasAttribute('hidden')).toBe(false);
            expect(panel.classList.contains('content-pagination-visible')).toBe(false);
            expect(otherPanel.classList.contains('content-pagination-hidden')).toBe(true);
        } finally {
            other.destroy();
            otherPanel.remove();
        }
    });
});