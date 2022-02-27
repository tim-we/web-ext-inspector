import { FunctionalComponent as FC } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import * as LFP from "../utils/LocalFileProvider";
import { Link, useLocation } from "wouter-preact";
import UIBox from "./UIBox";

const ExtensionSelector: FC = () => {
    const navigate = useLocation()[1];
    const fileRef = useRef<HTMLInputElement>(null);
    const files = fileRef.current?.files;

    const [amoId, setAMOId] = useState("");
    const [cwsId, setCWSId] = useState("");
    const [fileSelected, setFileSelected] = useState(false);

    const createSubmitHandler = (
        prefix: string,
        id: string,
        before: (id: string) => void = () => {}
    ) => {
        return (e: Event) => {
            e.preventDefault();
            const urlId = encodeURIComponent(id.trim());
            if (urlId === "") {
                return;
            }
            before(urlId);

            if (urlId) {
                navigate(prefix + urlId);
            }
        };
    };

    useEffect(() => void (document.title = "Extension Inspector"), []);

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
                            onSubmit={createSubmitHandler(
                                "/inspect/firefox/",
                                amoId
                            )}
                        >
                            <label for="extension-slug">
                                addons.mozilla.org/en-US/firefox/addon/
                            </label>
                            <input
                                id="extension-slug"
                                type="text"
                                value={amoId}
                                placeholder="extension id"
                                onInput={(e) =>
                                    setAMOId(
                                        (e.target as HTMLInputElement).value
                                    )
                                }
                            />
                            {amoId.trim().length > 0 ? (
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
                            onSubmit={createSubmitHandler(
                                "/inspect/chrome/",
                                cwsId
                            )}
                        >
                            <label for="extension-id">
                                chrome.google.com/webstore/detail/*/
                            </label>
                            <input
                                id="extension-id"
                                type="text"
                                value={cwsId}
                                placeholder="extension id"
                                onInput={(e) =>
                                    setCWSId(
                                        (e.target as HTMLInputElement).value
                                    )
                                }
                            />
                            {cwsId.trim().length === 32 ? (
                                <button type="submit">Inspect</button>
                            ) : null}
                        </form>
                    </li>
                    <li>
                        or select a local file:
                        <form
                            onSubmit={createSubmitHandler(
                                "/inspect/file/",
                                fileSelected ? files![0].name : "",
                                (id) => {
                                    LFP.addFile(files![0], id);
                                }
                            )}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".zip,.xpi,.crx"
                                onChange={() => {
                                    setFileSelected(
                                        fileRef.current!.files != null &&
                                            fileRef.current!.files.length === 1
                                    );
                                }}
                            />
                            {fileSelected ? (
                                <button type="submit">Inspect</button>
                            ) : null}
                        </form>
                    </li>
                </ul>
                <span class="info">
                    You can integrate this tool into the offical add-on website
                    with an{" "}
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
};

export default ExtensionSelector;

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
