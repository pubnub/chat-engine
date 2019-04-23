#!/bin/bash
set -e
set -x

# Build the JS_DOCs into docs/ dir

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
if [ "${TRAVIS_BRANCH}" == "master" ] \
  && [ "${TRAVIS_PULL_REQUEST}" == "false" ]; then
    # Build the JS_DOCs into docs/ dir
    gulp compile_docs
    pushd docs
    uploadToGithubPagesRepo()
    popd
fi
