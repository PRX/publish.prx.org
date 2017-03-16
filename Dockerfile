FROM mhart/alpine-node:6.9.2

MAINTAINER PRX <sysadmin@prx.org>

ENV TINI_VERSION v0.9.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

ENV APP_HOME /app
ENV PHANTOM true
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME
EXPOSE 4200

ENTRYPOINT ["/tini", "--", "./bin/application"]
CMD [ "serve" ]

ADD ./package.json ./
RUN apk --update add curl && \
  curl -Ls "https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz" | tar xz -C / && \
  npm install --unsafe-perm --loglevel error && \
  apk del curl && \
  npm cache clean && \
  rm -rf /usr/share/man /tmp/* /var/tmp/* /var/cache/apk/* /root/.npm /root/.node-gyp

ADD . ./
RUN npm run build
