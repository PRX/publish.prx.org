FROM mhart/alpine-node:6.9.2

MAINTAINER PRX <sysadmin@prx.org>

ENV TINI_VERSION v0.9.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

WORKDIR /app
EXPOSE 4200

ADD . ./

RUN apk --update add --virtual build-dependencies git python build-base curl bash && \
  curl -Ls "https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz" | tar xz -C / && \
  npm install --unsafe-perm --loglevel error && \
  npm run build && \
  apk del build-dependencies && \
  npm cache clean && \
  rm -rf /usr/share/man /tmp/* /var/tmp/* /var/cache/apk/* /root/.npm /root/.node-gyp

ENV PHANTOM true
ENTRYPOINT ["/tini", "--", "./bin/application"]
CMD [ "serve" ]
