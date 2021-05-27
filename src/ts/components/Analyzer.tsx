import { Component } from "preact";
import FileTreeView from "./FileTreeView";
import ExtensionDetails from "./ExtensionDetails";
import { Details } from "../AMOAPI";
import { createFileTree, TreeFolder } from "../FileTree";
import * as AMOAPI from "../AMOAPI";
import * as zip from "@zip.js/zip.js";

type Props = {
    extension: string;
};

type State = {
    details?: Details,
    files?: TreeFolder
};

export default class Analyzer extends Component<Props, State> {
    public constructor(props: Props) {
        super(props);
    }

    public async componentWillMount() {
        const details = await AMOAPI.getInfo(this.props.extension)
        this.setState({details});

        const data = details.current_version.files.filter(
            (file) => file.is_webextension
        )[0];

        //@ts-ignore
        const reader = new zip.ZipReader(new zip.HttpReader(data.url));

        const files = createFileTree(await reader.getEntries());
        this.setState({files});

        await reader.close();
    }

    public render() {
        const state = this.state;
        return <div>
            <h2>Analyzer</h2>
            {
                state.details ? <ExtensionDetails details={state.details} /> : null
            }
            {
                state.files ? <FileTreeView data={state.files} /> : null
            }
            
        </div>;
    }
}
