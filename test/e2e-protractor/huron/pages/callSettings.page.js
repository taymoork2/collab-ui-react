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
    this.regionalSettingsTitle = element(by.cssContainingText('.section__title.ng-scope', 'Regional Settings'));
    this.internalDialingTitle = element(by.cssContainingText('.section__title.ng-scope', 'Internal Dialing'));
    this.externalDialingTitle = element(by.cssContainingText('.section__title.ng-scope', 'External Dialing'));
    this.dialingRestrictionsTitle = element(by.cssContainingText('.section__title.ng-scope', 'Dialing Restrictions'));
    this.companyCallerIdTitle = element(by.cssContainingText('.section__title.ng-scope', 'Company Caller ID'));
    this.companyVoicemailTitle = element(by.cssContainingText('.section__title.ng-scope', 'Company Voicemail'));
  }
};
