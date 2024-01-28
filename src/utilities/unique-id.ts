export default function createUniqueId(): string {
  let id = "";
  for (let i = 0; i < 4; i++) {
    id += Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16);
  }
  return id;
}
