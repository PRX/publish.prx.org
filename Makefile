run:
	npm run serve

build:
	npm run build

test:
	PHANTOM=1 npm run testonce

clean:
	rm -rf node_modules

install:
	yarn install

all: clean install build

.PHONY: run build test clean install all
