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
    this.regionalSettingsTitle = element(by.cssContainingText('.section__title', 'Regional Settings'));
    this.internalDialingTitle = element(by.cssContainingText('.section__title', 'Internal Dialing'));
    this.externalDialingTitle = element(by.cssContainingText('.section__title', 'External Dialing'));
    this.dialingRestrictionsTitle = element(by.cssContainingText('.section__title', 'Dialing Restrictions'));
    this.companyCallerIdTitle = element(by.cssContainingText('.section__title', 'Company Caller ID'));
    this.companyVoicemailTitle = element(by.cssContainingText('.section__title', 'Company Voicemail'));
    // External Dialing Section
    this.dialWarning = element(by.cssContainingText('.text-wrap', 'First digit of Voicemail Access Prefix'));
    this.dialOneRadio = element(by.css('#nationalDialing'));
    this.dialOneChkBx = element(by.css('label[for="requireOneToDial"]'));
    this.dialChkbxEmpty = element(by.css('#requireOneToDial'));
    this.dialChkbxNotEmpty = element(by.css('#requireOneToDial'));
    this.pstnWarning = element(by.cssContainingText('.icon-warning', 'To use local dialing, you must setup your PSTN service'));
    this.simplifiedLocalRadio = element(by.css('.cs-radio[for="localDialing"]'));
    this.areaCode = element(by.css('input#areacode-input'));
    // Voicemail Section
    this.bottomOfPage = element.all(by.css('cs-input__help-text')).last();
    this.voicemailSwitch = element(by.css('label[for="companyVoicemailToggle"]'));
    this.voicemailWarningModalTitle = element(by.cssContainingText('.modal-title', 'Turning On Company Voicemail'));
    this.voicemailModalDoneButton = element(by.id('doneButton'));
    this.externalVoicemailCheckBox = element(by.css('label[for="externalVoicemailAccess"]'));
    this.externalVoicemailDropdown = element.all(by.css('[name="companyVoicemailNumber"]')).first();
    this.voicemailToEmailCheckBox = element(by.css('label[for="voicemailToEmail"]'));
    this.voicemailDisableTitle = element(by.cssContainingText('.modal-title', 'Disable Company Voicemail'));
    this.voicemailWarningDisable = element(by.css('.modal-footer .btn--negative'));
    // Regional Settings
    this.cancelButton = element(by.buttonText('Cancel'));
    this.timeZone = element(by.css('.csSelect-container[name="timeZone"] span.select-toggle'));
    this.dateFormat = element(by.css('.csSelect-container[name="dateFormatSelect"] span.select-toggle'));
    this.timeFormat = element(by.css('.csSelect-container[name="timeFormatSelect"] span.select-toggle'));
    this.preferredLanguage = element(by.css('.csSelect-container[name="preferredLanguage"] span.select-toggle'));
    // Dialing Restrictions
    this.nationalDialing = element(by.css('label.disabled[for="DIALINGCOSTAG_NATIONAL-toggle"]'));
    this.premiumDialing = element(by.css('label.disabled[for="DIALINGCOSTAG_PREMIUM-toggle"]'));
    this.internationalDialing = element(by.css('label.disabled[for="DIALINGCOSTAG_INTERNATIONAL-toggle"]'));
  }
};

