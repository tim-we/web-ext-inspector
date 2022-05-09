import { Component } from "preact";
import { getRecent } from "../inspector/CacheHelper";
import { ExtensionCacheInfo } from "../types/ExtensionCache";
import UIBox from "./UIBox";
import { Link } from "wouter-preact";
import { ExtensionId } from "../types/ExtensionId";

type State = {
    extensions: ExtensionCacheInfo[];
};

export class RecentExtensions extends Component<{}, State> {
    public constructor() {
        super();

        this.state = { extensions: [] };
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
            <UIBox key="recent-extensions" title="Recently viewed extensions">
                <ul>
                    {this.state.extensions.map((e) => (
                        <li>
                            <Link href={extIdToURL(e.id)}>{e.name}</Link>
                        </li>
                    ))}
                </ul>
            </UIBox>
        );
    }
}

function extIdToURL(id: ExtensionId): string {
    if (id.source === "url") {
        return "/inspect/url/" + encodeURIComponent(id.url);
    }

    return `/inspect/${id.source}/${id.id}`;
}
