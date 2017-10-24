# Keyboard Accessibility

Note: If you do not currently have a screen reader on your browser, there are extensions and plug-ins available for both Chrome and Firefox.  Chrome Vox, a Chrome extension, for example is highly customizable and allows the user to select the screen reader voice.

## aria-label

It's important that everything in the tabindex be announced by screen readers.  When testing the keyboard accessibility aspects of any page, please ensure that your browser has a screen reader active to verify all expected information is announced.  The majority of focusable items will likely already have text in the page that is subsequently announced by the screen reader, however page items represented by icons, such as (x) close buttons or tooltips, do not have text on the page and thus do not announce anything (except possibly input-type or 'link') when tabbed to.  Aria-labels are to be used in these cases to assign text for the screen-reader to read without cluttering up the html with `<span>` elements that are hidden by css.

- Button example
```html
<button type="button" class="close" ng-click="$dismiss()" aria-label="{{::'common.close' | translate}}"></button>
```
- Tooltip example (tooltips are not automatically added to the tabindex and require `tabindex="0"` to be included)
```html
<i class="icon info-icon"
  tooltip="{{::'tooltip.demo | translate}}"
  tooltip-trigger="focus mouseenter"
  tabindex="0"
  aria-label="{{::'tooltip.demo | translate}}"></i>
```

Please note that anything that can be clicked by, or otherwise interact with, the mouse should be accessible via keyboard.

## Anchor element

`<a>` elements are fairly straight forward for including in the tabindex; as long as there is a `href` tag included, the `<a>` will be included in the tabindex.  The only exception is when `ui-sref` is used by an `<a>` element.  In most cases the `href` can be left off when `ui-sref` is present.  But please verify that the `<a>` can be tabbed to in the browser, as `ui-sref` is not always reliable for adding an `<a>` element to the tabindex when included in a list.

- `<a>` with `href`
```html
<a href ng-click="$ctrl.doStuff()" translate="translate.stuff"></a>
```
- `<a>` with `ui-sref`
```html
<a ui-sref="new.state" translate="translate.stuff"></a>
```
- `<a>` with `ui-sref` in a list
```html
<ul>
  <li>
    <a href ui-sref="new.state" translate="translate.stuff"></a>
  </li>
</ul>
```

## Tooltips

