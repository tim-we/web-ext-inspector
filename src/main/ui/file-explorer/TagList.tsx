import { FunctionComponent } from "preact";

import "./tag-list.scss";

type TLProps = { tags: string[]; showAll?: boolean };

const ignoreTags = new Set(["code", "image", "text", "html", "stylesheet"]);

const TagList: FunctionComponent<TLProps> = ({ tags, showAll }) => {
  const tagsToShow = showAll ? tags : tags.filter((tag) => !ignoreTags.has(tag));
  return (
    <span class="tags">
      {tagsToShow.map((tag) => (
        <Tag key={tag} tag={tag} />
      ))}
    </span>
  );
};

export default TagList;

type TagProps = { tag: string };

const tagTooltips: Map<string, string> = new Map([
  ["web", "web accessible resource"],
  ["background", "background script or page"],
  ["content", "content script"]
]);

const Tag: FunctionComponent<TagProps> = ({ tag }) => (
  <span class={`tag ${tag}`} title={tagTooltips.get(tag)}>
    {tag}
  </span>
);
