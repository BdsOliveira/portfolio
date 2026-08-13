import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { renderProjects } from '../../js/components/projects.js';
import { createDocument, mountFragment, textsOf } from './_setup.js';
import {
  projects,
  projectSingleTechnology,
  projectNoLinks,
  projectsWithHidden,
  projectsAllHidden,
  projectMissingTitle,
  projectWithImage,
  emptyCollection,
} from '../fixtures/index.js';

const render = (data) => {
  const doc = createDocument();
  const fragment = renderProjects(data, doc);
  return fragment === null ? null : mountFragment(doc, fragment);
};

describe('renderProjects', () => {
  test('renders one list item per visible project, in array order', () => {
    const host = render(projects);
    const titles = textsOf(host, 'li h3');

    assert.deepEqual(
      titles,
      projects.map((project) => project.title),
    );
  });

  test('renders exactly technologies.length chips — never a fixed five', () => {
    const host = render(projects);
    const cards = [...host.querySelectorAll('li')].filter((li) => li.querySelector('h3'));

    cards.forEach((card, index) => {
      const chips = card.querySelectorAll('[data-technology]');
      assert.equal(
        chips.length,
        projects[index].technologies.length,
        `project ${projects[index].id} rendered ${chips.length} chips`,
      );
    });
  });

  test('a single-technology project renders exactly one chip', () => {
    const host = render(projectSingleTechnology);
    assert.equal(host.querySelectorAll('[data-technology]').length, 1);
  });

  test('no chip is ever empty', () => {
    const host = render(projects);
    for (const chip of host.querySelectorAll('[data-technology]')) {
      assert.notEqual(chip.textContent.trim(), '');
    }
  });

  test('filters out isVisible: false entries', () => {
    const host = render(projectsWithHidden);
    assert.doesNotMatch(host.textContent, /Fixture Hidden/);
    assert.equal(textsOf(host, 'li h3').length, projects.length);
  });

  test('returns null when every entry is hidden', () => {
    assert.equal(render(projectsAllHidden), null);
  });

  test('returns null for an empty collection', () => {
    assert.equal(render(emptyCollection), null);
  });

  test('omits the repository and live links when the URLs are absent', () => {
    const host = render(projectNoLinks);
    assert.equal(host.querySelectorAll('a').length, 0);
  });

  test('renders links when the URLs are present, with the real hrefs', () => {
    const host = render([projects[0]]);
    const hrefs = [...host.querySelectorAll('a')].map((a) => a.getAttribute('href'));

    assert.ok(hrefs.includes(projects[0].repositoryUrl));
    assert.ok(hrefs.includes(projects[0].liveUrl));
  });

  test('link accessible names incorporate the project title (FR-043)', () => {
    const host = render([projects[0]]);

    for (const link of host.querySelectorAll('a')) {
      const name = link.getAttribute('aria-label') ?? link.textContent;
      assert.match(name, new RegExp(projects[0].title), `link name "${name}" omits the title`);
      assert.doesNotMatch(name.trim(), /^(GitHub|clique aqui|click here)$/i);
    }
  });

  test('images carry alt, explicit dimensions and lazy loading (contract C-8)', () => {
    const host = render(projectWithImage);
    const image = host.querySelector('img');

    assert.ok(image, 'expected an image to be rendered');
    assert.equal(image.getAttribute('alt'), projectWithImage[0].imageAlt);
    assert.ok(image.getAttribute('width'), 'width attribute missing');
    assert.ok(image.getAttribute('height'), 'height attribute missing');
    assert.equal(image.getAttribute('loading'), 'lazy');
  });

  test('throws naming entity, field and id when a required field is missing', () => {
    const doc = createDocument();
    assert.throws(() => renderProjects(projectMissingTitle, doc), (error) => {
      assert.match(error.message, /Project/i);
      assert.match(error.message, /title/);
      assert.match(error.message, /fixture-broken/);
      return true;
    });
  });
});
