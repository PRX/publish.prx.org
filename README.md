# PRX Publish

This app is used to upload and publish audio for distribution.
Initially, distribution will be to the PRX site and API, podcasts with dynamic ad serving, and embeddable web audio players.

Over time additional distribution channels are planned such as twitter cards and facebook sharing, CMS plugins for producer/station sites, publishing platforms like medium, tumbler, and wordpress.com, APIs like the PMP (Public Media Platform), youtube, and soundcloud.

The current broadcast distribution will also be merged to allow for licensing, subscribing, and distribution to station automation systems. We are also looking into supporting instant articles and AMP for stories published on PRX.

Once published, the other side of the coin is to collect metrics on these channels, and consolidate to provide a complete picture of a story's impact and audience.

# Install

This local dev installation expects that both cms and id are installed locally.
You will need to have an client application setup for publish in id.prx.dev

[...Put in id details here...]

Set-up environment specific values.
Enter in the client id in `AUTH_CLIENT_ID` from above:
```
cp env-example .env
vim .env
```

Now you can install the app dependencies and run it using `npm`:
```
npm install
npm start
```
