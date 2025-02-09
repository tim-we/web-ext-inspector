import { createContext } from "preact";

// TODO: consider ExtensionData instead of just the id
const ExtensionIdContext = createContext<string | undefined>(undefined);

export default ExtensionIdContext;
