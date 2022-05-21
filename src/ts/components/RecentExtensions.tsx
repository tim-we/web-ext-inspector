import { Component } from "preact";
import { getRecent, removeFromCache } from "../inspector/CacheHelper";
import { ExtensionCacheInfo } from "../types/ExtensionCache";
import UIBox from "./UIBox";
import { Link } from "wouter-preact";
import { ExtensionId } from "../types/ExtensionId";

type State = {
    extensions: ExtensionCacheInfo[];
};

let updateRecentExtensions = (extensions: ExtensionCacheInfo[]) => {};

export class RecentExtensions extends Component<{}, State> {
    public constructor() {
        super();

        this.state = { extensions: [] };

        updateRecentExtensions = (extensions: ExtensionCacheInfo[]) =>
            this.setState({ extensions });
    }

    componentWillMount() {
        getRecent().then((extensions) => {
            this.setState({ extensions });
        });
    }

    render() {
        if (this.state.extensions.length === 0) {
            return null;
        }

        return (
            <UIBox
                key="recent-extensions"
                title="Recently viewed extensions"
                classes={["extension-selector"]}
            >
                <ul>
                    {this.state.extensions.map((e) => (
                        <li key={e.id.source === "url" ? e.id.url : e.id.id}>
                            <RecentExtension info={e} />
                        </li>
                    ))}
                </ul>
            </UIBox>
        );
    }
}

function RecentExtension(props: { info: ExtensionCacheInfo }) {
    const e = props.info;
    return (
        <div class="recent-extension">
            <Link href={extIdToURL(e.id)} class="title">{e.name}</Link>
            <span class="version">{`version ${e.version}`}</span>
            <button
                onClick={async () => {
                    removeFromCache(e.id);
                    updateRecentExtensions(await getRecent());
                }}
                class="remove"
            >
                remove
            </button>
        </div>
    );
}

function extIdToURL(id: ExtensionId): string {
    if (id.source === "url") {
        return "/inspect/url/" + encodeURIComponent(id.url);
    }

    return `/inspect/${id.source}/${id.id}`;
}
