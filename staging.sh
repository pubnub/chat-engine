#!/bin/sh

setup_git() {
  git config --global user.email "github-ops-codacy@pubnub.com"
  git config --global user.name "PubNub Bot"
}

commit_website_files() {
  git checkout -b staging
  gulp compile
  git add .
  git commit --message "Build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add origin-travis https://${GH_TOKEN}@github.com/pubnub/chat-engine.git > /dev/null 2>&1
  git push --quiet --set-upstream origin-travis staging
}

setup_git
commit_website_files
upload_files
