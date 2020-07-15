import puppeteer from 'puppeteer';

/** @template T */
export default async function findUnseenItem(
  /** @type {puppeteer.ElementHandle} */ container,
  /** @type {string} */ selector,
  /** @type {(element: puppeteer.ElementHandle) => T} */ projector,
  /** @type {(projection: T) => boolean} */ predicate
) {
  const elements = await container.$$(selector);
  /** @type {T[]} */
  const projections = await Promise.all(elements.map(element => element.evaluate(projector)));
  const index = projections.findIndex(predicate);
  if (index === -1) {
    return null;
  }

  const number = index + 1;
  const length = elements.length;
  const element = elements[index];
  const projection = projections[index];
  return { index, number, length, element, ...projection };
}
