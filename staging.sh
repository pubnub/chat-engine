#!/bin/sh

setup_git() {
  git config --global user.email "github-ops-codacy@pubnub.com"
  git config --global user.name "PubNub Bot"
  git remote add origin-travis https://${GH_TOKEN}@github.com/pubnub/chat-engine.git > /dev/null 2>&1
}

commit_website_files() {
  git checkout origin-travis/staging
  git pull origin-travis staging
  git checkout origin-travis/master
  git pull origin-travis master
  git merge staging -s ours -m "Update staging"
  git checkout staging
  git merge master
  gulp compile
  git add .
  git add -f dist
  git commit --message "Build: $TRAVIS_BUILD_NUMBER"
  git push --quiet --set-upstream origin-travis staging
}

setup_git
commit_website_files