As noted in the [aria-label](#aria-label-and-screen-readers) section, tooltips are not automatically added to the tabindex, nor do they automatically react to receiving keyboard focus.  Please ensure that all tooltips on the page have `focus` included as a `tooltip-trigger`, a `tabindex` of 0 and an `aria-label` that matches the displayed text of the tooltip.  In cases where the tooltip displays html in addition to the text, the text provided to the `aria-label` should not include the html elements.

Examples:
```html
<i class="icon info-icon"
  tooltip="{{::'tooltip.demo | translate}}"
  tooltip-trigger="focus mouseenter"
  tabindex="0"
  aria-label="{{::'tooltip.demo | translate}}"></i>
```
or
```html
<i class="icon info-icon"
  tooltip-html-unsafe="{{::$ctrl.getUnsafeHtml()}}"
  tooltip-trigger="focus mouseenter"
  tabindex="0"
  aria-label="{{::$ctrl.getTextOnly()}}"></i>
```

## Grids

Currently Atlas uses ui-grid for pages where large amounts of data are being displayed as a table or grid.  ui-grid does not have native keyboard support, but is instead added by a component currently located in Atlas core called cs-grid.  For more information on cs-grid check the [ui-grid accessibility](./ui-grid-accessibility.md) page.

## Draggable lists

Currently Atlas utilizes Dragular to create drag and drop lists.  However, Dragular does not have any keyboard support.  There is currently a Jira, [ATLAS-2669](https://jira-eng-chn-sjc1.cisco.com/jira/browse/ATLAS-2669), that has been opened for creating a keyboard accessible draggable list component that will encapsulate Dragular, similar to how cs-grid wraps around ui-grid, to create draggable lists that are keyboard accessible by default.  The Speed Dials re-order list has already been made keyboard accessible as a proof of concept and part of ATLAS-2669 will be to migrate Speed Dials to the generic component.

This section should be updated upon the completion of ATLAS-2669.

## Keyboard Events and Keycodes

Keyboard events and mouse click events don't always match up as expected; when tabbing through the page please verify that the enter/space/escape/etc. keys all work as expected.  Additionally, some components may require special behavior for certain keys, such as when navigating through a list with arrow keys.  There is now a KeyCodes enum, found under `'modules/core/accessibility'` that can be imported (`.ts`) or required (`.js`) as necessary.

Example:
```html
<div tabindex="0" ng-click="$ctrl.doSomethingOnClick()" ng-keypress="$ctrl.doSomethingOnKeypress($event)"></div>
```
```typescript
import { KeyCodes } from 'modules/core/accessibility';
...
public doSomethingOnClick(): void { /*stuff happens here*/ }

public doSomethingOnKeypress($event: KeyboardEvent): void {
  switch ($event.which) {
    case: KeyCodes.ENTER:
    case: KeyCodes.SPACE:
      this.doSomethingOnClick();
      break;
    case: KeyCodes.Up:
      this.upArrow();
      break;
    case: KeyCodes.DOWN:
      this.downArrow();
      break;
  }
}
```
or
```javascript
var KeyCodes = require('modules/core/accessibility').KeyCodes;
...
vm.doSomethingOnClick = function () { /*stuff happens here*/ };

vm.doSomethingOnKeypress = function ($event) {
  switch ($event.which) {
    case: KeyCodes.ENTER:
    case: KeyCodes.SPACE:
      vm.doSomethingOnClick();
      break;
    case: KeyCodes.Up:
      vm.upArrow();
      break;
    case: KeyCodes.DOWN:
      vm.downArrow();
      break;
  }
};
```

Notes: Currently Atlas is checking against [`.keyCode`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode) and [`.which`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/which), both of which are deprecated but use the same numerical keyvalues to represent keypresses.  Atlas should migrate to using [`.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) in the future.  However, the [keyvalues](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) returned by `.key` are not the same numerical values used by `.keyCode` and `.which`.  While `.key` can be used now, please keep in mind that all of Atlas will need to be updated to `.key` and make your code decisions based on what will make migration easier down the road.

## Maintaining Focus

Ideally, visible focus should never be lost when enteracting with Atlas via keyboard.  To that end, please ensure that when the page changes in some way, focus is moved to the expected element.  In many cases, focus should remain the same as it was before the page updated, such as when an `ng-if` causes hidden parts of a form to appear.  In other cases, focus should be automatically updated either by tags in the html causing focus to automatically shift to the correct element or by the controller.

### focus-on

In the html, the `focus-on` tag can be added to an element to cause it to immediately grab focus after being rendered.  This is ideal when loading a new page, as it will cause focus to immediately jump to this element.

Example:
```html
<input type="text" focus-on />
```

Warning: Be very careful about using `focus-on` to draw focus to an element.  Some components are used in multiple places and an element in those components may need to be automatically focused on when it's a single page in a model but not when it's a single part of an overall settings page.  In these cases, `focus-on` can cause focus to jump to the wrong place on some pages.

### focusing from the controller

There is now a service, the AccessibilityService, that has been created for generic accessibility related functions.  This includes the `setFocus` function, which takes in three variables: `elem: ng.IRootElementService, identifier: string, time?: number`.

Example:
```typescript
this.AccessibilityService.setFocus(this.$element, '#elementId');
```
or
```typescript
this.AccessibilityService.setFocus(this.$element, '#elementId', 1000); // timeout added to allow page transition animation to complete
```

Focusing on an element from the controller is useful when a page is loading and the first focusable element is part of a component used in multiple places or when a page has already loaded but focus needs to automatically shift based on an interaction with page.  Some examples of this would be when clicking 'edit' on a dropdown list, deleting a selected element from a list, or after selecting a save/cancel option (causing the save/cancel buttons to disappear).

## Toolkit Keyboard Navigation Integration

Currently the toolkit is not fully keyboard accessible.  When encountering problems with keyboard accessibility on Atlas, please verify whether the issues are stemming from a toolkit component, such as cs-select or cs-searchfield, and open a sub-task on Jira [ATLAS-1856](https://jira-eng-chn-sjc1.cisco.com/jira/browse/ATLAS-1856) detailing the issues with the component encountered, which page on Atlas it can be reproduced on, and what the correct keyboard interaction for this component should be.  Issues with the toolkit may include components that are not keyboard navigable, or are not fully keyboard navigable, or components that are lacking aria-labels.

## What to do when you encounter keyboard navigation issues

* If it's a problem with the toolkit, please see the above section for instructions on what to do when a toolkit component has a problem with keyboard navigation.
* If it's a small issue, please go ahead and fix it.  If you see a link that can't be tabbed to, add an `href`.  If there's an `ng-click` that does not react to the ENTER or SPACE key as expected, please add `ng-keypress` functionality.
* If it's a large issue, such as a component that lacks keyboard accessibility, or is simply enough work to be outside of the scope of your current Jira or User Story, then please document the keyboard accessibility issues as a sub-task of [ATLAS-1856](https://jira-eng-chn-sjc1.cisco.com/jira/browse/ATLAS-1856).

If you open up a keyboard related Jira, don't just open it and forget about it.  If you're too busy to fix the Jira yourself at the time you open it, please remember to come back to the Jira when you have time to either verify it has been fixed by whoever does pick it up or to pick the Jira up yourself so that Atlas continues to increase keyboard accessibility across all pages.
