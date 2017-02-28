FROM mhart/alpine-node:6.9.2

MAINTAINER PRX <sysadmin@prx.org>

ENV TINI_VERSION v0.9.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

WORKDIR /app
EXPOSE 4200

ADD . ./

# TODO: someday https://github.com/sass/node-sass/issues/1589 will happen,
# and building this will be way faster.
RUN npm set progress=false && \
    npm install --no-optional --unsafe-perm && \
    npm run build

ENTRYPOINT ["/tini", "--", "./bin/application"]
CMD [ "serve" ]
