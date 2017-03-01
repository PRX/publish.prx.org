FROM mhart/alpine-node:6.9.2

MAINTAINER PRX <sysadmin@prx.org>

ENV TINI_VERSION v0.9.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

WORKDIR /app
EXPOSE 4200

ADD . ./

RUN npm set progress=false && \
    npm install --no-optional --unsafe-perm && \
    npm run build

ENTRYPOINT ["/tini", "--", "./bin/application"]
CMD [ "serve" ]
