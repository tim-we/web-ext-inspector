import { Component, createRef } from "preact";
import { ExtensionSourceInfo } from "../inspector/worker/worker";
import UIBox from "./UIBox";

type Props = {
    onSelect: (ext: ExtensionSourceInfo) => void;
};

type State = {
    extension: string;
    fileSelected: boolean;
};

export default class ExtensionSelector extends Component<Props, State> {
    state = { extension: "", fileSelected: false };
    fileRef = createRef<HTMLInputElement>();

    public render() {
        const ext = this.state.extension;
        return (
            <UIBox
                collapsable={false}
                title="Select Extension"
                classes={["extension-selector"]}
            >
                <ul>
                    <li>
                        {"from the "}
                        <a href="https://addons.mozilla.org">
                            official add-on website
                        </a>
                        :
                        <form onSubmit={this.onAMOSubmit.bind(this)}>
                            <label for="extension-slug">
                                addons.mozilla.org/en-US/firefox/addon/
                            </label>
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
                    </li>
                    <li>
                        or select a local file:
                        <form onSubmit={this.onFileSubmit.bind(this)}>
                            <input
                                ref={this.fileRef}
                                type="file"
                                accept=".zip,.xpi,.crx"
                                onChange={() =>
                                    this.setState({
                                        fileSelected:
                                            this.fileRef.current!.files !==
                                                null &&
                                            this.fileRef.current!.files
                                                .length === 1,
                                    })
                                }
                            />
                            {this.state.fileSelected ? (
                                <button type="submit">Inspect</button>
                            ) : null}
                        </form>
                    </li>
                </ul>
            </UIBox>
        );
    }

    private onInput(e: Event) {
        const target = e.target as HTMLInputElement;
        this.setState({ extension: target.value });
    }

    private onAMOSubmit(e: Event) {
        e.preventDefault();
        const ext = this.state.extension.trim();

        if (ext) {
            this.props.onSelect({ type: "amo", id: ext });
        }
    }

    private onFileSubmit(e: Event) {
        e.preventDefault();

        const files = this.fileRef.current!.files;

        if (files && files.length === 1) {
            const url = URL.createObjectURL(files[0]);
            this.props.onSelect({ type: "url", url });
        }
    }
}
