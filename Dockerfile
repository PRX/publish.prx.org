FROM mhart/alpine-node:10.15.3

LABEL maintainer="PRX <sysadmin@prx.org>"
LABEL org.prx.app="yes"

# install git, aws-cli
RUN apk --no-cache add git ca-certificates \
  python py-pip py-setuptools groff less && \
  pip --no-cache-dir install awscli

# install PRX aws-secrets scripts
RUN git clone -o github https://github.com/PRX/aws-secrets
RUN cp ./aws-secrets/bin/* /usr/local/bin

ENV TINI_VERSION v0.9.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

ENV APP_HOME /app
ENV PHANTOM true
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME
EXPOSE 4200

ENTRYPOINT [ "/tini", "--", "./bin/application" ]
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
