<div align="center">
  <img width="200" height="200" src="https://sqbu-github.cisco.com/storage/user/357/files/92225bf8-07fc-11e7-98eb-41ccb439573b">
  <h1>Atlas UI</h1>
  <p>Code for the <a href="https://admin.ciscospark.com">Cisco Spark Control Hub</a> front-end<p>
</div>

## Project Overview

The Cisco Spark Control Hub portal allows Cisco's customers and partners to do … all sort of things. This project contains the code of its User Interface.

## Technologies Overview

This project is built using [AngularJS](https://angularjs.org) (1.x), [ui-router](https://github.com/angular-ui/ui-router), [lodash](https://lodash.com) and [Cisco's Collab UI Toolkit](http://collab-ui.cisco.com). New code is written in [TypeScript](https://www.typescriptlang.org), but most of the existing code is in [EcmaScript 5 (ES5)](https://en.wikipedia.org/wiki/ECMAScript#5th_Edition). The styling is written using [SCSS](http://sass-lang.com/guide) and the [ITCSS](https://github.com/ahmadajmi/awesome-itcss) methodology. Finally, the code is bundled using [webpack](https://webpack.github.io).

A migration to [Angular](https://angular.io) (2+) is mentioned from time to time, but there is no official schedule yet. It can't happen until more code is converted to TypeScript + components anyway.

* :arrow_right: [More details about the current technology](./technology.md)
* :star: [Short read about the transition to TypeScript and components](./transition-why.md)
* :hammer: [TypeScript overview](./typescript-overview.md)

## Relevant Spark Spaces

The following Spark spaces are all relevant (and part of the Atlas Team):
* [**Atlas UI Dev Team**](https://web.ciscospark.com/rooms/c326a730-826b-11e5-9361-3daf1bba596b): Official channel for important announcement and places to ask you general questions about Atlas UI development
* [**UI Build Pipeline**](https://web.ciscospark.com/rooms/dad3d170-d6ce-11e5-b264-a96ee13550d5): The jenkins bot will post each time Atlas UI is deployed to production, and each time a build has succeeded or failed. It can also serve to discuss about the root cause of build failures.

## Bug Reporting

Do not use Github, UI bugs should be reported in [JIRA](https://jira-eng-chn-sjc1.cisco.com/jira/projects/ATLAS).

## How-tos

* [Adding a simple page ("Hello World")](./hello-world.md) (:warning: Still featuring ES5 for now)
* *more to come*

## Articles

* [Browser support](./browser-support.md)
* [Everything you need to know about Atlas UI deployments](./deployments.md)
* [Keyboard Accessibility](./accessibility.md)
* *more to come*
