import { signal } from "@preact/signals";
import type { Session } from "../Session";
import type SessionProxy from "../SessionProxy";

const sessionStore = signal(new Map<string, SessionProxy>());

export const useSessionStore = () => {
  return {
    sessions: Array.from(sessionStore.value.values()),
    addSession,
    removeSession
  };
};

function addSession(extension: SessionProxy) {
  // Create a modified copy.
  const newMap = new Map(sessionStore.value);
  newMap.set(extension.id, extension);
  // Update store (trigger reactivity)
  sessionStore.value = newMap;
}

function removeSession(id: Session["id"]) {
  // Create a modified copy.
  const newMap = new Map(sessionStore.value);
  newMap.delete(id);
  // Update store (trigger reactivity)
  sessionStore.value = newMap;
}
