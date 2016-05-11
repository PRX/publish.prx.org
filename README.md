# PRX Publish

This app is used to upload and publish audio for distribution.
Initially, distribution will be to the PRX site and API, podcasts with dynamic ad serving, and embeddable web audio players.

Over time additional distribution channels are planned such as twitter cards and facebook sharing, CMS plugins for producer/station sites, publishing platforms like medium, tumbler, and wordpress.com, APIs like the PMP (Public Media Platform), youtube, and soundcloud.

The current broadcast distribution will also be merged to allow for licensing, subscribing, and distribution to station automation systems. We are also looking into supporting instant articles and AMP for stories published on PRX.

Once published, the other side of the coin is to collect metrics on these channels, and consolidate to provide a complete picture of a story's impact and audience.

# Install

This local dev installation expects that both cms and id are installed locally.
You will need to have an client application setup for publish in id.prx.dev
``` ruby
# start a console for prx.org
cd prx.org
./script/console

# in the console, save a new client application
client = ClientApplication.create(
  :url => "http://publish.prx.docker",
  :callback_url => "http://publish.prx.docker/assets/callback.html",
  :support_url => "http://publish.prx.docker",
  :image_url => "http://s3.amazonaws.com/production.mediajoint.prx.org/public/comatose_files/4625/prx-logo_large.png",
  :description => "publish.prx.docker",
  :template_name => "prx_beta",
  :user_id =>8,
  :name => "publish.prx.docker",
  :auto_grant =>true
)

# get the client.key and set it as AUTH_CLIENT_ID
puts "Add this to .env"
puts "AUTH_CLIENT_ID=#{client.key}"
```

Set-up environment specific values.
Enter in the client id in `AUTH_CLIENT_ID` from above:
``` sh
cp env-example .env
vim .env
```

Now you can install the app dependencies and run it using `npm` and `docker`.
This guide assumes you already have npm, docker and dinghy installed.
``` sh
# start by getting the local files built and installed
npm install

# build a docker image
docker-compose build

# run the docker image, will detect changes to local file system
docker-compose build

# open up a browser to view
open http://publish.prx.docker
```
