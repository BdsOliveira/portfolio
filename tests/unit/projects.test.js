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
  projectFullCaseStudy,
  projectMinimal,
  projectNoCaseStudy,
  projectPartialCaseStudy,
  projectPartsOutOfOrder,
  projectCaseStudyLinkOnly,
  projectWithoutField,
  WORK_OPTIONAL_FIELDS,
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
      assert.match(error.message, /WorkEntry/i);
      assert.match(error.message, /title/);
      assert.match(error.message, /fixture-broken/);
      return true;
    });
  });

  /** Contracts W3-1 … W3-11 — the case-study behaviour feature 003 adds. */
  describe('as a case study', () => {
    test('W3-1 · an entry with only title and description renders a complete card', () => {
      const host = render(projectMinimal);

      assert.equal(host.querySelectorAll('li').length, 1);
      assert.equal(host.querySelector('h3').textContent, projectMinimal[0].title);
      assert.match(host.textContent, new RegExp(projectMinimal[0].description));

      assert.equal(host.querySelectorAll('dl').length, 0, 'a minimal entry grew a case study');
      assert.equal(host.querySelectorAll('[data-technology]').length, 0);
      assert.equal(host.querySelectorAll('a').length, 0);
      assert.equal(host.querySelectorAll('img').length, 0);
    });

    test('W3-2 · an absent isVisible means visible', () => {
      // Only an explicit `false` hides an entry. Treating `undefined` as hidden would make
      // FR-021's "only title and description are required" a lie.
      assert.equal(projectMinimal[0].isVisible, undefined);
      assert.equal(render(projectMinimal).querySelectorAll('li').length, 1);
    });

    test('W3-3 · each present part renders as a labelled dt/dd pair', () => {
      const host = render(projectFullCaseStudy);
      const list = host.querySelector('dl.case-study');

      assert.ok(list, 'no case study was rendered');
      assert.equal(list.querySelectorAll('dt').length, 5);
      assert.equal(list.querySelectorAll('dd').length, 5);

      for (const node of list.children) {
        assert.ok(['DT', 'DD'].includes(node.tagName), `${node.tagName} is a direct child of <dl>`);
      }
    });

    test('W3-3 · every label is non-empty and every body carries its field', () => {
      const host = render(projectFullCaseStudy);

      for (const label of host.querySelectorAll('dt')) {
        assert.notEqual(label.textContent.trim(), '', 'an orphaned label was rendered');
      }
      for (const body of host.querySelectorAll('dd')) {
        assert.notEqual(body.textContent.trim(), '');
        assert.ok(body.getAttribute('data-part'), 'a case-study body names no field');
      }
    });

    test('W3-3 · parts read in a fixed order, not the order the data declares them', () => {
      const expected = ['problem', 'solution', 'contribution', 'architecture', 'result'];

      // The fixture declares them backwards. A reader needs the problem before the solution
      // regardless of how the entry's keys happened to be typed.
      const shuffled = [...render(projectPartsOutOfOrder).querySelectorAll('dd')].map((node) =>
        node.getAttribute('data-part'),
      );

      assert.deepEqual(shuffled, expected);
    });

    test('W3-4 · omitting any one optional field produces no empty element', () => {
      for (const field of WORK_OPTIONAL_FIELDS) {
        const rendered = render(projectWithoutField(field));

        assert.ok(rendered, `omitting ${field} removed the entry entirely`);

        const empties = [...rendered.querySelectorAll('*')].filter(
          (node) =>
            node.children.length === 0 &&
            node.textContent.trim() === '' &&
            !['IMG', 'USE', 'SVG', 'BR'].includes(node.tagName),
        );

        assert.deepEqual(
          empties.map((node) => node.tagName),
          [],
          `omitting "${field}" left an empty element behind`,
        );
      }
    });

    test('W3-4 · omitting a case-study part leaves no orphaned label', () => {
      const rendered = render(projectPartialCaseStudy);
      const parts = [...rendered.querySelectorAll('dd')].map((n) => n.getAttribute('data-part'));

      assert.deepEqual(parts, ['problem', 'result']);
      assert.equal(
        rendered.querySelectorAll('dt').length,
        2,
        'a label was rendered for an absent part',
      );
    });

    test('W3-5 · an entry with no parts contains no <dl> at all', () => {
      const rendered = render(projectNoCaseStudy);

      assert.equal(rendered.querySelectorAll('dl').length, 0, 'an empty <dl> was rendered');
    });

    test('W3-6 · tagline renders when present and nothing when absent', () => {
      assert.match(render(projectFullCaseStudy).textContent, /Fixture tagline line\./);

      const without = render(projectWithoutField('tagline'));
      assert.doesNotMatch(without.textContent, /Fixture tagline line\./);
    });

    test('W3-7 · all three link kinds render with destination-identifying names', () => {
      const entry = projectFullCaseStudy[0];
      const rendered = render(projectFullCaseStudy);
      const anchors = [...rendered.querySelectorAll('a')];
      const hrefs = anchors.map((a) => a.getAttribute('href'));

      assert.ok(hrefs.includes(entry.repositoryUrl));
      assert.ok(hrefs.includes(entry.liveUrl));
      assert.ok(hrefs.includes(entry.caseStudyUrl));

      for (const anchor of anchors) {
        const name = anchor.getAttribute('aria-label') ?? anchor.textContent;
        assert.match(name, new RegExp(entry.title), `link name "${name}" omits the entry title`);
      }
    });

    test('W3-7 · a case-study link stands alone', () => {
      const rendered = render(projectCaseStudyLinkOnly);
      const anchors = [...rendered.querySelectorAll('a')];

      assert.equal(anchors.length, 1);
      assert.equal(anchors[0].getAttribute('href'), projectCaseStudyLinkOnly[0].caseStudyUrl);
    });

    test('W3-7 · no links container when every URL is absent', () => {
      assert.equal(render(projectNoLinks).querySelectorAll('.project-card__links').length, 0);
    });

    test('W3-10 · display order is array order', () => {
      const collection = [...projectMinimal, ...projectNoCaseStudy];
      const forward = textsOf(render(collection), 'li h3');
      const reversed = textsOf(render([...collection].reverse()), 'li h3');

      assert.deepEqual(forward, collection.map((entry) => entry.title));
      assert.deepEqual(reversed, [...forward].reverse());
    });

    test('W3-11 · each entry is titled by exactly one <h3>', () => {
      const rendered = render(projectFullCaseStudy);

      assert.equal(rendered.querySelectorAll('h3').length, 1);
      assert.equal(rendered.querySelectorAll('h1, h2, h4, h5, h6').length, 0);
    });
  });
});
