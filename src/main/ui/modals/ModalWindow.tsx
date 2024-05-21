import type { ComponentChildren, FunctionComponent } from "preact";

import * as Preact from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";

import "./modal-window.scss";
import { useRef } from "preact/hooks";

export const modalRoot = document.createElement("div");
modalRoot.id = "modal-root";

const modalWindows = new Map<ExtensionId, Set<HTMLElement>>();

export function showModalWindow(extId: ExtensionId, options: ModalWindowOptions): Promise<void> {
  const modal = document.createElement("aside");
  modal.classList.add("modal-window");
  if (options.color) {
    modal.style.setProperty("--color", options.color);
  }

  // Hide element until its size has been computed.
  modal.style.visibility = "hidden";

  modal.addEventListener("click", (e) => e.stopPropagation());
  modalRoot.append(modal);

  // Window movement & resizing code.
  const createMoveOrResizeFn = (resize: boolean) => (e: MouseEvent) => {
    e.stopPropagation();
    modal.classList.add("moving");

    if (modalRoot.lastElementChild !== modal) {
      // Move node so its the last child (and thus on top of other modals).
      modalRoot.append(modal);
    }

    const rect = modal.getBoundingClientRect();
    let x = resize ? rect.width : rect.x;
    let y = resize ? rect.height : rect.y;

    const moveCallback = (e: MouseEvent) => {
      x += e.movementX;
      y += e.movementY;
      if (resize) {
        updateModalSize(modal, x, y);
      } else {
        updateModalPosition(modal, rect, x, y);
      }

      // Avoid accidental text selection.
      window.getSelection()?.removeAllRanges();
    };

    const cleanup = () => {
      modal.classList.remove("moving");
      window.removeEventListener("mousemove", moveCallback);
      window.removeEventListener("mouseup", cleanup);
      window.removeEventListener("mouseleave", cleanup);
    };

    window.addEventListener("mousemove", moveCallback);
    window.addEventListener("mouseup", cleanup);
    window.addEventListener("mouseleave", cleanup);
  };

  // Register modal window.
  const extWindows = modalWindows.get(extId) ?? new Set();
  extWindows.add(modal);
  modalWindows.set(extId, extWindows);

  return new Promise((resolve) => {
    const closeFn = async () => {
      modal.classList.add("closing");
      await modal.animate(
        [
          { opacity: 1, transform: "scale(1, 1)" },
          { opacity: 0, transform: "scale(0.8,0.8)" }
        ],
        { duration: 100, easing: "ease-in" }
      ).finished;
      Preact.render(null, modal);
      modal.remove();
      extWindows.delete(modal);
      resolve();
    };

    Preact.render(
      <InnerModal
        title={options.title}
        icon={options.icon}
        closeFn={closeFn}
        moveStartFn={createMoveOrResizeFn(false)}
        resizeStartFn={createMoveOrResizeFn(true)}
      >
        {options.content}
      </InnerModal>,
      modal
    );

    // Compute size & position.
    if (options.initialWidth !== undefined) {
      modal.style.width = `${Math.min(options.initialWidth, window.innerWidth)}px`;
    }
    if (options.initialHeight !== undefined) {
      modal.style.height = `${Math.min(options.initialHeight, window.innerHeight)}px`;
    }
    const rect = modal.getBoundingClientRect();
    const x = Math.floor(0.5 * (window.innerWidth - rect.width));
    const y = Math.floor(0.5 * (window.innerHeight - rect.height));

    modal.animate(
      [
        { opacity: 0, transform: "scale(0.9,0.9)" },
        { opacity: 1, transform: "scale(1, 1)" }
      ],
      { duration: 225, easing: "ease-out" }
    );

    // Show modal and move it to the computed position.
    modal.style.top = `${y}px`;
    modal.style.left = `${x}px`;
    modal.style.removeProperty("visibility");

    // Move focus to modal window.
    setTimeout(() => modal.focus(), 1000); // TODO: doesn't work
  });
}

const InnerModal: FunctionComponent<IMProps> = ({
  title,
  icon,
  closeFn,
  moveStartFn,
  resizeStartFn,
  children
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const focusHandler = () => {
    if (contentRef.current === null) {
      return;
    }
    const modal = contentRef.current.parentElement!;
    const focused = document.activeElement;
    if (modal.contains(focused)) {
      return;
    }
    contentRef.current.focus();
  };

  return (
    <>
      <header onMouseDown={moveStartFn} onClick={focusHandler}>
        {icon ? <div class={`icon mw-icon-${icon}`} /> : null}
        <h1>{title}</h1>
        <div class="buttons" onMouseDown={(e) => e.stopPropagation()}>
          <button type="button" class="close" title="close window" onClick={closeFn} />
        </div>
      </header>
      <div class="content" ref={contentRef}>
        {children}
      </div>
      <div class="resize-handle" aria-hidden={true} title="resize" onMouseDown={resizeStartFn} />
    </>
  );
};

function updateModalPosition(modal: HTMLElement, rect: DOMRect, x: number, y: number): void {
  const safeX = Math.max(0, Math.min(x, window.innerWidth - rect.width));
  const safeY = Math.max(0, Math.min(y, window.innerHeight - rect.height));

  modal.style.top = `${safeY}px`;
  modal.style.left = `${safeX}px`;
}

function updateModalSize(modal: HTMLElement, width: number, height: number): void {
  modal.style.width = `${Math.round(width)}px`;
  modal.style.height = `${Math.round(height)}px`;
}

window.addEventListener("resize", () => {
  const allWindows = Array.from(modalWindows.values()).flatMap((wnds) => Array.from(wnds.values()));
  for (const modal of allWindows) {
    // Move windows s.t. they stay in the viewbox if possible.
    const rect = modal.getBoundingClientRect();
    const x = Number.parseInt(modal.style.left, 10);
    const y = Number.parseInt(modal.style.top, 10);
    updateModalPosition(modal, rect, x, y);
  }
});

export type ModalWindowOptions = {
  title: string;
  icon?: string;
  content: ComponentChildren;
  initialWidth?: number;
  initialHeight?: number;
  color?: string;
};

type IMProps = {
  title: string;
  icon?: string;
  closeFn: (e: MouseEvent) => void;
  moveStartFn: (e: MouseEvent) => void;
  resizeStartFn: (e: MouseEvent) => void;
};

type ExtensionId = ExtensionData["id"];
