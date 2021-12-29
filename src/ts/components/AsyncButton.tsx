import { Component, ComponentChild } from "preact";

type ABProps = {
    onClick?: (e: MouseEvent) => Promise<void>;
    classes?: string[];
    description?: string;
};

type ABState = {
    enabled: boolean;
};

export default class AsyncButton extends Component<ABProps, ABState> {
    constructor(props: ABProps) {
        super(props);
        this.state = { enabled: true };
    }

    public render(): ComponentChild {
        const props = this.props;
        const classStr = (props.classes ?? []).join(" ");
        return (
            <button
                class={classStr}
                onClick={this.onClick.bind(this)}
                disabled={!this.state.enabled}
                title={props.description}
            >
                {props.children}
            </button>
        );
    }

    private onClick(e: MouseEvent): void {
        e.stopPropagation();
        if (this.state.enabled && this.props.onClick) {
            this.setState({ enabled: false }, () => {
                this.props.onClick!(e).finally(() =>
                    this.setState({ enabled: true })
                );
            });
        }
    }
}
