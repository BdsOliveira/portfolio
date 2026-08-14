/**
 * Bootstraps a linkedom document for injection into components.
 *
 * Components take `doc` as an argument (contract: shared signature) precisely so they can be
 * exercised here without a browser.
 */
import { parseHTML } from 'linkedom';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));

/** A blank document. The default for component tests — they must not depend on page markup. */
export function createDocument(html = '<!DOCTYPE html><html><body></body></html>') {
  return parseHTML(html).document;
}

/** The real index.html, for page-level assertions. */
export function loadIndexDocument() {
  return parseHTML(readFileSync(`${REPO_ROOT}index.html`, 'utf8')).document;
}

/** Wrap a returned fragment in a container so querySelector works against it. */
export function mountFragment(doc, fragment) {
  const host = doc.createElement('div');
  host.append(fragment);
  return host;
}

/** Collect textContent of every match, trimmed. */
export function textsOf(root, selector) {
  return [...root.querySelectorAll(selector)].map((node) => node.textContent.trim());
}
