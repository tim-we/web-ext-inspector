import { Component } from "preact";

type Props = {
    onSelect: (slug: string) => void;
};

type State = {
    extension: string;
};

export default class ExtensionSelector extends Component<Props, State> {
    state = { extension: "" };

    public render() {
        const ext = this.state.extension;
        return (
            <div class="extension-selector">
                <form onSubmit={this.onSubmit.bind(this)}>
                    <label for="extension-slug">Extension slug</label>
                    <input
                        id="extension-slug"
                        type="text"
                        value={ext}
                        placeholder="tabs-aside"
                        onInput={this.onInput.bind(this)}
                    />
                    {ext.trim().length > 0 ? (
                        <button type="submit">Inspect</button>
                    ) : null}
                </form>
            </div>
        );
    }

    private onInput(e: Event) {
        const target = e.target as HTMLInputElement;
        this.setState({ extension: target.value });
    }

    private onSubmit(e: Event) {
        e.preventDefault();
        const ext = this.state.extension.trim();

        if (ext) {
            this.props.onSelect(ext);
        }
    }
}
