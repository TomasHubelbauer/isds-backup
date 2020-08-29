# ISDS Backup

Downloads ISDS messages and attachments by using Puppeteer and the Mobilni klic
ISDS application to sign in using a QR code and crawl all the boxes and their
messages backing up new ones and downloading their attachments.

## Running

`npm start`

## To-Do

### Replace the attachment download timeout with a check for no `.crdownload`

Also probably check the file count in the directory to make sure we don't check
too early - before the file even begins to download and creates `.crdownload`.

### Alert on new messages by pointing them out in the console

### Run headless and have a different UI to present the QR code and progress in
