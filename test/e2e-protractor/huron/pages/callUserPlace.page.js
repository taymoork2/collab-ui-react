export class CallUserPlacePage {
  constructor() {
    this.cancelButton = element(by.buttonText('Cancel'));
    this.saveButton = element(by.buttonText('Save'));

    this.ownerslist = {
      searchFilter: element(by.id('searchFilter')),
    };
    this.callOverview = {
      directoryNumbers: {
        title: element(by.css('[translate="directoryNumberPanel.directNumbers"]')),
        number: element(by.css('[ng-click="$ctrl.onDirectoryNumberClick()"]')),
      },
      addNewLine: element(by.css('a.as-button[translate="usersPreview.addNewLinePreview"]')),
      features: {
        title: element(by.css('[translate="telephonyPreview.features"]')),
        singleNumberReach: element(by.cssContainingText('.feature-name', 'Single Number Reach')),
        speedDials: element(by.cssContainingText('.feature-name', 'Speed Dials')),
        dialingRestrictions: element(by.cssContainingText('.feature-name', 'Dialing Restrictions')),
      },
    };
    this.lineConfiguration = {
      title: element(by.cssContainingText('.section-title-row', 'Line Configuration')),
    };
    this.directoryNumber = {
      title: element(by.cssContainingText('.section__title', 'Directory Numbers')),
      extension: element(by.cssContainingText('label', 'Extension')),
      internalNumber: element(by.css('.dropdown-menu input.select-filter')),
      phoneNumber: element(by.cssContainingText('label', 'Phone Number')),
    };

    this.callForwarding = {
      title: element(by.cssContainingText('.section__title', 'Call Forwarding')),
      radioNone: element(by.cssContainingText('label', 'Do not forward calls')),
      radioAll: element(by.cssContainingText('label', 'Forward all calls')),
      radioBusyOrAway: element(by.cssContainingText('label', 'Forward calls when line is busy or away')),

      destinationInputCustom: element(by.css('input#customNumberInput')),
      destinationInputPhone: element(by.css('[model="$ctrl.forwardAll.destination"] [ng-model="$ctrl.phoneNumber"]')),
      destinationInputUri: element(by.css('[model="$ctrl.forwardAll.destination"] [ng-model="$ctrl.inputModel"]')),
      forwardAllVoicemail: element(by.css('label[for="allDirectVoicemail"]')),

      busyInternalInputCustom: element(by.css('[model="$ctrl.busyInternal.destination"] [ng-model="$ctrl.inputModel"]')),
      busyinternalInputPhone: element(by.css('[model="$ctrl.busyInternal.destination"] [ng-model="$ctrl.phoneNumber"]')),
      busyInternalInputUri: element(by.css('[model="$ctrl.busyInternal.destination"] [ng-model="$ctrl.inputModel"]')),
      forwardInternalVoicemail: element(by.css('label[for="internalDirectVoicemail"]')),

      forwardBusyExternal: element(by.css('label[for="ckForwardExternalCalls"]')),
      busyExternalInputCustom: element(by.css('[model="$ctrl.busyExternal.destination"] [ng-model="$ctrl.inputModel"]')),
      busyExternalInputPhone: element(by.css('[model="$ctrl.busyExternal.destination"] [ng-model="$ctrl.phoneNumber"]')),
      busyExternalInputUri: element(by.css('[model="$ctrl.busyExternal.destination"]  [ng-model="$ctrl.inputModel"]')),
      forwardExternalVoicemail: element(by.css('label[for="externalDirectVoicemail"]')),
      forwardExternalSelectInput: element.all(by.css('.csSelect-container[name="CallDestTypeSelect"] ')),
    };

    this.simultaneousCalling = {
      title: element(by.cssContainingText('.section__title', 'Simultaneous Calls')),
      radio2: element(by.css('label[for="simultaneousTwo"]')),
      radio8: element(by.css('label[for="simultaneousEight"]')),
    };

    this.callerId = {
      title: element(by.cssContainingText('.section__title', 'Caller ID')),
      customName: element(by.css('input#callerIdName')),
      customNumber: element(by.css('[ng-form="callerIdForm"] [name="phoneinput"]')),
    };

    this.autoAnswer = {
      title: element(by.cssContainingText('.section__title.auto-answer-title', 'Auto Answer')),
    };

    this.sharedLine = {
      title: element(by.cssContainingText('.section__title', 'Shared Line')),
      member: element(by.css('.dropdown-menu ul li a')),
      inputMember: element(by.css('input#userInput')),
      accordionMember: element.all(by.css('.accordion .accordion--navigation')).get(0),
      sharedMember: element.all(by.css('.accordion--primary a')).get(0),
      removeMember: element(by.id('removeMemberLink')),
      removeMemberBtn: element(by.id('removeMemberButton')),
    };
  };
}
