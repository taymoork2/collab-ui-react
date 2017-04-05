# Hybrid Services Atlas Devguide

<!-- toc -->

- [About this document](#about-this-document)
- [High-level principles for Hybrid Services code in Atlas](#high-level-principles-for-hybrid-services-code-in-atlas)
  * [Folder structure and AngularJS modules](#folder-structure-and-angularjs-modules)
  * [TypeScript](#typescript)
  * [Creating Reusable Components](#creating-reusable-components)
    + [Tweaking an Existing Component or Creating Another?](#tweaking-an-existing-component-or-creating-another)
  * [AngularJS Services](#angularjs-services)
    + [FusionClusterService (FMS)](#fusionclusterservice-fms)
    + [ClusterService (FMS) (:warning:deprecated)](#clusterservice-fms-warning-deprecated)
    + [USSService (USS)](#ussservice-uss)
    + [(Other Services we should mention?)](#other-services-we-should-mention)
  * [Data Manipulation: Use Lodash](#data-manipulation-use-lodash)
  * [Asynchronous programming](#asynchronous-programming)
  * [Visual Guidelines and Overall UX Design Principles](#visual-guidelines-and-overall-ux-design-principles)
  * [Testing Strategies](#testing-strategies)
  * [Server-side Architectures](#server-side-architectures)
- [Communication and Coordination](#communication-and-coordination)
  * [Inter-team Communication](#inter-team-communication)
  * [Bug Reports](#bug-reports)
  * [Pull Requests](#pull-requests)
- [Appendix 1: The Hybrid Services Management team](#appendix-1-the-hybrid-services-management-team)

<!-- tocstop -->

## About this document

This document describes how to use and how to contribute to the hybrid services front-end code in Atlas. It is targeted at anyone who wants to work on a new or existing hybrid service in Atlas. 

The document is maintained by the Hybrid Services Management team. It describes what the Hybrid Services Management team expects from you, and also what you can expect from them. More information about the Hybrid Services Management team (who we are, what we do) can be found at the end of the document.

Our recommendations match the general Atlas UI recommendations, but are somewhat stricter. They tend to represent how the general Atlas UI recommendations will evolve in the future.

## High-level principles for Hybrid Services code in Atlas

### Folder structure and AngularJS modules

The hybrid services javascript code in Atlas resides inside the `hybrid-services` folder, and follows the layout outlined below.

```
modules/
├── hybrid-services/
│   ├── common/
│   │   ├── services/
│   │   │   ├── fusion-cluster.service.ts
│   │   │   ├── fusion-cluster.service.spec.ts
│   │   │   ├── whatever.service.ts
│   │   │   └── whatever.service.spec.ts
│   │   ├── components/
│   │   │   ├── something-something-component/
│   │   │   │   ├── _hs-something-something.scss
│   │   │   │   ├── hs-something-something.component.ts
│   │   │   │   ├── hs-something-something.component.html
│   │   │   │   └── index.ts
│   │   │   ├── deactivate-service-section/
│   │   │   ├── upgrade-cluster/
│   │   │   └── (all reusable hybrid services components here)
│   │   ├── user-sidepanel/ (legacy code that's not converted to components yet)
│   │   └── styles/
│   │       └── _hybrid-services.scss (only for styling that is not component specific. Should rarely be used.)
│   ├── docs/
│   ├── hybrid-calendar/
│   │   ├── exchange-based-calendar/
│   │   └── google-calendar/
│   ├── hybrid-call/
│   ├── hybrid-data-security/
│   ├── hybrid-media/
│   └── (new hybrid services here)/
├── (other non-hybrid services modules here)
```

Each hybrid service should in general use its own [AngularJS module](https://docs.angularjs.org/api/ng/function/angular.module). Shared components belong to the `HybridServices` component.

### TypeScript

All hybrid services code should in principle be written in [TypeScript](https://www.typescriptlang.org/), but there is still a lot of old code that still uses JavaScript. If your hybrid service already has existing Atlas code that's written in JavaScript, please add items for gradually converting it to TypeScript to your backlog.

### Creating Reusable Components

New hybrid services functionality should be written as [AngularJS components](https://docs.angularjs.org/guide/component). A component-based architecture [advocates best practices and common default behaviors](https://toddmotto.com/exploring-the-angular-1-5-component-method/), and greatly simplifies a future migration to Angular 2.

When creating Angular components, try to use [practices championed by React](https://facebook.github.io/react/docs/thinking-in-react.html) when modelling them, and **don't** model them like a legacy AngularJS 1.x app (like much of Atlas is today). Note that much of the AngularJS information you find online is out of date; if you see that the tutorial or example you are reading is injecting `$scope` in a controller, you should probably stop reading!

General design principles:
- Always default to a one-way binding. When using a one-way binding, it is much easier to reason about how data flows into your component, and thus test it. 
- Use the `$onChanges()` lifecycle hook to react to changes to your one-way bindings. 
- Only use old-school two-way bindings if converting legacy code to components, or if forced to by a dependency (for example a Collab UI directive that's written with a two-way binding in mind). 
- Provide a callback function from the parent component or controller when a component needs to update other components.
- Break the UI into a component hierarchy. A component should ideally only do one thing.

To mitigate the risk of naming conflicts, please prefix your components with `hs-`. For example, a component that shows a report of all users entitled for Hybrid Services could then be named `hs-user-entitlement-report`.

A template for how a hybrid services component should be modelled and tested can be found in the `modules/hybrid-services/docs/example-component/` folder.

#### Tweaking an Existing Component or Creating Another?

There is no hard rule about when you want to tweak an existing component, and when you want to create a new component. However: **Copy/pasting huge amounts of existing code into your new component is absolutely forbidden without explicit prior approval by the Hybrid Services Management team**. Copy/pasting antipatterns is one of the biggest problems in Atlas today, and cleaning up later is extremely time-consuming and risky. 

### AngularJS Services

Code that's duplicated between several controllers and/or components most likely belong in an [Angular JS service](https://docs.angularjs.org/guide/services) instead.

The Hybrid Services Management team maintains some AngularJS services that are responsible for communicating with the (Java) microservices that provide a management backend for many hybrid services; the most important microservices are [FMS](https://sqbu-github.cisco.com/WebExSquared/fusion-management-service) and [USS](https://sqbu-github.cisco.com/WebExSquared/user-status-service). The corresponding AngularJS services are located in the `hybrid-services/common/services/` folder. **You should under no circumstances create new AngularJS services that communicate with these backend services**, you should rather expand the existing services.
 
#### FusionClusterService (FMS)

`FusionClusterService` is the most important AngularJS service for Hybrid Services. It communicates with the FMS backend to exchange information about the organization, the clusters, the services and the resource groups.

It's main method is `.getAll()` which calls the "one size fits all" endpoint `/organizations/{orgId}?fields=@wide`. Other methods call `getAll()` internally.

#### ClusterService (FMS) (:warning:deprecated)

`ClusterService` usage is deprecated even though it is still used in some places. It's main advantage over `FusionClusterService` is its caching and pubsub capabilities. `ClusterService` automatically polls data from FMS every 30 seconds and caches it. It also exposes a` .subscribe()` method for controllers and components to receive up-to-date data after each poll.

#### USSService (USS)

`USSService` should be used for everything related to users. A bit like `ClusterService`, it has a cache and a subscribe function (`.subscribeStatusesSummary()`) for everything related to user statuses summary.

#### (Other Services we should mention?)

### Data Manipulation: Use Lodash

Contributors are encouraged to write TypeScript in a functional manner. Atlas developers should standardize on using the [lodash](https://lodash.com/) library when iterating arrays, objects, and strings. 

### Asynchronous programming

ES6-style promises is the only way you should be doing async programming, and contributors should use AngularJS's [$q service](https://docs.angularjs.org/api/ng/service/$q). The AngularJS services in the hybrid services module always return promises when doing asyncronous operations, which then must be resolved in your component's controller. 

Use promise chaining if necessary, and follow this pattern:

```javascript
FusionClusterService.functionReturningSomePromise()
.then(data => {
  // Do something to the data, for example filter it using lodash.
  // Don't forget to return the (modified) data.
})
.then(data => {
  // Do even more to the data. No need to return anything
  // if the promise chain stops here, but returning something (just
  // in case) doesn't hurt either.
})
.catch(error => {
  // Show error message to user, for example
  // by calling Notification.errorWithTrackingId();
})
.finally(() => {
  // Clean up, for example by stop displaying loaders and spinners
});
```

If you find yourself using `$q.defer`, you are [most likely doing it wrong](http://www.codelord.net/2015/09/24/%24q-dot-defer-youre-doing-it-wrong/).

Don't use generators or `async / await`, as they both are considered too cutting edge.


### Visual Guidelines and Overall UX Design Principles

Atlas is an interface for many different Spark and WebEx services, created and maintained by teams across many different business units and geographic locations. It is thus important to be strict about visual guidelines and the overall user experience (UX): If every team decides on their own way of doing things, customers will have a really hard time using our products and services.

The overall look and feel of Atlas is defined by the [Collab UI Toolkit](http://collab-ui.cisco.com/), and there are also many UX conventions used across all hybrid services. When adding a new hybrid service or feature to an existing hybrid service, please make sure that it aligns with what we already have. Prototypes, wireframes, or mockups provided by your team's UX designer should be regarded as starting points, and must be adjusted to fit with the rest of the hybrid services solution when implemented in Atlas. For example, if your designer wants a toast notification after a certain action, you should not build your own implementation of toast notifications that matches your design 100%. You must rather use what's already being provided by Collab UI or Atlas core, even if Atlas's toast notifications look slightly different than what your designer provided.

### Testing Strategies

Good unit test coverage is important, and Pull Requests with insufficient unit testing might be rejected.

End-to-end tests should only be used for the most critical scenarios in an application, and Atlas's hybrid services features are generally not considered to be in this category. It is highly unlikely that your feature needs end-to-end tests.

### Server-side Architectures

Spark Hybrid Services relies on many server-side microservices that follow the cloud-apps architecture used by most of Spark. This is unlike Atlas Core, which relies on a more monolithic server-side arcitecture with its [Admin Portal Backend Server](https://sqbu-github.cisco.com/WebExSquared/wx2-admin-service) project (often referred to as “The Atlas Backend”). 

The Hybrid Services Management team recommends not using *Admin Portal Backend Server*, but rather a microservice controlled by your own team when persisting data in the cloud. For example: If you are adding support for a hypotetic *Hybrid Foo Service* in Atlas's web interface, do not use Atlas Backend as a middleman when persisting data in Common Identity or elsewhere; you should rather add an appropriate API to the *Foo Service* in the cloud, and call it from Atlas's web interface. 

## Communication and Coordination

### Inter-team Communication

Use the Atlas Team space called “Atlas UI Hybrid Services” whenever you have questions or concerns. 

Keep in mind that your team is part of a wider hybrid services community in Atlas, and that it is expected that you participate in an ongoing dialog with the other teams.

### Bug Reports

The Atlas team has standardized on using Jira for bug reports. The Jira installation that is used by Atlas is found at [https://jira-eng-chn-sjc1.cisco.com/](https://jira-eng-chn-sjc1.cisco.com/). Your team might normally be using another tool (like GitHub) for tracking bugs, but please use Jira for anything that's specific to the Atlas UI.

Use the Jira component called “Hybrid Services” when filing bugs. The Hybrid Services Management team is periodically reviewing all bugs reports that belong to this component.

### Pull Requests

Follow the usual Atlas guidelines for creating a pull request (PR). Add some of your team members as reviewers, and also add an [`@WebExSquared/atlas-hybrid-services-ui`](https://sqbu-github.cisco.com/orgs/WebExSquared/teams/atlas-hybrid-services-ui) mention to alert the Hybrid Services Management team. Non-trivial PRs should be approved both by your own team and the Hybrid Services Management team.

## Appendix 1: The Hybrid Services Management team

The Hybrid Services Management team (based in Lysaker, Norway) owns three cloud-apps based Spark microservices (FMS, USS, and DAS), as well as the shared hybrid services AngularJS code in Atlas. The team also maintains the Atlas pages for Hybrid Call and Hybrid Calendar.

Teams that want to add new hybrid services functionality to Atlas must work in cooperation with the Hybrid Services Management team. The Hybrid Services Management team will guide and assist you in creating a modern and maintainable AngularJS module for your hybrid service.

The Hybrid Services Management team is part of Pat Hession's Spark Hybrid Services organization in CCTG.
