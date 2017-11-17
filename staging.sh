#!/bin/sh

setup_git() {
  git config --global user.email "ian+teal+seal@pubnub.com"
  git config --global user.name "TEAL SEAL"
}

commit_website_files() {
  git checkout master
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
