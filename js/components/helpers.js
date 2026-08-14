/**
 * Shared rendering helpers.
 *
 * A sibling module rather than duplication: `requireFields` has six known consumers
 * (every component) and `el` has more. Neither is speculative — both exist because the
 * second real consumer already exists (constitution III).
 */

/**
 * Assert that every required field is present on an entity.
 *
 * Contract C-6: a missing required field throws an Error naming the entity type, the
 * field, and the entity's id, so the failure points straight at the data file to fix.
 *
 * @param {object} entity
 * @param {string[]} fields
 * @param {string} entityName
 * @throws {Error} when any field is absent, null, or an empty string/array
 */
export function requireFields(entity, fields, entityName) {
  if (entity === null || typeof entity !== 'object') {
    throw new Error(`${entityName}: expected an object, received ${describe(entity)}`);
  }

  const id = 'id' in entity ? String(entity.id) : '(no id)';

  for (const field of fields) {
    const value = entity[field];
    const missing =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    if (missing) {
      throw new Error(
        `${entityName} "${id}": required field "${field}" is missing or empty ` +
          `(received ${describe(value)})`,
      );
    }
  }
}

/**
 * Build an element. Text is always set via `textContent` — never `innerHTML` (contract C-7).
 *
 * @param {Document} doc
 * @param {string} tag
 * @param {object} [props]
 * @param {string} [props.text]        textContent
 * @param {string} [props.className]   class attribute
 * @param {Node[]} [props.children]    appended in order
 * @param {object} [props.attrs]       every other attribute, set verbatim
 * @returns {Element}
 */
export function el(doc, tag, props = {}) {
  const { text, className, children, attrs } = props;
  const node = doc.createElement(tag);

  if (className) node.setAttribute('class', className);
  if (text !== undefined) node.textContent = String(text);

  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      if (value === undefined || value === null || value === false) continue;
      node.setAttribute(name, value === true ? '' : String(value));
    }
  }

  if (children) {
    for (const child of children) {
      if (child) node.append(child);
    }
  }

  return node;
}

/**
 * Build an `<svg><use href="#icon-x"></use></svg>` referencing the inlined sprite.
 *
 * Decorative by default (contract C-9): `aria-hidden` unless an explicit `label` is given,
 * in which case the svg carries `role="img"` and an accessible name instead.
 *
 * @param {Document} doc
 * @param {string} iconId  sprite symbol id, with or without the `icon-` prefix
 * @param {string} [label] accessible name; omit for decorative icons beside a text label
 * @returns {Element}
 */
export function icon(doc, iconId, label) {
  const id = iconId.startsWith('icon-') ? iconId : `icon-${iconId}`;
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');

  svg.setAttribute('class', 'icon');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('focusable', 'false');

  if (label) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label);
  } else {
    svg.setAttribute('aria-hidden', 'true');
  }

  const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${id}`);
  svg.append(use);

  return svg;
}

function describe(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (Array.isArray(value)) return `an empty array`;
  return `${typeof value} ${JSON.stringify(value)}`;
}
