# Future technical direction for Atlas UI development

You may have already heard that:

> Atlas UI is moving towards components, written in TypeScript.

One common misconception is to think that both technologies are tied together. They aren't, components can be added without writing them in TypeScript and TypeScript can be used without writing components.

It's a lot **to learn** at the same time, that's why the recommendation is to first learn how to use TypeScript (by writing/converting AngularJS services) and then start writing components.

## Why moving to TypeScript

TypeScript is a superset of modern JavaScript which primarily provides optional static typing and support for future ES6+ features. One of the big benefits is to enable IDEs to provide advanced autocompletion, navigation, refactoring and to help developers spotting common errors as they type the code.

For a large JavaScript project like Atlas UI, adopting TypeScript results in more robust software, while still being deployable where a regular JavaScript application would run.

* :arrow_right: [Our TypeScript Overview](./typescript-overview.md)
* :school: [TypeScript Fundamentals on Pluralsight](https://www.pluralsight.com/courses/typescript) (cf. [ENG: Pluralsight and Code School - Annual Subscription](http://learn.cisco.com/?courseId=COT00237397))

## Why moving to components

The JavaScript ecosystem is moving fast, frameworks come and go, but all modern JavaScript frameworks agreed at least on one thing: moving towards "components".

Components let you split the UI into independent, reusable pieces, and think about each piece in isolation. They are pieces of code that are easier to reason about, and easier to test.

While we are writing more documentation specific to Atlas UI, you should (re-)read:
* [Break The UI Into A Component Hierarchy](https://facebook.github.io/react/docs/thinking-in-react.html#step-1-break-the-ui-into-a-component-hierarchy), from [Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html)
* [Exploring the Angular 1.5 .component() method ](https://toddmotto.com/exploring-the-angular-1-5-component-method/)
* [Refactoring Angular Apps to Component Style](https://teropa.info/blog/2015/10/18/refactoring-angular-apps-to-components.html)
* [Brian Spence's livecoding of an Atlas UI component in TypeScript](https://go.webex.com/go/lsr.php?RCID=a43dd861e00743b7b18b939a47628eeb)

:warning: All the articles above use examples in JavaScript, not TypeScript.

<!--
TODO
* Components compared to the traditionnal AngularJS couple template & controller.
* Smart vs dumb / stateless vs stateful / presentational vs container components.
* Step-by-step rewrite of the Atlas' Users page in components and TypeScript.
-->

## Why moving to another framework (someday)

When Atlas UI was started, AngularJS was all the rage and more or less the only option. Since then, the JavaScript language evolved a lot, frameworks were born and evolved a lot too.

Thankfully, AngularJS evolved too by cherry-picking the best ideas of competitors. For instance, AngularJS 1.3 introduced more ways to use one-way data binding, and AngularJS 1.5 introduced components.

In theory we could happily continue working with the latest version of AngularJS (1.x) and TypeScript, but its very specific dependency injection system and the lack of consideration for AngularJS from modern tools makes it harder and harder to work with a large codebase like the code we have. Practices like splitting the code into chunks or using dead-code elimination are made harder than they should be.

That's why migrating the code to Angular 2 (or something else, since after all Angular 2 is quite different from AngularJS) is highly likely to be necessary and starting to think in terms of components today will help.
