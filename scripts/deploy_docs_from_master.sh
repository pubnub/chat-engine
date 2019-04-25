#!/bin/bash
set -e
set -x

declare -a CE_GH_REPOS=("chat-engine-emoji"
  "chat-engine-gravatar"
  "chat-engine-markdown"
  "chat-engine-muter"
  "chat-engine-online-user-search"
  "chat-engine-open-graph"
  "chat-engine-uploadcare"
  "chat-engine-typing-indicator"
  "chat-engine-unread-messages")


function uploadToGithubPagesRepo() {
  git init
  git add .
  git config user.name "${GH_USER_NAME}"
  git config user.email "${GH_USER_EMAIL}"
  git commit -m "Updating ChatEngine Docs on gh-pages: ${TRAVIS_COMMIT_MESSAGE}"
  git push --force --quiet "https://${GH_TOKEN_PUBLISH_DOCS}@github.com/pubnub/chat-engine.git" master:gh-pages
  return
}

function cloneGitRepo() {
  REPO_TO_CLONE="${1}"
  if [ REPO_TO_CLONE != "" ]; then
    git clone "git@github.com:pubnub/${REPO_TO_CLONE}.git"
  fi
}

function cloneAllRepos() {
  pwd
  pushd ../
  for i in ${CE_GH_REPOS};
  do
    cloneGitRepo "${i}"
  done
  ls | grep chat-engine*
  popd
}

## RUN
cloneAllRepos
gulp compile_docs
if [ "${TRAVIS_BRANCH}" == "master" ] \
  && [ "${TRAVIS_PULL_REQUEST}" == "false" ]; then
    # Build the JS_DOCs into docs/ dir
    pushd docs
    uploadToGithubPagesRepo
    popd
fi
