import { createContext } from "preact";

const ExtensionIdContext = createContext<string | undefined>(undefined);

export default ExtensionIdContext;
