import puppeteer from 'puppeteer';

/** @template T,S */
export default async function findUnseenItem(
  /** @type {puppeteer.ElementHandle} */ container,
  /** @type {string} */ selector,
  /** @type {(element: puppeteer.ElementHandle) => T} */ browserProjector,
  /** @type {(projection: T) => S} */ nodeProjector,
  /** @type {(projection: S) => boolean} */ predicate
) {
  const elements = await container.$$(selector);
  /** @type {T[]} */
  const browserProjections = await Promise.all(elements.map(element => element.evaluate(browserProjector)));
  const nodeProjections = browserProjections.map(nodeProjector);
  const index = nodeProjections.findIndex(predicate);
  if (index === -1) {
    return null;
  }

  const number = index + 1;
  const length = elements.length;
  const element = elements[index];
  const browserProjection = browserProjections[index];
  const nodeProjection = nodeProjections[index];
  return { index, number, length, element, browserProjection, nodeProjection };
}
