export class CallUserPage {
  constructor() {
    this.modalDialog = {
      title: element(by.css('.modal-title')),
    };
    this.inactivePlusIcon = element(by.css('.plus-icon-inactive'));
    this.sparkCallRadio = element(by.css('[cs-input-label="Cisco Spark Call"]+label'));
    this.assignNumbers = {
      title: element(by.css('h3.modal-title')),
      subMenu: element(by.id('addDnAndExtToUserOptionButtons')),
    };
    this.extensionColumnTitle = element(by.cssContainingText('.ui-grid-header-cell-label', ' Extension'));
    this.successPage = {
      newUserCount: element(by.css('[translate="usersPage.newUsers"]')),
      recordsProcessed: element(by.css('.results-total')),
    };
    this.usersList = {
      searchFilter: element(by.id('searchFilter')),
      userFirstName: element.all(by.css('.ui-grid-canvas .ui-grid-cell-contents')).first(),
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
        phoneButtonLayout: element(by.cssContainingText('.feature-name', 'Phone Button Layout & Speed Dials')),
      },
    };
    this.callSubMenu = element.all(by.css('a[ui-sref="user-overview.communication"]')).get(0);
    this.dialingRestrictions = {
      nationaDialing: {
        title: element(by.cssContainingText('.section-title-row', 'National Dialing')),
      },
      premiumDialing: {
        title: element(by.cssContainingText('.section-title-row', 'Premium Dialing')),
      },
      internationalDialing: {
        title: element(by.cssContainingText('.section-title-row', 'International Dialing')),
      },
    };
    this.lineConfiguration = {
      title: element(by.cssContainingText('.section-title-row', 'Line Configuration')),
      directoryNumbers: {
        title: element(by.cssContainingText('.section__title', 'Directory Numbers')),
      },
      callForwarding: {
        title: element(by.cssContainingText('.section__title', 'Call Forwarding')),
      },
      simultaneousCalling: {
        title: element(by.cssContainingText('.section__title', 'Simultaneous Calls')),
      },
      callerId: {
        title: element(by.cssContainingText('.section__title', 'Caller ID')),
      },
      autoAnswer: {
        title: element(by.cssContainingText('.section__title.auto-answer-title', 'Auto Answer')),
      },
      sharedLine: {
        title: element(by.cssContainingText('.section__title', 'Shared Line')),
      },
    };
  }
};
