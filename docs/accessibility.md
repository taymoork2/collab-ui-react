# Keyboard Accessibility

Note: If you do not currently have a screen reader on your browser, there are extensions and plug-ins available for both Chrome and Firefox.  Chrome Vox for example, a Chrome extension, is highly customizable and allows the user to select the screen reader voice.

## Tabindex

The tabindex is the index of elements the keyboard can interact with on the page at any given moment.  Unless specified otherwise, an elements location in the tabindex is determined by its location in the html, not where its located visually on the page.  Additionally, most elements are not in the tabindex by default: only button and input elements are included by default.  [Anchor](#anchor-element) elements must have an `href` tag to be automatically added to the tabindex.  Any element (except anchor elements) with an ng-click will be automatically added to the tabindex as well.

The tabindex, however, is not only used for allowing keyboard navigation to clickable items.  It is used to replicate any action that can be taken with the mouse and to communicate readable text to the user via a screen reader.  All tooltips, popovers, menus, or elements that are otherwise interactable using mouse events must be added to the tabindex.  Additionally, redundant elements, such as buttons that do nothing on click that are wrapped in an anchor link, must be removed from the tabindex.

Examples:
- Removing a redundant element from the tabindex
```html
<a ng-href="elsewhere.com" target="_blank">
  <button class="btn btn--primary" tabindex="-1">Go to Elsewhere.com</button>
</a>
```
In this case, the text for the button will be read aloud by the anchor wrapping it and the actions for the anchor would be duplicated by selecting the button via keyboard, making the button a redundant selector for the anchor's actions that should be removed from the tabindex, done by setting the tabindex on the button to '-1'.

- Adding an element to the tabindex
```html
<span tabindex="0">IMPORTANT TEXT</span>
```
When there is important text on the screen that should be announced by screen reader, setting tabindex to 0 adds the element to the tabindex based on its location in the html.

- adding an element to a specific location in the tabindex
```html
<a href ng-click="doStuff()" tabindex="2"></a>
```
Specifying a number greater than 0 for the tabindex will override the default order of the page.  In this case, regardless of where the anchor element is in the html, it will be the second element in the tabindex.  This is not a recommended use of the tabindex, however, as changes to other parts of the html can cause elements locked to a specific place in the tabindex to break the page flow.

## Aria Tags

It's important that everything in the tabindex be announced by screen readers.  When testing the keyboard accessibility aspects of any page, please ensure that your browser has a screen reader active to verify all expected information is announced.  The majority of focusable items will likely already have text in the page that is subsequently announced by the screen reader.  However, page items represented by icons, such as (x) close buttons or (?) info tooltips, do not have text on the page and thus do not announce anything (except possibly input-type, button role, or 'link') when tabbed to.  Aria-labels are to be used in these cases to assign text for the screen-reader to read without cluttering up the html with `<span>` elements that are hidden by css.

- Icon only buttons require an aria-label while buttons with text do not
```html
<button type="button" class="close" ng-click="$dismiss()" aria-label="{{::'common.close' | translate}}"></button>
```
- Search boxes or other text inputs lacking `placeholder` tags should include `aria-placeholder`
```html
<input cs-input type="text" aria-placeholder="{{:: $ctrl.placeholderText }}">
```
- Text inputs or selects with auto-complete should include `aria-autocomplete`: acceptable values for the tag are 'inline', 'list', 'both', or 'none'
```html
<input cs-input type="text" aria-autocomplete="list">
```
- For more information on aria tags and their uses, checkout the [MDN web docs](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA), the [W3C Aria Rules](https://w3c.github.io/using-aria/), or the [Aria Cheat Sheet](http://karlgroves-sandbox.com/CheatSheets/ARIA-Cheatsheet.html).

## How to test for keyboard and screen reader accessibility

1. Get a screen reader for your browser.  There's a list on [Wikipedia](https://en.wikipedia.org/wiki/List_of_screen_readers) that can help you get started.  Chrome Vox, for example, is a particularly simple to use option that is highly customizable and easily turned on or off as needed.

2. With the screen reader on, log in to Atlas.  Using the tab and enter/space buttons, navigate to your new page or feature.  Do not use your mouse for navigation.  Move the pointer off screen somewhere and only use the tab/enter/space/escape/arrow buttons for navigation.  (If navigation from the overview page to the location where your new code is located is broken, please check to see if this is something you can easily fix yourself before using the mouse to bypass that section.  If it isn't an easy fix, check step five for information on where to open an accessibility Jira.)

3. Verify that upon arriving at your new code, focus moves to the correct place.  On page load, focus should jump to the start of the page.  On a modal, sidepanel, or overlay panel, focus should jump to the interior html of the component to facilitate keyboard capture.

4. Check for visible focus for every element that can be tabbed to and verify that every element that can be interacted with a mouse some way can be interacted with using the keyboard and are announced with meaningful labels by the screen reader.
  * All links and buttons should be reachable using tab and trigger click actions using space/enter.
  * All tooltip and popover trigger elements should be in the tab index.  Their aria-labels should include the tooltip/popover text at minimum.
  * All grid cells in a table should be navigable to allow reading out the information contained within, regardless of whether the table can be further interacted with.
  * Any interactions that occur on `:hover` should also appear on `:focus` and that element should be included in the tabindex.
  * Radio button groups should be treated as a single element by the screen reader.  Focus should move to the selected button on tab and the up/down arrows used to navigate the list to choose a different option.
  * Checkboxes should only react to the space key, not enter.  If enter is pressed and the click event fires even though the element's checked/unchecked status remains unchanged, then there is an ng-click that should be turned into an ng-change.
  * All dropdown menus should close on tab out.  Selects/date pickers/time pickers/cs-dropdowns/custom dropdowns... all of those should close when the element is tabbed out of, either with regular tab or with shift-tab.  Additionally, the escape key should close the menu and return focus to the trigger element.  Any page specific escape key behavior should be overridden when navigating an open menu, but not when the menu is closed and focus is on the trigger element.  When an item is selected in the menu and the menu closes, focus should return to the trigger element.
  * Modals, sidepanels, and overlay panels should have keyboard capture.  Tabbing should be restricted to the inside of the modal/sidepanel/overlay panel only and using the escape key should close the modal/sidepanel/overlay panel without triggering any page specific escape key behavior for the page that launched the modal/sidepanel/overlay panel.
  * When an element is deleted or hidden, focus should jump to the next element in the tabindex.  If there are cards on a page and a card is deleted, focus should move to the next card in the list.  If the element with focus changes from visible to hidden, then focus should jump to the next element as appropriate.
  * All draggable lists should be reorderable using tab and the arrow keys.  For more information on creating keyboard compliant draggable lists, check the examples for the [DraggableService](#draggable-lists) below.
  * Footer elements should always be at the end of the tabindex for that page and should thus also be at the bottom of the `.html` file.

5. If you run into difficulty navigating the page at any time or have elements that lack meaningful labels when the screen reader announces them, those should be rectified before checking in your code.  There is a list of [elements](#element-types-and-services) below that include explanations and examples for fixing any tabindex or aria related issues.
  * If you encounter keyboard accessibility issues in code outside of the scope of the user story or Jira that you're working, please check those as well.  If it's a small issue, such as a missing `href` or an `ng-click` that doesn't trigger correctly on key presses, you should go ahead and fix it.  If its a larger issue, such as a problem with a toolkit component, then please open a [Jira](https://jira-eng-gpk2.cisco.com/jira/secure/CreateIssue!default.jspa).
  * For more information on existing or previous keyboard Jiras, check out [ATLAS-1856](https://jira-eng-chn-sjc1.cisco.com/jira/browse/ATLAS-1856) and [ATLAS-1434](https://jira-eng-gpk2.cisco.com/jira/browse/ATLAS-1434).  For more information on what to do if a toolkit keyboard accessibility issue is encountered, please check the [toolkit section](#toolkit-keyboard-navigation-integration) below, as a github issue will also need to be raised.
  * If you open up a keyboard related Jira, don't just open it and forget about it.  If you're too busy to fix the Jira yourself at the time you open it, please remember to come back to it when you have time to either verify it has been fixed or to pick the Jira up yourself so that Atlas continues to increase keyboard accessibility across all pages.

---

# Element Types And Services

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

## Toolkit Keyboard Navigation Integration

Currently the toolkit is not fully keyboard accessible.  When encountering problems with keyboard accessibility on Atlas, please verify whether the issues are stemming from a toolkit component, such as cs-select or cs-searchfield, and open a Jira detailing the issues with the component encountered, which page on Atlas it can be reproduced on, and what the correct keyboard interaction for this component should be.  Issues with the toolkit may include components that are not keyboard navigable, or are not fully keyboard navigable, or components that are lacking aria-labels.

Below is an incomplete list of current toolkit elements that either need to be added to the tabindex, have aria-labels added, or have common tabindex related problems.

### cs-breadcrumbs

`cs-breadcrumbs` are in the tabindex by default.  However, breadcrumbs are currently utilized in such a way that they are visually hidden by save/cancel buttons in the sidepanel but not actually removed from the html.  This can cause keyboard navigation to tab to these elements despite being inaccessible with a mouse.  To remedy this problem, the tag `cs-Tabindex` was added to `cs-breadcrumbs` to allow for toggling the breadcrumbs placement in the tabindex dynamically.

Example:
```html
<!-- the breadcrumbs should not be tabbable when the save/cancel buttons are visible -->
<cs-breadcrumbs displayname-property"$ctrl.displayNames" cs-tabindex="$ctrl.saveCancelVisible ? -1 : 0"></cs-breadcrumbs>
```

### cs-card-member

`cs-card-member` has two potential aria labels: one for the delete option and one for the toggle menu, named `delete-aria-label` and `toggle-aria-label` respectively.  It can also be combined with the [DraggableService](#draggable-lists) for keyboard support in draggable lists.

Example:
```html
<cs-card-member
  cs-type="{{::$ctrl.cardType}}"
  cs-member-type="{{::$ctrl.type}}"
  cs-complex-card-type="{{::$ctrl.complexCardType}}"
  cs-id="$ctrl.id"
  cs-title="$ctrl.name"
  delete-aria-label="{{::'common.delete' | translate}}"
  toggle-aria-label="{{::'common.toggleData' | translate}}">
</cs-card-member>
```

### cs-card-number

`cs-card-number` is similar to `cs-card-member` in that the card has a delete option.  If the card can be deleted then the aria-label for the button should be passed in using `delete-aria-label`.

Example:
```html
<cs-card-number
  cs-id="$ctrl.id"
  cs-title="$ctrl.number"
  on-remove-fn="$ctrl.removeNumber(number)"
  delete-aria-label="{{::'common.delete' | translate}}">
</cs-card-number>
```

### cs-checkbox

`cs-checkboxes` have been deprecated.  Please update these wherever you see them (they are most noticable in places where an ng-click was attached to them, causing the checkbox to appear in the tabindex twice).  For more info on converting to `cs-input type="checkbox"`, please check the [cs-input](#cs-input) section of this readme and the [checkbox](http://collab-ui-ng.cisco.com/#/checkbox) entry on the collab website.

However, if updating the checkbox is inadvisable for any reason, cs-checkboxes have an onchange function that can be used in place of `ng-click` to prevent the tabindex redundancy:
```html
<cs-checkbox on-change-fn="$ctrl.previouslyNgClickFunction()"></cs-checkbox>
```

### cs-input

There are three different elements that use `cs-input`: text inputs, checkboxes, and radio buttons.  Because `cs-input` elements are always `input` elements, there is no need to add any of them to the tabindex.

Note: Currently input hint and error text are inaccessible in the tabindex.

#### type="checkbox"
Checkboxes should always have a `cs-input-label`.  This used as the on screen label for the checkbox and is announced by screen readers upon tabbing to the element.  If a checkbox must be unlabeled visually - or disconnected from its label - for any reason, then an aria-label should be used instead.

Examples:
```html
<!-- checkbox with label -->
<input cs-input type="checkbox"
  ng-model="$ctrl.model"
  ng-change="$ctrl.onChange()"
  cs-input-label="{{::'common.checkbox' | translate}}">

<!-- checkbox with aria-label -->
<input cs-input type="checkbox"
  ng-model="$ctrl.model"
  aria-label="{{::'unlikelyEvent.checkbox' | translate}}">
```

#### type="radio"
Much like checkboxes, radio buttons should always have a `cs-input-label`.  aria-labels should only be used in the highly unlikely event that no `cs-input-label` is supplied.  Unlike checkboxes, radio buttons should always have a `name` and the `name` of radio buttons in the same group should always match (the matching `name` indicates that the radio buttons share a group).  Keyboard navigation should always treat radio button groups as a single element where the selected button is the one in the tabindex and changing the selected value is done utilizing the arrow keys.  The only exception is when no option in a radio button group is selected, which forces each button into the tabindex until one is selected.

If a radio button can be tabbed to when it is not the selected option in a radio button group, and there is a selected option already in that group, then the name for that radio button is out of sync with the rest of the group and should be fixed.

Examples:
```html
<!-- radio button with label -->
<input cs-input type="radio"
  name="radioExample"
  ng-model="$ctrl.model"
  cs-input-label="{{::'common.radio' | translate}}">

<!-- radio button with aria-label -->
<input cs-input type="radio"
  name="radioExample"
  ng-model="$ctrl.model"
  aria-label="{{::'unlikelyEvent.radio' | translate}}">
```

#### type="text"
Text inputs are a little trickier than checkboxes and radio buttons, as these are often used without `cs-input-label` and in these cases the use of `aria-label` is not advised as it will override typed input when announced by the screen reader.  Instead either `placeholder` or `aria-placeholder` should be used to ensure there is always text to be read by the screen reader.

Note: When there is a `cs-input-label`, it will be announced first before the typed text within the input.  When there is a `placeholder` or `aria-placeholder`, it will be announced as a 'hint' and will only be read by the screen reader when the input is empty of typed text.

Examples:
```html
<!-- text input with label -->
<input cs-input type="text"
  placeholder="{{::'common.placeholder' | translate}}"
  ng-model="$ctrl.model"
  cs-input-label="{{::'common.label' | translate}}">

<!-- text input with placeholder only -->
<input cs-input type="text"
  placeholder="{{::'common.placeholder' | translate}}"
  ng-model="$ctrl.model">

<!-- text input with aria-placeholder only -->
<input cs-input type="text"
  aria-placeholder="{{::'common.placeholder' | translate}}"
  ng-model="$ctrl.model">
```

### cs-page-header

`cs-page-header` has the back option, which adds a left arrow icon button to the side of the header.  When present, this button requires an aria-label provided by the `back-aria-label` tag.

Example:
```html
<cs-page-header
  title-name="{{$ctrl.title}}"
  back="true"
  back-url="$ctrl.url"
  back-aria-label="{{::'common.back' | translate}}">
</cs-page-header>
```

### cs-radio

`cs-radio` has been deprecated and should be updated to `cs-input type="radio"` whenever encountered in the html.  Much like with cs-checkbox, it is possible for a cs-radio button to be in the tabindex twice due to `ng-click`.  Unlike with cs-checkbox there is no workaround for fixing the redundancy.  For more information on updating to `cs-input type="radio"`, please check the [cs-input](#cs-input) section of this readme and the [radios](http://collab-ui-ng.cisco.com/#/radios) entry on the collab website.

### cs-search-filter

`cs-search-filter` has an internal button used to clear the search, which requires an aria-label.  Additionally the search itself requires either a placeholder or an aria-placeholder for screen readers when it is empty.  However, the placeholder is either set using `placeholder-text` or `search-placeholder-text`.  Please note that `placeholder-text` applies not only as the placeholder for the search input but also as the first 'filter' displayed to the right of the input.  `search-placeholder-text` is used as a placeholder for the search input only.  If both are present, then the `search-placeholder-text` will be used as the search input placeholder, but the `placeholder-text` will still be used for the first filter option.

Exampler:
```html
<cs-searchfilter
  search-item-fn="$ctrl.searchData(searchStr)"
  placeholder-text="{{::'common.all' | translate}}"
  clear-aria-text="{{::'common.clear' | translate}}"
  search-placeholder-text="{{::'common.search' | translate}}">
</cs-searchfilter>
```

### cs-toggle-switch

cs-toggle-switch instances are automatically added to the tab-index, but will all need an aria-label added.  The tag `cs-aria-label` is used to pass a string into the toggle switch that is then applied internally to the aspect of the switch in the tabindex.

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

### Popovers

Popovers are not automatically added to the tabindex and do not react to keyboard focus by default.  You'll need to ensure that the popover includes a focus trigger.  Check to make sure an aria-label is actually necessary before adding one.

Example:
```html
<span class="ellipsis"
  popover-trigger="mouseenter focus"
  popover="{{$ctrl.popoverText.length > $ctrl.tooLong ? $ctrl.popoverText : ''}}"
  tabindex="0">
  {{$ctrl.popoverText}}
</span>
```

### Tooltips

NOTICE: For streamlining the accessibility process, check out the new [tooltip components](#tooltip-wrapper-components) which wrap around the collab-ui-ng tooltip.

Similar to popovers, tooltips are not automatically added to the tabindex, nor do they automatically react to receiving keyboard focus.  Please ensure that all tooltips on the page have `focus` included as a `tooltip-trigger`, a `tabindex` of 0 and an `aria-label` that matches the displayed text of the tooltip.  In cases where the tooltip displays html in addition to the text, the text provided to the `aria-label` should not include the html elements.

Examples:
```html
<!-- Regular tooltip -->
<i
  aria-label="{{::'tooltip.demo' | translate}}"
  class="icon info-icon"
  role="tooltip"
  tabindex="0"
  tooltip="{{::'tooltip.demo' | translate}}"
  tooltip-trigger="focus mouseenter"></i>

<!-- Tooltip with html -->
<i
  aria-label="{{::$ctrl.getTextOnly()}}"
  class="icon info-icon"
  role="tooltip"
  tabindex="0"
  tooltip-html-unsafe="{{::$ctrl.getUnsafeHtml()}}"
  tooltip-trigger="focus mouseenter"></i>
```

## Accessibility Service

There is now a service, the `AccessibilityService`, that has been created for generic accessibility related functions.  This includes the `setFocus` function, which takes in three variables: `elem: ng.IRootElementService, identifier: string, time?: number`.

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

There is currently one readonly variable - `public readonly MODAL = '.modal-content';`.  If `this.AccessibilityService.MODAL` is used for checking modal visibility - such as when verifying the correct escape key behavior - the optional `elem` variable should not be passed in to `isVisible` with it, as the modal is not appended to the component that creates it.

Example:
```typescript
// This will search the entire page for '.modal-content'; if a modal is present then it will be found appended to the top of the <body>
this.AccessibilityService.isVisible(this.AccessibilityService.MODAL);

// This will search only the component for '.modal-content'; even if a modal is present on screen, the function will never find it
this.AccessibilityService.isVisible(this.AccessibilityService.MODAL, this.$element);
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

- `cs-card-member` can be utilized with draggable using the tags `cs-index`, `is-selected`, and `cs-reorder-keypress`
```html
<div id="cardContainer" ng-class="{'card-reorder': $ctrl.isReordering}">
  <cs-card-member
    ng-repeat="card in $ctrl.cards track by $index"
    cs-type="{{::card.cardType}}"
    cs-member-type="{{::card.type}}"
    cs-complex-card-type="{{::card.complexCardType}}"
    cs-id="card.id"
    cs-index="$index"
    cs-title="card.name"
    cs-reordering="$ctrl.isReordering"
    cs-reorder-keypress="$ctrl.itemKeypress($event, id)"
    is-selected="$ctrl.isSelectedItem(member)"
    delete-aria-label="{{::'common.delete' | translate}}"
    toggle-aria-label="{{::'common.toggleData' | translate}}">
  </cs-card-member>
</div>
```

## Tooltip Wrapper Components

Because creating a proper accessible tooltip is very verbose, wrapper components have been created to streamline the tooltip creation process for the most common element types.

Commonalities between tooltip components:
* All tooltips are added to the tabindex by default, but will include an optional tabindex override: `tt-tabindex`.
* `aria-label` will only need to be provided in the cases where the tooltip text includes html; these should be passed in using `tt-aria-label`.
* Tooltips will default to `role="tooltip"` unless a click function or `tt-href` is provided; then it will be set to `role="button"`.  Do not use `ng-click` to append the click function.  Use `on-click-fn` instead.
* `tooltip-trigger` is set to `mouseover focus` by default and cannot be modified.
* `tt-tooltip-placement`, `tt-tooltip-append-to-body`, `tt-tooltip-animation` and `tt-tooltip-class` are pass-throughs to the tooltip tags of the same name (minus the `tt-`) in the [collab-ui tooltip](#tooltips).
* All tooltips will share the following bindings:
```typescript
public bindings = {
  ttAriaLabel: '@?',            // optional aria-label text
  ttClass: '@?',                // optional icon class names
  ttTabindex: '<?',             // optional tabindex override
  ttTooltipAnimation: '<?',     // same as tooltip-animation from collab-ui-ng - default setting is true
  ttTooltipAppendToBody: '<?',  // same as tooltip-append-to-body from collab-ui-ng - default setting is false
  ttTooltipClass: '@?',         // same as tooltip-class from collab-ui-ng
  ttTooltipPlacement: '@?',     // same as tooltip-placement from collab-ui-ng - default setting is 'top'
  ttTooltipTrigger: '@?',       // same as tooltip-trigger from collab-ui-ng - default setting is 'mouseenter focus'
  ttTooltipText: '@',           // safe text for the tooltip to display, used for the aria-label if cs-aria-label is undefined
  ttTooltipUnsafeText: '@?',    // unsafe text passed into tooltip-html-unsafe; should be used in conjunction with cs-aria-label
  onClickFn: '&?',              // optional click function if tooltip doubles as button; changes role from 'tooltip' to 'button' when present
};
```

### icon-tooltip

The majority of our tooltips have icon only triggers.  `icon-tooltip` is used specifically for these cases and defaults to the `icon-information` class for the trigger icon, as this appears to be one of the most used tooltip trigger icons.

Examples:
* The minimum effort for an accessible tooltip.  Creates an `icon-information` trigger tooltip with the `tooltip-text` used both in the tooltip itself and as the `aria-label`.
```html
<icon-tooltip tt-tooltip-text="{{::'common.tooltip' | translate}}"></icon-tooltip>
```
* The minimum effort for an `html-unsafe` tooltip.  Creates an `icon-information` trigger tooltip but requires separate values for the tooltip text and the `aria-label`.
```html
<icon-tooltip
  tt-aria-label="{{::'common.tooltip' | translate}}"
  tt-tooltip-unsafe-text="{{::'common.tooltipWithHtml' | translate}}">
</icon-tooltip>
```

### text-tooltip

`text-tooltip` is used specifically for tooltips with text triggers.  These are not to be used for button tooltips (those will use [button-tooltip](#button-tooltip) below) or input tooltips (which will use [input-tooltip](#input-tooltip)), though a click function can still be attached using `on-click-fn`.

Examples:
* The minimum effort for an accessible tooltip.
```html
<text-tooltip tt-tooltip-text="{{::'common.tooltip' | translate}}">
  <span translate="transcluded.text"><span>
</text-tooltip>
```
* The minimum effort for an `html-unsafe` tooltip.
```html
<text-tooltip
  tt-aria-label="{{::'common.tooltip' | translate}}"
  tt-tooltip-unsafe-text="{{::'common.tooltipWithHtml' | translate}}">
  <span translate="transcluded.text"><span>
</text-tooltip>
```

### link-tooltip

`link-tooltip` adds an extra required binding - `tt-href` - to pass in the `href` for the anchor element.  The `link-tooltip` is otherwise similar to the `text-tooltip` in creation.

Examples:
* The minimum effort for an accessible tooltip.
```html
<link-tooltip
  tt-href="http://www.fakewebsite.com"
  tt-tooltip-text="{{::'common.tooltip' | translate}}">
  <span translate="transcluded.text"><span>
</link-tooltip>
```
* The minimum effort for an `html-unsafe` tooltip.
```html
<link-tooltip
  tt-aria-label="{{::'common.tooltip' | translate}}"
  tt-href="http://www.fakewebsite.com"
  tt-tooltip-unsafe-text="{{::'common.tooltipWithHtml' | translate}}">
  <span translate="transcluded.text"><span>
</link-tooltip>
```

### button-tooltip

`button-tooltip` combines `tooltip` and `cs-btn` so that the button and the tooltip are a single location when navigating via keyboard.  Two bindings are added to control whether the tooltip is disabled - `tt-disabled` - and the `cs-btn` loading state - `tt-loading`.  They are both optional boolean variables.  If the variables are not provided, both the disabled and loading states will default to false.

Examples:
* The minimum effort for an accessible tooltip.
```html
<button-tooltip tt-tooltip-text="{{::'common.tooltip' | translate}}">
  <span translate="transcluded.text"><span>
</button-tooltip>
```
* The minimum effort for an `html-unsafe` tooltip.
```html
<button-tooltip
  tt-aria-label="{{::'common.tooltip' | translate}}"
  tt-tooltip-unsafe-text="{{::'common.tooltipWithHtml' | translate}}">
  <span translate="transcluded.text"><span>
</button-tooltip>
```
* `button-tooltip` with a loading state and disabled state
```html
<button-tooltip
  tt-disabled="$ctrl.disabled"
  tt-loading="$ctrl.loading"
  tt-tooltip-text="{{::'common.tooltipWithHtml' | translate}}">
  <span translate="transcluded.text"><span>
</button-tooltip>
```

### input-tooltip

TODO: create tooltip with text input trigger

### pro-pack-tooltip

TODO: create a tooltip specifically for the pro-pack icon, as this is a commonly used tooltip that utilizes `cr-pro-pack-icon`

---

# Miscellaneous

## Keyboard Events and Keycodes

Keyboard events and mouse click events don't always match up as expected; when tabbing through the page please verify that the enter/space/escape/etc. keys all work as expected.  Additionally, some components may require special behavior for certain keys, such as when navigating through a list with arrow keys.  There is now a `KeyCodes` enum, found under `'modules/core/accessibility'` that can be imported as necessary.

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

Notes: Currently Atlas is checking against [`.keyCode`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode) and [`.which`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/which), both of which are deprecated but use the same numerical keyvalues to represent keypresses.  Atlas should migrate to using [`.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) in the future.  However, the [keyvalues](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) returned by `.key` are not the same numerical values used by `.keyCode` and `.which`.  While `.key` can be used now, please keep in mind that all of Atlas will need to be updated to `.key` and make your code decisions based on what will make migration easier down the road.

## Maintaining Focus

Ideally, visible focus should never be lost when interacting with Atlas via keyboard.  To that end, please ensure that when the page changes in some way, focus is moved to the expected element.  In many cases, focus should remain the same as it was before the page updated, such as when an `ng-if` causes hidden parts of a form to appear.  In other cases, focus should be automatically updated either by tags in the html causing focus to automatically shift to the correct element or by the controller.

### focus-on

In the html, the `focus-on` tag can be added to an element to cause it to immediately grab focus after being rendered.  This is ideal when loading a new page, as it will cause focus to immediately jump to this element.

Example:
```html
<input type="text" focus-on />
```

Warning: Be very careful about using `focus-on` to draw focus to an element.  Some components are used in multiple places and an element in those components may need to be automatically focused on when it's a single page in a model but not when it's a single part of an overall settings page.  In these cases, `focus-on` can cause focus to jump to the wrong place on some pages and the [AccessibilityService](#accessibility-service) should be used to set focus instead.

## ng-if vs ng-show and ng-hide

[ng-if](https://docs.angularjs.org/api/ng/directive/ngIf) adds or removes a section of html based on an expression.  Similarly, [ng-show](https://docs.angularjs.org/api/ng/directive/ngShow) and [ng-hide](https://docs.angularjs.org/api/ng/directive/ngHide) will change the visibility of a section of html based on an expression.  While the three directives fulfill similar purposes, `ng-show` and `ng-hide` should be avoided if at all possible as hidden html may still be part of the tabindex.  Tooltips, for example, will still be accessible even when not visible.  `ng-if`, however, completely removes the elements from the DOM tree and thus also removes them from the tabindex.

Examples:
```html
<!-- tooltip hidden with ng-show/hide will still be keyboard accessible when not visible because tabindex="0" places it in the tabindex regardless -->
<i class="icon info-icon"
  ng-show="$ctrl.show"
  tooltip="{{::'tooltip.demo' | translate}}"
  tooltip-trigger="focus mouseenter"
  tabindex="0"
  aria-label="{{::'tooltip.demo' | translate}}"></i>

<!-- ng-if removes the tooltip from the DOM when the expression is false -->
<i class="icon info-icon"
  ng-if="$ctrl.show"
  tooltip="{{::'tooltip.demo' | translate}}"
  tooltip-trigger="focus mouseenter"
  tabindex="0"
  aria-label="{{::'tooltip.demo' | translate}}"></i>
```
