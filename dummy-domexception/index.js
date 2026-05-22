export default globalThis.DOMException || class DOMException extends Error { constructor(msg, name) { super(msg); this.name = name; } }
