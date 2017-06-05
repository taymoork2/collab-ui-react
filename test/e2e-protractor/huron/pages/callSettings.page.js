export class CallSettingsPage {
  constructor() {
    this.reservePrefixRadio = element(by.css('label[for="routingPrefixReserve"]'));
    this.dialingPrefixInput = element(by.id('dialingPrefix'));
    this.saveButton = element(by.css('.save-section .btn--primary'));
    this.dialPlanWarningModalTitle = element(by.cssContainingText('.modal-title', 'Dial Plan Settings'));
    this.dialPlanWarningYesBtn = element(by.css('.modal-footer .btn--primary'));
    this.addExtensionRangeBtn = element(by.css('uc-extension-range .btn-link'));
    this.beginRange = element(by.id('beginRange1'));
    this.endRange = element(by.id('endRange1'));
    this.extensionLengthModalTitle = element(by.cssContainingText('.modal-title', 'Warning'));
  }
};
