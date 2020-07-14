import puppeteer from 'puppeteer';
import fs from 'fs';

void async function () {
  const browser = await puppeteer.launch({ headless: false });
  try {
    try {
      // Create the data directory which keeps track of already backed up messages
      await fs.promises.mkdir('data');
    }
    catch (error) {
      // Ignore failure to create the data directory if it already exists
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }

    const [page] = await browser.pages();

    // Visit the site and wait for the redirect to the authentication method choice
    await page.goto('https://www.mojedatovaschranka.cz/');

    // Wait for the "Přihlášení mobilním klíčem" tab to appear and click it
    const prihlaseniMobilnimKlicemA = await page.waitForSelector('#loginTabHeadMep > a');
    await prihlaseniMobilnimKlicemA.click();

    // Instruct the user to use the mobile app
    console.log('Use the Mobilni klic ISDS app to sign in!');

    // Wait for the user to have signed in using the mobile app and the list to show
    await page.waitForSelector('#selectUserList');

    const boxes = [];
    for (const div of await page.$$('#selectUserList .recipient-list__row')) {
      const name = (await div.evaluate(d => d.textContent)).replace(/\n+/g, ' ').trim();
      const url = await div.$eval('a', a => a.href);
      boxes.push({ name, url });
    }

    // TODO: See if maybe the QR needs to be scanned for each individually
    console.log(`Found ${boxes.length} boxes.`);
    for (const box of boxes) {
      // Go to the box message list page
      console.log('Backing up', box.name);

      // TODO: Handle the "Boxes you can log in with your phone" screen
      await page.goto(box.url);

      // Wait for the message list page to load and the list to appear
      await page.waitForSelector('seznam-zprav');

      // Capture the list page URL as we will be going back to it from each message
      const url = await page.url();

      // Keep track of whether we have found a new message so know when to quit
      let hadNew = false;

      // Keep checking out messages one by one as long as we keep finding new ones
      do {
        console.log('Looking for messages');
        for (const message of await page.$$('zprava')) {
          const sender = await message.$eval('.messages-list__item-left__databox', div => div.textContent);
          const subject = await message.$eval('.messages-list__item-left__subject', div => div.textContent);
          const stamp = await message.$eval('.messages-list__item-right__datetime', div => div.textContent);
          const id = await message.$eval('.messages-list__item-right__note', div => div.textContent);
          console.log('Found a message:', sender, subject, stamp, id);

          // TODO: Load data/${id}.json and if not exists or different from { sender, subject, stamp } then new
          const isNew = false;

          if (isNew) {
            // TODO: Visit the message page and download content and attachments to data/${id}/
            console.log('Backed up a message from XY');

            // Go back to message list page and search for more new messages
            await page.goto(url);
            hadNew = true;
          }
        }

        // Repeat as long as we keep finding new messages in the list
      } while (hadNew);
    }

    console.log('Done');
  }
  finally {
    await browser.close();
  }
}()
