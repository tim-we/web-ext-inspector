import { Component } from "preact";
import * as config from "../config";
import { ConfigOption } from "../config";

type State = {
    open: boolean;
};

export default class ConfigUI extends Component<{}, State> {
    public render() {
        return (
            <div
                id="config"
                class={this.state.open ? "open" : "closed"}
                onClick={() => {
                    if (this.state.open) {
                        this.setState({ open: false });
                    }
                }}
            >
                <button
                    title="open configuration"
                    onClick={(e) => {
                        e.stopPropagation();
                        this.setState((state) => ({ open: !state.open }));
                    }}
                ></button>
                {this.state.open ? (
                    <div id="config-popup" onClick={(e) => e.stopPropagation()}>
                        {config.getAll().map((co) => (
                            <SelectConfigOption option={co} />
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }
}

type COProps = {
    option: ConfigOption;
};

type COState = {
    value: any;
};

abstract class ConfigOptionUI extends Component<COProps, COState> {
    constructor(props: COProps) {
        super(props);
        this.state = { value: config.get(props.option.id) };
    }

    protected setValue(newValue: any): void {
        config.set(this.props.option.id, newValue);
        this.setState({ value: newValue });
    }
}

class SelectConfigOption extends ConfigOptionUI {
    public render() {
        const co = this.props.option;
        const id = "option-" + co.id;

        return (
            <div class="config-option">
                <label for={id}>{co.label}</label>
                <select
                    id={id}
                    value={this.state.value}
                    onChange={(e) =>
                        this.setValue((e.target! as HTMLSelectElement).value)
                    }
                >
                    {co.options.map((o) => (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ))}
                </select>
            </div>
        );
    }
}
