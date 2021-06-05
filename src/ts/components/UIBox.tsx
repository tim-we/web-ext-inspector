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

        return (
            <section class={classes.join(" ")}>
                <div class="title-bar" role="heading" onClick={clickHandler}>
                    {this.props.title}
                </div>
                {this.state.expanded ? (
                    <div class="box-content">{this.props.children}</div>
                ) : null}
            </section>
        );
    }
}