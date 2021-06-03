import { Component } from "preact";

type Props = {
    title: string;
    classes?: string[];
    collapsable?: boolean;
};

type State = {
    expanded: boolean;
};

export default class UIBox extends Component<Props, State> {
    state = { expanded: true };

    public render() {
        let classes = ["ui-box"];

        if (this.props.collapsable) {
            classes.push("collapsable");
        }

        if (this.props.classes) {
            classes = classes.concat(this.props.classes);
        }

        if (!this.state.expanded) {
            classes.push("collapsed");
        }

        const clickHandler = this.props.collapsable
            ? () =>
                  this.setState(({ expanded }) => ({
                      expanded: !expanded,
                  }))
            : () => {};

        return (
            <div class={classes.join(" ")}>
                <div class="title-bar" onClick={clickHandler}>
                    {this.props.title}
                </div>
                {this.state.expanded ? (
                    <div class="content">{this.props.children}</div>
                ) : null}
            </div>
        );
    }
}
