## environmental_notices

Open data application for Estonian Fund for Nature https://elfond.ee/.

Scrapes official notifications from Estonian government site, parses and filters the results sends them regularily to the mailing list and provides geodata preview.

Implemented in NodeJS.

### Installation

```
npm install
```

Then create a ```config/config.json``` file:

```
{
  "baseUrl": "site_base_url",
  "mailFrom": "mail_to_send_from",
  "mailTo": [
    "mail_to_send_to_1",
    "mail_to_send_to_2"
  ],
  "mailUsername": "gmail_account_to_sent_from",
  "mailPassword": "gmail_account_password"
}
```

### Running

To invoke data scraping:

```
node scraper.js
```

To invoke mailer:

```
node mailer.js
```
