#!/bin/bash
set -e
set -x

function uploadToGithubPagesRepo() {
  git init
  git add .
  git config user.name "${GH_USER_NAME}"
  git config user.email "${GH_USER_EMAIL}"
  git commit -m "Updating ChatEngine Docs on gh-pages: ${TRAVIS_COMMIT_MESSAGE}"
  git push --force "https://${GH_TOKEN_PUBLISH_DOCS}@github.com/pubnub/chat-engine.git" master:gh-pages
  return
}

## RUN
gulp compile_docs
if [ "${TRAVIS_BRANCH}" == "master" ] \
  && [ "${TRAVIS_PULL_REQUEST}" == "false" ]; then
    # Build the JS_DOCs into docs/ dir
    pushd docs
    uploadToGithubPagesRepo()
    popd
fi
