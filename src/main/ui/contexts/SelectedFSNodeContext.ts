import { createContext } from "preact";

const SelectedFSNodeContext = createContext<string | undefined>(undefined);

export default SelectedFSNodeContext;
