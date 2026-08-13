import { requireFields, el } from './helpers.js';

const REQUIRED = ['id', 'name', 'skills'];

/**
 * @param {object[]} groups
 * @param {Document} doc
 * @returns {DocumentFragment|null}
 */
export function renderSkills(groups, doc) {
  if (groups.length === 0) return null;

  const list = el(doc, 'ul', { className: 'skill-groups' });
  for (const group of groups) list.append(groupCard(group, doc));

  const fragment = doc.createDocumentFragment();
  fragment.append(list);
  return fragment;
}

function groupCard(group, doc) {
  requireFields(group, REQUIRED, 'SkillGroup');

  return el(doc, 'li', {
    className: 'skill-group card',
    attrs: { 'data-skill-group': group.id },
    children: [
      el(doc, 'h3', { className: 'skill-group__name', text: group.name }),
      el(doc, 'ul', {
        className: 'chip-list',
        children: group.skills.map((skill) =>
          el(doc, 'li', { className: 'chip', text: skill, attrs: { 'data-skill': '' } }),
        ),
      }),
    ],
  });
}
