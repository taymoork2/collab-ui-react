export class CallSpeedDialsPage {
  constructor() {
    this.actionMenu = element(by.css('[class="actions-button btn--none dropdown-toggle"]'));
    this.addSpeedDialAction = element(by.cssContainingText('[ng-click="action.actionFunction()"]', 'Add Speed Dial'));
    this.firstSpeedDialDeleteButton = element.all(by.css('[ng-click="$ctrl.delete(sd)"]')).first();
    this.firstSpeedDialEntryDraggableHandle = element.all(by.css('.icon.icon-tables')).first();
    this.firstSpeedDialEntryLabel = element.all(by.css('.sd-label.ng-binding')).first();
    this.newSpeedDialContactNameInput = element(by.css('[cs-input-label="Contact Name"]'));
    this.newSpeedDialContactNameLabel = element(by.cssContainingText('.cs-input-group.cs-input-text.ng-scope', 'Contact Name'));
    this.newSpeedDialDestinationDropdown = element(by.css('.csSelect-container[name="CallDestTypeSelect"]'));
    this.newSpeedDialDestinationInputCustom = element(by.css('[id="customNumberInput"]'));
    this.newSpeedDialDestinationInputPhone = element(by.css('[ng-model="$ctrl.phoneNumber"]'));
    this.newSpeedDialDestinationInputUri = element(by.css('[id="uriAddressInput"]'));
    this.newSpeedDialDestinationLabel = element(by.css('[translate="callDestination.numberFormat"]'));
    this.reorderSpeedDialAction = element(by.cssContainingText('[ng-click="action.actionFunction()"]', 'Reorder'));
    this.speedDialCancelButton = element(by.cssContainingText('[ng-click="$ctrl.reset()"]', 'Cancel'));
    this.speedDialSaveButton = element(by.cssContainingText('[ng-click="$ctrl.save()"]', 'Save'));
    this.speedDialDeleteConfirmationButton = element(by.css('[translate="common.delete"]'));
    this.speedDialEntries = element.all(by.css('.sd-readonly-wrapper.ng-scope'));
    this.speedDialLabels = element.all(by.css('.sd-label.ng-binding'));
    this.speedDialEntryDraggableHandles = element.all(by.css('.icon.icon-tables'));
    this.title = element(by.cssContainingText('.section-title-row', 'Speed Dial Numbers'));
  }
};
