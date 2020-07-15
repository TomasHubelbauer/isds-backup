import puppeteer from 'puppeteer';
import makeDirectoryIfNotExists from './makeDirectoryIfNotExists.js';
import collapseWhitespace from './collapseWhitespace.js';
import extractMessageBits from './extractMessageBits.js';
import readFileIfExists from './readFileIfExists.js';
import findUnseenItem from './findUnseenItem.js';
import deriveMessageKey from './deriveMessageKey.js';
import trimPrefix from './trimPrefix.js';

void async function () {
  const browser = await puppeteer.launch({ headless: false });
  try {
    await makeDirectoryIfNotExists('data');

    const [page] = await browser.pages();

    const boxes = [];
    while (true) {
      // Visit the site and wait for the redirect to the authentication method choice
      await page.goto('https://www.mojedatovaschranka.cz/');

      // Wait for the "Přihlášení mobilním klíčem" tab to appear and click it
      const prihlaseniMobilnimKlicemA = await page.waitForSelector('#loginTabHeadMep > a');
      await prihlaseniMobilnimKlicemA.click();

      // Instruct the user to use the mobile app
      console.log('Use the Mobilni klic ISDS app to sign in!');

      // Wait for the user to have signed in using the mobile app and the list to show
      await page.waitForSelector('#selectUserList');

      const box = await findUnseenItem(
        page,
        '#selectUserList .recipient-list__row',
        div => div.textContent,
        textContent => collapseWhitespace(textContent),
        textContent => !boxes.includes(textContent)
      );

      if (!box) {
        console.log('No more boxes');
        break;
      }

      // Mark this box as seen
      console.log(`Opening box ${box.number}/${box.length} ${box.nodeProjection}`);
      boxes.push(box);

      // Go to the box page in order to start backing up messages
      await box.element.click();

      // Wait for the message list page to load and the loaded list to appear
      await page.waitForSelector('.messages-list .messages-list__row');

      // Capture the list page URL as we will be going back to it from each message
      const url = await page.url();

      const messages = [];

      // Keep checking out messages one by one as long as we keep finding new ones
      while (true) {
        const message = await findUnseenItem(
          page,
          '.messages-list .messages-list__row',
          extractMessageBits,
          deriveMessageKey,
          key => !messages.includes(key)
        );

        if (!message) {
          console.log('No more messages');
          break;
        }

        const id = trimPrefix(message.browserProjection.id, 'ID:').trim();
        console.log(`Opening message ${message.number}/${message.length} #${id}: ${message.nodeProjection}`);

        // Skip the message if it has an up-to-date backup according to its metadata
        const backup = await readFileIfExists(`data/${id}.json`);
        if (backup === message.nodeProjection) {
          console.log('Skipping a backed up message:', message.id);
          messages.push(message.nodeProjection);
          break;
        }

        await message.element.click();
        await makeDirectoryIfNotExists(`data/${id}`);

        // TODO: Download attachments to data/${id}/${name}.${ext}
        console.log('Backing up a message', id, message.nodeProjection);
        await page.screenshot({ path: `data/${id}/screenshot.png`, fullPage: true });
        console.log('Backed up a message', id, message.nodeProjection);

        // Go back to message list page and search for more new messages
        await page.goto(url);
      }
    }

    console.log('Done');
  }
  finally {
    //await browser.close();
  }
}()
