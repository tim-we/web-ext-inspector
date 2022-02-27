import { Component, createRef, FunctionalComponent as FC } from "preact";
import * as LFP from "../utils/LocalFileProvider";
import { Link } from "wouter-preact";
import UIBox from "./UIBox";

type State = {
    extAMO: string;
    extCWS: string;
    fileSelected: boolean;
};

export default class ExtensionSelector extends Component<{}, State> {
    state = { extAMO: "", extCWS: "", fileSelected: false };
    fileRef = createRef<HTMLInputElement>();

    public render() {
        const state = this.state;
        return (
            <>
                <UIBox
                    collapsable={false}
                    title="Select Extension"
                    classes={["extension-selector"]}
                >
                    <ul>
                        <li>
                            {"from the "}
                            <a href="https://addons.mozilla.org" data-native>
                                official add-on website
                            </a>
                            :
                            <form
                                class="addon-store-selector"
                                onSubmit={this.onAMOSubmit.bind(this)}
                            >
                                <label for="extension-slug">
                                    addons.mozilla.org/en-US/firefox/addon/
                                </label>
                                <input
                                    id="extension-slug"
                                    type="text"
                                    value={state.extAMO}
                                    placeholder="extension id"
                                    onInput={this.onInputAMO.bind(this)}
                                />
                                {state.extAMO.trim().length > 0 ? (
                                    <button type="submit">Inspect</button>
                                ) : null}
                            </form>
                        </li>
                        <li>
                            {"from the "}
                            <a
                                href="https://chrome.google.com/webstore"
                                data-native
                            >
                                Chrome Web Store
                            </a>
                            :
                            <form
                                class="addon-store-selector"
                                onSubmit={this.onCWSSubmit.bind(this)}
                            >
                                <label for="extension-id">
                                    chrome.google.com/webstore/detail/*/
                                </label>
                                <input
                                    id="extension-id"
                                    type="text"
                                    value={state.extCWS}
                                    placeholder="extension id"
                                    onInput={this.onInputCWS.bind(this)}
                                />
                                {state.extCWS.trim().length === 32 ? (
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
                    <span class="info">
                        You can integrate this tool into the offical add-on
                        website with an{" "}
                        <a
                            href="https://addons.mozilla.org/firefox/addon/extension-inspector"
                            data-native
                        >
                            extension
                        </a>
                        .
                    </span>
                </UIBox>
                <ExampleSelector />
            </>
        );
    }

    componentDidMount() {
        document.title = "Extension Inspector";
    }

    private onInputAMO(e: Event) {
        const target = e.target as HTMLInputElement;
        this.setState({ extAMO: target.value });
    }

    private onInputCWS(e: Event) {
        const target = e.target as HTMLInputElement;
        this.setState({ extCWS: target.value });
    }

    private onAMOSubmit(e: Event) {
        e.preventDefault();
        const ext = this.state.extAMO.trim();

        if (ext) {
            customRoute("/inspect/firefox/" + encodeURIComponent(ext));
        }
    }

    private onCWSSubmit(e: Event) {
        e.preventDefault();
        const ext = this.state.extCWS.trim();

        if (ext) {
            customRoute("/inspect/chrome/" + encodeURIComponent(ext));
        }
    }

    private onFileSubmit(e: Event) {
        e.preventDefault();

        const files = this.fileRef.current!.files;

        if (files && files.length === 1) {
            const fileId = LFP.addFile(files[0]);
            customRoute("/inspect/file/" + fileId);
        }
    }
}

type ExampleProps = { name: string; id: string };
const Example: FC<ExampleProps> = ({ id, name }) => (
    <li key={id}>
        inspect <Link href={`/inspect/firefox/${id}`}>{name}</Link>
    </li>
);

const ExampleSelector: FC = () => (
    <UIBox title="Examples" classes={["extension-selector"]}>
        Select one of the examples:
        <ul>
            <Example
                name="I don't care about cookies"
                id="i-dont-care-about-cookies"
            />
            <Example name="Enhancer for YouTube™" id="enhancer-for-youtube" />
            <Example name="Tabs Aside" id="tabs-aside" />
        </ul>
    </UIBox>
);
