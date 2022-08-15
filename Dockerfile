FROM mhart/alpine-node:14.15.5

LABEL maintainer="PRX <sysadmin@prx.org>"
LABEL org.prx.app="yes"
LABEL org.prx.spire.publish.ecr="WEB_SERVER"

ENV APP_HOME /app
ENV PHANTOM true
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME
EXPOSE 4200

ENTRYPOINT [ "./bin/application" ]
CMD [ "serve" ]

ADD ./package.json ./
ADD ./yarn.lock ./
RUN apk --no-cache add curl fontconfig && \
  echo "downloading phantomized..." && \
  curl -Ls "https://github.com/dustinblackman/phantomized/releases/download/2.1.1a/dockerized-phantomjs.tar.gz" | tar xz -C / && \
  echo "downloaded success!" && \
  yarn install

ADD . ./
RUN npm run build
