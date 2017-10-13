export class CallUserPhoneButtonLayoutPage {
  constructor() {
    this.actionMenu = element(by.css('[class="actions-button btn--none dropdown-toggle"]'));
    this.title = element(by.cssContainingText('.section-title-row', 'Phone Button Layout & Speed Dials'));
    this.addButtonAction = element(by.cssContainingText('[ng-click="action.actionFunction()"]', 'Add Button'));
    this.reorderButtonAction = element(by.cssContainingText('[ng-click="action.actionFunction()"]', 'Reorder'));
    this.buttonCancelButton = element(by.cssContainingText('[ng-click="$ctrl.reset()"]', 'Cancel'));
    this.buttonSaveButton = element(by.cssContainingText('[ng-click="$ctrl.save()"]', 'Save'));
    this.newButtonDropDown = element(by.cssContainingText('[ng-click="csSelect.toggleOpen($event);"]', 'Speed Dial'));
    this.newSpeedDialContactNameLabel = element(by.cssContainingText('.cs-input-group.cs-input-text', 'Contact Name'));
    this.newSpeedDialNumberFormat = element(by.cssContainingText('[ng-click="csSelect.toggleOpen($event);"]', 'External'));
    this.newSpeedDialContactName = element(by.css('[placeholder="Contact Name"]'));
    this.newSpeedDialContactNameInput = element(by.css('[cs-input-label="Contact Name"]'));
    this.newSpeedDialDestinationInputPhone = element(by.css('[ng-model="$ctrl.phoneNumber"]'));
    this.newSpeedDialDestinationInputUri = element(by.css('[id="uriAddressInput"]'));
    this.newSpeedDialDestinationInputCustom = element(by.css('[id="customNumberInput"]'));
    this.newSpeedDialContactNameInput = element(by.css('[ng-model="$ctrl.newLabel"]'));
    this.speedDialLabels = element.all(by.css('.phonebutton-label'));
    this.firstSpeedDialEntryLabel = element.all(by.css('.phonebutton-label')).get(2);
    this.phoneButtonEntryDraggableHandles = element.all(by.css('.icon.icon-tables'));
    this.speedDialEntries = element.all(by.css('.phonebuttonlayout-readonly-wrapper'));
    this.firstSpeedDialDeleteButton = element.all(by.css('[ng-click="$ctrl.delete(phoneButton)"]')).get(0);
    this.firstSpeedDialEditButton = element.all(by.css('[ng-click="$ctrl.setEdit(phoneButton)"]')).get(0);
    this.speedDialDeleteConfirmationButton = element(by.css('[translate="common.delete"]'));
    this.firstFeatureNoneLabel = element.all(by.css('.phonebutton-label')).last();
    this.firstEmptyDeleteButton = element.all(by.css('[ng-click="$ctrl.delete(phoneButton)"]')).last();
    this.firstEmptyEditButton = element.all(by.repeater('phoneButton in $ctrl.phoneButtonList')).last().element(by.css('[ng-click="$ctrl.setEdit(phoneButton)"]'));
    this.firstLineEditButton = element.all(by.repeater('phoneButton in $ctrl.phoneButtonList')).get(0).element(by.css('[ng-click="$ctrl.setEdit(phoneButton)"]'));
    this.firstLineDeleteButton = element.all(by.repeater('phoneButton in $ctrl.phoneButtonList')).get(0).element(by.css('[ng-click="$ctrl.delete(phoneButton)"]'));
    this.addNewLine = element(by.css('[translate="usersPreview.addNewLinePreview"]'));
  }
};
