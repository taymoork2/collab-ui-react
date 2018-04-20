# Everything you need to know about Atlas UI deployments

<!-- toc -->

- [Overview](#overview)
- [Finding which build is currently in integration](#finding-which-build-is-currently-in-integration)
- [Finding which build is currently in production](#finding-which-build-is-currently-in-production)
- [Finding the latest "gold starred" build](#finding-the-latest-gold-starred-build)
- [Asking for a specific build to be pushed to production](#asking-for-a-specific-build-to-be-pushed-to-production)

<!-- tocstop -->

## Overview

The code is pushed to **[integration](https://int-admin.ciscospark.com)** after each successful build on [Gauntlet](https://gauntlet.wbx2.com/queue.html?queue=atlas-web)/[Jenkins](https://sqbu-jenkins.cisco.com:8443/job/team/job/atlas/job/atlas-web/).

As of 2017-09-28, Atlas UI, is deployed to **[production](https://admin.ciscospark.com)** on Mondays and Thursdays **at 7:32 PM Pacific time** (Los Angeles timezone). Atlas UI is deployed **last**, so approximately around **9:45 PM** the deploy script will check the latest build that has been "gold starred" and deploy it.

Several people can "gold star" a build (mark a successful build with a gold star), but usually [Michael McCann](http://wwwin-tools.cisco.com/dir/reports/mrmccann) takes care of it every US working day.

## Finding which build is currently in integration

Look for the latest green build on [Jenkins](https://sqbu-jenkins.cisco.com:8443/job/team/job/atlas/job/atlas-web/).

## Finding which build is currently in production

Search in the room *Atlas UI Build Pipeline* for "production" and click on the first result. The message is highlighted and its last line contains the current build number (build 14749 in this case):

![production-search](https://sqbu-github.cisco.com/storage/user/357/files/8dce0854-07fc-11e7-8927-24f2da3a73e5)

## Finding the latest "gold starred" build

Look at the "Ready for Prod" section on [Jenkins' Promotion page](https://sqbu-jenkins.cisco.com:8443/job/team/job/atlas/job/atlas-web/promotion/):

![ready-for-prod](https://sqbu-github.cisco.com/storage/user/357/files/83820710-07fc-11e7-8beb-7fe8848b2058)

## Asking for a specific build to be pushed to production

There's no need for that, a build is generally "gold starred" every work day.

If there is a bug in production **impacting customers**, or if you know that the current "gold starred" build contains such a bug, mention it in the Spark Room "Atlas UI Dev Team". [Wouter Lammers](http://wwwin-tools.cisco.com/dir/reports/woulamme) and [Thomas Bassetto](http://wwwin-tools.cisco.com/dir/reports/thobasse) can "gold star" builds during Norwegian office hours.
