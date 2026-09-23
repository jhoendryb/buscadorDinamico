import * as Types from "../types";
/**
 * Máquina de estados finita dueña del ciclo abrir/cerrar del desplegable.
 * Estados: closed -> opening -> open -> closing -> closed.
 * Invariante: máximo UN timer vivo, siempre etiquetado con la generación vigente.
 */
export declare class VisibilityManager {
    #private;
    constructor(options: Types.VisibilityManagerOptions);
    get phase(): Types.DropdownPhase;
    get isOpen(): boolean;
    open(reason?: Types.OpenReason): void;
    close(options?: Types.CloseOptions): void;
    toggle(): void;
    /**
     * Indica que hay una interacción en vuelo sobre el panel (click).
     * Suple el antiguo hack de mutar _isVisible desde appendItems.
     */
    stickForInteraction(): void;
    /** Revierte un cierre en curso (usado por pointerenter/focusin del panel). */
    cancelPendingClose(): void;
    /** Re-sincroniza DOM desde la fase actual (escape hatch). */
    refresh(): void;
    destroy(): void;
}
//# sourceMappingURL=visibilityManager.d.ts.map