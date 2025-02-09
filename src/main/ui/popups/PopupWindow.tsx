import type { ComponentChildren, FunctionComponent } from "preact";

import * as Preact from "preact";
import type { ExtensionData } from "../../../extension/types/ExtensionData";

import "./popup-window.css";
import { useRef } from "preact/hooks";

export const popupRoot = document.createElement("div");
popupRoot.id = "popup-root";

const popupWindows = new Map<ExtensionId, Set<HTMLElement>>();

export function showPopupWindow(extId: ExtensionId, options: PopupWindowOptions): Promise<void> {
  const popup = document.createElement("aside");
  popup.role = "dialog";
  popup.classList.add("popup-window");
  if (options.color) {
    popup.style.setProperty("--color", options.color);
  }

  // Hide element until its size has been computed.
  popup.style.visibility = "hidden";

  popup.addEventListener("click", (e) => e.stopPropagation());
  popupRoot.append(popup);

  // Window movement & resizing code.
  const createMoveOrResizeFn = (resize: boolean) => (e: MouseEvent) => {
    e.stopPropagation();
    popup.classList.add("moving");

    if (popupRoot.lastElementChild !== popup) {
      // Move node so its the last child (and thus on top of other popup windows).
      popupRoot.append(popup);
    }

    const rect = popup.getBoundingClientRect();
    let x = resize ? rect.width : rect.x;
    let y = resize ? rect.height : rect.y;

    const moveCallback = (e: MouseEvent) => {
      x += e.movementX;
      y += e.movementY;
      if (resize) {
        updatePopupSize(popup, x, y);
      } else {
        updatePopupPosition(popup, rect, x, y);
      }

      // Avoid accidental text selection.
      window.getSelection()?.removeAllRanges();
    };

    const cleanup = () => {
      popup.classList.remove("moving");
      window.removeEventListener("mousemove", moveCallback);
      window.removeEventListener("mouseup", cleanup);
      window.removeEventListener("mouseleave", cleanup);
    };

    window.addEventListener("mousemove", moveCallback);
    window.addEventListener("mouseup", cleanup);
    window.addEventListener("mouseleave", cleanup);
  };

  // Register popup window.
  const extWindows = popupWindows.get(extId) ?? new Set();
  extWindows.add(popup);
  popupWindows.set(extId, extWindows);

  return new Promise((resolve) => {
    const closeFn = async () => {
      popup.classList.add("closing");
      await popup.animate(
        [
          { opacity: 1, transform: "scale(1, 1)" },
          { opacity: 0, transform: "scale(0.8,0.8)" }
        ],
        { duration: 100, easing: "ease-in" }
      ).finished;
      Preact.render(null, popup);
      popup.remove();
      extWindows.delete(popup);
      resolve();
    };

    Preact.render(
      <InnerPopup
        title={options.title}
        icon={options.icon}
        closeFn={closeFn}
        moveStartFn={createMoveOrResizeFn(false)}
        resizeStartFn={createMoveOrResizeFn(true)}
      >
        {options.content}
      </InnerPopup>,
      popup
    );

    // Compute size & position.
    if (options.initialWidth !== undefined) {
      popup.style.width = `${Math.min(options.initialWidth, window.innerWidth)}px`;
    }
    if (options.initialHeight !== undefined) {
      popup.style.height = `${Math.min(options.initialHeight, window.innerHeight)}px`;
    }
    const rect = popup.getBoundingClientRect();
    const x = Math.floor(0.5 * (window.innerWidth - rect.width));
    const y = Math.floor(0.5 * (window.innerHeight - rect.height));

    popup.animate(
      [
        { opacity: 0, transform: "scale(0.9,0.9)" },
        { opacity: 1, transform: "scale(1, 1)" }
      ],
      { duration: 225, easing: "ease-out" }
    );

    // Show popup and move it to the computed position.
    popup.style.top = `${y}px`;
    popup.style.left = `${x}px`;
    popup.style.removeProperty("visibility");

    // Move focus to popup window.
    setTimeout(() => popup.focus(), 1000); // TODO: doesn't work
  });
}

const InnerPopup: FunctionComponent<IMProps> = ({
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
    const popup = contentRef.current.parentElement!;
    const focused = document.activeElement;
    if (popup.contains(focused)) {
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

function updatePopupPosition(popup: HTMLElement, rect: DOMRect, x: number, y: number): void {
  const safeX = Math.max(0, Math.min(x, window.innerWidth - rect.width));
  const safeY = Math.max(0, Math.min(y, window.innerHeight - rect.height));

  popup.style.top = `${safeY}px`;
  popup.style.left = `${safeX}px`;
}

function updatePopupSize(popup: HTMLElement, width: number, height: number): void {
  popup.style.width = `${Math.round(width)}px`;
  popup.style.height = `${Math.round(height)}px`;
}

window.addEventListener("resize", () => {
  const allWindows = Array.from(popupWindows.values()).flatMap((wnds) => Array.from(wnds.values()));
  for (const popup of allWindows) {
    // Move windows s.t. they stay in the viewbox if possible.
    const rect = popup.getBoundingClientRect();
    const x = Number.parseInt(popup.style.left, 10);
    const y = Number.parseInt(popup.style.top, 10);
    updatePopupPosition(popup, rect, x, y);
  }
});

export type PopupWindowOptions = {
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
