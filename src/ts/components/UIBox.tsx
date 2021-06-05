import { Component } from "preact";

type Props = {
    title: string;
    classes?: string[];
    collapsable?: boolean;
};

type State = {
    expanded: boolean;
};

let count = 0;

export default class UIBox extends Component<Props, State> {
    state = { expanded: true };

    public render() {
        const collapsable = this.props.collapsable ?? true;
        let classes = ["ui-box"];

        if (collapsable) {
            classes.push("collapsable");
        }

        if (this.props.classes) {
            classes = classes.concat(this.props.classes);
        }

        if (!this.state.expanded) {
            classes.push("collapsed");
        }

        const clickHandler = collapsable
            ? () =>
                  this.setState(({ expanded }) => ({
                      expanded: !expanded,
                  }))
            : () => {};

        count++;
        const titleId = "uibox-title-bar-" + count;

        return (
            <section class={classes.join(" ")}>
                <button
                    id={titleId}
                    class="title-bar"
                    role="heading"
                    onClick={clickHandler}
                    tabIndex={collapsable ? 0 : -1}
                >
                    {this.props.title}
                </button>
                {this.state.expanded ? (
                    <div class="box-content" aria-labelledby={titleId}>
                        {this.props.children}
                    </div>
                ) : null}
            </section>
        );
    }
}
