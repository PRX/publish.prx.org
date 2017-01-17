# PRX Publish

This app is used to upload and publish audio for distribution.
Initially, distribution will be to the PRX site and API, podcasts with dynamic ad serving, and embeddable web audio players.

Over time additional distribution channels are planned such as twitter cards and facebook sharing, CMS plugins for producer/station sites, publishing platforms like medium, tumbler, and wordpress.com, APIs like the PMP (Public Media Platform), youtube, and soundcloud.

The current broadcast distribution will also be merged to allow for licensing, subscribing, and distribution to station automation systems. We are also looking into supporting instant articles and AMP for stories published on PRX.

Once published, the other side of the coin is to collect metrics on these channels, and consolidate to provide a complete picture of an episode's impact and audience.

# Install

## API and Backend Dependencies

### Use defaults
To set-up environment custom values, start with these defaults in your `.env` file:
``` sh
cp env-example .env
vim .env
```

You'll definitely need to set the "aws uploading" bucket/folder/signer if you plan
to do any image/audio file uploading.

After this, publish will connect to id.prx.org and cms-staging.prx.tech.

### Use local `cms`
To run cms locally, change the `CMS_HOST` in `.env` to `CMS_HOST=cms.prx.dev`.

###  Use local `id`
To run id locally, change the `AUTH_HOST` in `.env` to `AUTH_HOST=id.prx.dev`.

Next, you will need to create a client application set up, this is easiest to do from the prx.org console:
``` ruby
# start a console for prx.org
cd prx.org
./script/console

# in the console, save a new client application
client = ClientApplication.create(
  :url => "http://publish.prx.dev",
  :callback_url => "http://publish.prx.dev/assets/callback.html",
  :support_url => "http://publish.prx.dev",
  :image_url => "http://s3.amazonaws.com/production.mediajoint.prx.org/public/comatose_files/4625/prx-logo_large.png",
  :description => "publish.prx.dev",
  :template_name => "prx_beta",
  :user_id =>8,
  :name => "publish.prx.dev",
  :auto_grant =>true
)

# get the client.key and set it as AUTH_CLIENT_ID
puts "Add this to .env"
puts "AUTH_CLIENT_ID=#{client.key}"
```

Enter in the client id in `.env`, setting `AUTH_CLIENT_ID` to the value from above.

## Local Install

Due to the complexity of installing node-sass in alpine-linux, it may be easier
to just develop locally for the time being.  Just make sure you have a modern
node version installed (6.x.x, ideally).

``` sh
# install dependencies
npm install

# setup pow proxy (see http://pow.cx/)
echo 4200 > ~/.pow/publish.prx

# dev server
npm start
open http://publish.prx.dev
```

## Docker Install

Or if you really want to, you can develop via docker-compose.
This guide assumes you already have npm, docker and dinghy installed.

TODO: hot reloading not supported yet - this just builds the prod js.

``` sh
# build a docker image
docker-compose build

# install dev dependencies locally, so docker can mount those folders
npm install

# make sure your AUTH_CLIENT_ID is the .docker one
vim .env

# run the docker image, will detect changes to local file system
docker-compose up

# open up a browser to view
open http://publish.prx.docker
```
