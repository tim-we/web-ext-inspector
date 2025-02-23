import { createContext } from "preact";
import type SessionProxy from "../../SessionProxy";

const SessionContext = createContext<SessionProxy | undefined>(undefined);

export default SessionContext;
