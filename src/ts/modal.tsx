import { FunctionalComponent as FC, JSX, render } from "preact";

let portal: HTMLElement | null = null;

export function setPortal(modalPortal: HTMLElement): void {
    portal = modalPortal;
}

type ModalProps = {
    title: string;
    classes: string[];
};

const ModalWindow: FC<ModalProps> = (props) => {
    const classes = ["modal-window"].concat(props.classes);
    return (
        <div
            class={classes.join(" ")}
            aria-modal={true}
            onClick={(e) => e.stopPropagation()}
        >
            <div class="title-bar">
                <h2>{props.title}</h2>
                <div class="modal-controls">
                    <button
                        class="close-file"
                        title="close file"
                        aria-label="close file"
                        onClick={() => hideModal()}
                    ></button>
                </div>
            </div>
            <div class="modal-content">{props.children}</div>
        </div>
    );
};

export function showModal(
    title: string,
    classes: string[],
    content: JSX.Element
): void {
    if (portal === null) {
        throw new Error("Modal portal not set.");
    }

    render(
        <ModalWindow title={title} classes={classes}>
            {content}
        </ModalWindow>,
        portal
    );
}

export function hideModal() {
    if (portal) {
        render(null, portal);
    }
}
