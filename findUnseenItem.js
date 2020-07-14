import puppeteer from 'puppeteer';

/** @template T,S */
export default async function findUnseenItem(
  /** @type {puppeteer.ElementHandle} */ container,
  /** @type {string} */ selector,
  /** @type {(element: puppeteer.ElementHandle) => T} */ inPageProjector,
  /** @type {(projection: T) => S} */ outPageProjector,
  /** @type {(projection: S) => boolean} */ predicate
) {
  const elements = await container.$$(selector);
  const inPageProjections = await Promise.all(elements.map(element => element.evaluate(inPageProjector)));
  const outPageProjections = inPageProjections.map(outPageProjector);
  const index = outPageProjections.findIndex(predicate);
  if (index === -1) {
    return null;
  }

  const length = elements.length;
  const element = elements[index];
  const projection = outPageProjections[index];
  return { index, length, element, projection };
}
