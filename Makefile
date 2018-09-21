TAG ?= latest

REPO := gcr.io/faunadb-cloud/dashboard
GIT_REVISION := $(shell git rev-parse HEAD)
GIT_SHORT := $(shell git rev-parse --short=12 HEAD)
PARENT_DIR := $(shell basename $(shell pwd))

.PHONY: all build run test test-nowatch release-cloud release-enterprise release-staging -check-working-clean

all: run

clean:
	docker-compose rm -fv
	docker volume rm -f $(PARENT_DIR)_root_modules $(PARENT_DIR)_base_modules $(PARENT_DIR)_cloud_modules $(PARENT_DIR)_enterprise_modules

build:
	docker-compose build --pull dashboard
	docker-compose run --rm dashboard npm install --unsafe-perm --quiet

run: build
	docker-compose run --rm dashboard

test: build
	docker-compose run --rm dashboard npm run test

test-nowatch: build
# Set CI env to dummy value so watch is not enabled.
	docker-compose run --rm -e CI=dummy dashboard npm run test

release-cloud: -check-working-clean test-nowatch
	docker build --pull -f Dockerfile.release --build-arg EDITION=cloud --build-arg REVISION=$(GIT_REVISION) -t $(REPO):$(GIT_SHORT)-cloud -t $(REPO):$(TAG)-cloud .
	docker push $(REPO):$(GIT_SHORT)-cloud
	docker push $(REPO):$(TAG)-cloud
	@echo Tag $(GIT_SHORT)-cloud pushed for git revision $(GIT_REVISION).

release-enterprise: -check-working-clean test-nowatch
	docker build --pull -f Dockerfile.release --build-arg EDITION=enterprise --build-arg REVISION=$(GIT_REVISION) -t $(REPO):$(GIT_SHORT)-enterprise -t $(REPO):$(GIT_SHORT) -t $(REPO):$(TAG)-enterprise -t $(REPO):$(TAG) .
	docker push $(REPO):$(GIT_SHORT)-enterprise
	docker push $(REPO):$(GIT_SHORT)
	docker push $(REPO):$(TAG)-enterprise
	docker push $(REPO):$(TAG)
	@echo Tag $(GIT_SHORT)-enterprise pushed for git revision $(GIT_REVISION).

release-staging: release-cloud

-check-working-clean:
	@git diff --stat --exit-code > /dev/null || { echo "Working directory is not clean, refusing to release."; exit 2; }
