import { FunctionComponent } from "preact";

type TLProps = { tags: string[]; showAll?: boolean };

const ignoreTags = new Set(["code", "image", "text"]);

const TagList: FunctionComponent<TLProps> = ({ tags, showAll }) => {
    const tagsToShow = showAll
        ? tags
        : tags.filter((tag) => !ignoreTags.has(tag));
    return (
        <span class="tags">
            {tagsToShow.map((tag) => (
                <Tag tag={tag} />
            ))}
        </span>
    );
};

export default TagList;

type TProps = { tag: string };

const Tag: FunctionComponent<TProps> = ({ tag }) => (
    <span class={"tag " + tag}>{tag}</span>
);
