# Keyboard Accessibility

Note: If you do not currently have a screen reader on your browser, there are extensions and plug-ins available for both Chrome and Firefox.  Chrome Vox, a Chrome extension, for example is highly customizable and allows the user to select the screen reader voice.

## aria-label

It's important that everything in the tabindex be announced by screen readers.  When testing the keyboard accessibility aspects of any page, please ensure that your browser has a screen reader active to verify all expected information is announced.  The majority of focusable items will likely already have text in the page that is subsequently announced by the screen reader, however page items represented by icons, such as (x) close buttons or tooltips, do not have text on the page and thus do not announce anything (except possibly input-type or 'link') when tabbed to.  Aria-labels are to be used in these cases to assign text for the screen-reader to read without cluttering up the html with `<span>` elements that are hidden by css.

- Icon only buttons require an aria-label while buttons with text do not
```html
<button type="button" class="close" ng-click="$dismiss()" aria-label="{{::'common.close' | translate}}"></button>
```
- Tooltips are not automatically added to the tabindex and, unless they're on a button or an anchor element, will require `tabindex="0"` to be included
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

## Toggle Switches

Our toggle switches are the cs-toggle-switch from collab-ui.  While these are automatically added to the tab-index, they will all need an aria-label added.  The tag `cs-aria-label` is used to pass a string into the toggle switch that is then applied internally to the aspect of the switch in the tabindex.

Example:
```typescript
<cs-toggle-switch
  ng-model="$ctrl.modal"
  toggle-id="toggleId"
  cs-change="$ctrl.onChange()"
  cs-true-value="false"
  cs-false-value="true"
  cs-aria-label="{{::'common.translatedText' | translate}}">
</cs-toggle-switch>
```

## Tooltips

As noted in the [aria-label](#aria-label-and-screen-readers) section, tooltips are not automatically added to the tabindex, nor do they automatically react to receiving keyboard focus.  Please ensure that all tooltips on the page have `focus` included as a `tooltip-trigger`, a `tabindex` of 0 and an `aria-label` that matches the displayed text of the tooltip.  In cases where the tooltip displays html in addition to the text, the text provided to the `aria-label` should not include the html elements.

Examples:
```html
<i class="icon info-icon"
  tooltip="{{::'tooltip.demo' | translate}}"
  tooltip-trigger="focus mouseenter"
  tabindex="0"
  aria-label="{{::'tooltip.demo' | translate}}"></i>
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

Atlas currently utilizes [Dragular](https://www.npmjs.com/package/dragular) to create drag and drop lists.  However, Dragular does not have any keyboard support.  To remedy this, the DraggableService has been created in order to streamline inserting keyboard support into drag and drop lists.  DraggableService has a single function: `createDraggableInstance`.  This function creates a new instance of DraggableInstance, which has two public variables - `reordering: boolean` and `selectedItem?: any` - and one public function - `keyPress`.  To control whether the list is draggable, `reordering` should be toggled between `true` and `false`; `true` for when the list is draggable and `false` for when its static.  `reordering` defaults to `true`.  `selectedItem` is the list item currently selected when navigating via keyboard while the list is draggable.  When reordering is set to `false`, `selectedItem` should be reset to `undefined`.

To utilize the DraggableService:
- The service, and the associated class, can be imported from 'modules/core/accessibility'
```typescript
import { DraggableService, DraggableInstance } from 'modules/core/accessibility';
```

- First create a draggable instance
```typescript
private draggableInstance: DraggableInstance;
...
  this.draggableInstance = this.DraggableService.createDraggableInstance({
      elem: this.$element,
      identifier: '#containerId',
      transitClass: 'reorder-class',
      itemIdentifier: '#itemId',
      list: this.draggableList,
    });
```

- Make sure the html setup matches the id/classes used in the creation of the draggableInstance (do not forget to set the tabindex)
```html
<div id="containerId">
  <div ng-repeat="item in $ctrl.draggableList" id="itemId{{$index}}" ng-class="{'reorder-class': $ctrl.isReordering()}" tabindex="{{$ctrl.isReordering() ? 0 : -1}}" ng-keydown="$ctrl.itemKeyPress($event, item)">
    <!-- Unique Content Here -->
    <div ng-if="$ctrl.isReordering()">
      <i class="icon icon-tables" ng-class="{'selected': $ctrl.isSelectedItem(item)}"></i>
    </div>
  </div>
</div>
```

- There will need to be keypress, isReordering, and isSelected functions added to the controller for use in the html
```typescript
public itemKeyPress($event: KeyboardEvent, item: IListItem) {
  if (!this.isReordering()) {
    return;
  } else {
    this.draggableInstance = this.DraggableService.keyPress($event, item);
    this.draggableList = this.draggableInstance.list;
  }
}

public isReordering(): boolean {
  return _.get(this.draggableInstance, 'reordering', false);
}

public isSelectedItem(item: IListItem): boolean {
  return item === this.draggableInstance.selectedItem;
}
```

- Remember that the DraggableInstance starts with `reordering` as `true` and must be toggled on/off is the list is only sometimes draggable.

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

### Accessibility Service

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

Additionally there is the `isVisible` function which checks the visibility of an element based on a locator.  The function accepts the following arguments: `locator: string, elem?: ng.IRootElementService`.

Example:
```typescript
this.AccessibilityService.isVisible('.locator-class', this.$element);
// or
this.AccessibilityService.isVisible('.other-locator');
```

There is currently one readonly variable - `public readobly MODAL = '.modal-content';` - which should not be sent with a `this.$element` to allow checking the visibility a modal to prevent erroneous ESC key interactions.  See `helpdesk-org.controller.js` for an example of this usage.

## Toolkit Keyboard Navigation Integration

Currently the toolkit is not fully keyboard accessible.  When encountering problems with keyboard accessibility on Atlas, please verify whether the issues are stemming from a toolkit component, such as cs-select or cs-searchfield, and open a sub-task on Jira [ATLAS-1856](https://jira-eng-chn-sjc1.cisco.com/jira/browse/ATLAS-1856) detailing the issues with the component encountered, which page on Atlas it can be reproduced on, and what the correct keyboard interaction for this component should be.  Issues with the toolkit may include components that are not keyboard navigable, or are not fully keyboard navigable, or components that are lacking aria-labels.

## What to do when you encounter keyboard navigation issues

* If it's a problem with the toolkit, please see the above section for instructions on what to do when a toolkit component has a problem with keyboard navigation.
* If it's a small issue, please go ahead and fix it.  If you see a link that can't be tabbed to, add an `href`.  If there's an `ng-click` that does not react to the ENTER or SPACE key as expected, please add `ng-keypress` functionality.
* If it's a large issue, such as a component that lacks keyboard accessibility, or is simply enough work to be outside of the scope of your current Jira or User Story, then please document the keyboard accessibility issues as a sub-task of [ATLAS-1856](https://jira-eng-chn-sjc1.cisco.com/jira/browse/ATLAS-1856).

If you open up a keyboard related Jira, don't just open it and forget about it.  If you're too busy to fix the Jira yourself at the time you open it, please remember to come back to the Jira when you have time to either verify it has been fixed by whoever does pick it up or to pick the Jira up yourself so that Atlas continues to increase keyboard accessibility across all pages.
