export class CallSettingsPage {
  constructor() {
    this.reservePrefixRadio = element(by.css('label[for="routingPrefixReserve"]'));
    this.dialingPrefixInput = element(by.id('dialingPrefix'));
    this.saveButton = element(by.css('.save-section .btn--primary'));
    this.dialPlanWarningModalTitle = element(by.cssContainingText('.modal-title', 'Dial Plan Settings'));
    this.dialPlanWarningYesBtn = element(by.css('.modal-footer .btn--primary'));
    this.addExtensionRangeBtn = element(by.css('uc-extension-range .btn-link'));
    this.beginRange = element(by.css('input#beginRange1'));
    this.endRange = element(by.css('input#endRange1'));
    this.extensionLengthWarningTitle = element(by.cssContainingText('.modal-title', 'Warning'));
    this.continueButton = element(by.cssContainingText('button', 'Continue'));
    this.extensionPrefixTitle = element(by.cssContainingText('.modal-title', 'Choose Prefix'));
    this.extensionPrefixInput = element(by.id('extensionPrefix'));
    this.extensionPrefixSaveButton = element(by.css('.modal-footer .btn-primary'));
  }
};
