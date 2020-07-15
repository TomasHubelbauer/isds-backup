import puppeteer from 'puppeteer';
import makeDirectoryIfNotExists from './makeDirectoryIfNotExists.js';
import extractMessage from './extractMessage.js';
import extractBox from './extractBox.js';
import readFileIfExists from './readFileIfExists.js';
import findUnseenItem from './findUnseenItem.js';
import writeFile from './writeFile.js';
import __dirname from './__dirname.js';
import path from 'path';

void async function () {
  /** @type {puppeteer.Browser} */
  let browser;
  try {
    await makeDirectoryIfNotExists(path.join(__dirname, 'data'));

    /** @type {string[]} */
    const boxes = [];
    while (true) {
      browser = await puppeteer.launch({ headless: false });
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

      const box = await findUnseenItem(page, '#selectUserList .recipient-list__row', extractBox, box => !boxes.includes(box.id));
      if (!box) {
        console.log('No more boxes');
        break;
      }

      console.log(`Opening box ${box.number}/${box.length} #${box.id}: ${box.name} ${box.user.id}`);
      await makeDirectoryIfNotExists(path.join(__dirname, 'data/' + box.id));
      await writeFile(path.join(__dirname, `data/${box.id}.json`), JSON.stringify({ name: box.name, type: box.type, user: box.user }));

      // Go to the box page in order to start backing up messages
      await box.element.click();

      /** @type {string[]} */
      const messages = [];
      while (true) {
        await page.waitForNavigation();

        // Wait for the message list page to load and the loaded list to appear
        await page.waitForSelector('.messages-list .messages-list__row');

        const message = await findUnseenItem(page, '.messages-list .messages-list__row', extractMessage, message => !messages.includes(message.id));
        if (!message) {
          console.log('No more messages');
          break;
        }

        // Skip the message if it has an up-to-date backup according to its metadata
        const backup = await readFileIfExists(path.join(__dirname, `data/${box.id}/${message.id}.json`));
        const backupCheck = JSON.stringify({ sender: message.sender, subject: message.subject, stamp: message.stamp });
        if (backup === backupCheck) {
          console.log(`Skipping backed-up message ${message.number}/${message.length} #${message.id}: ${message.sender} ${message.subject}`);
          messages.push(message.id);

          // Reload so that we have re-navigation to simplify the loop code even if it is not necessary here
          await page.reload();
          continue;
        }

        console.log(`Opening message ${message.number}/${message.length} #${message.id}: ${message.sender} ${message.subject}`);

        await message.element.click();
        await writeFile(path.join(__dirname, `data/${box.id}/${message.id}.json`), backupCheck);
        await page.screenshot({ path: path.join(__dirname, `data/${box.id}/${message.id}.png`), fullPage: true });

        const attachmentsDiv = await page.$('detail-zpravy');
        if (attachmentsDiv !== null) {
          await makeDirectoryIfNotExists(path.join(__dirname, `data/${box.id}/${message.id}`));
          for (const attachmentDiv of await attachmentsDiv.$$('.message-block__content .row')) {
            const contentType = await attachmentDiv.$eval('.message-block__content-type', div => div.textContent);
            console.log('Downloading attachment', contentType);
            await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: path.join(__dirname, `data/${box.id}/${message.id}/`) });

            const downloadButton = await attachmentDiv.$('button');
            await downloadButton.click();

            // Wait for the file to start downloading
            await page.waitFor(500);
          }
        }

        // Mark this message as seen
        messages.push(message.id);

        // Go back to message list page and search for more new messages
        await page.goBack();
      }

      // Mark this box as seen
      boxes.push(box.id);

      // Bail based on count otherwise the user would have to QR-scan only to find no more boxes
      if (box.number === box.length) {
        break;
      }

      // Wait for all downloads to finish
      // TODO: Wait for the file to appear on disk instead (no `.crdownload`?)
      await page.waitFor(5000);

      await browser.close();
    }

    console.log('Done');
    await browser.close();
  }
  finally {
    //await browser.close();
  }
}()
