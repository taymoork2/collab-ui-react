export class AddUserPage {
  constructor() {
    this.modalDialog = {
      title: element(by.css('.modal-title.ng-scope')),
    };
    this.inactivePlusIcon = element(by.css('.plus-icon-inactive'));
    this.sparkCallRadio = element(by.css('[cs-input-label="Cisco Spark Call"]+label'));
    this.assignNumbers = {
      title: element(by.css('h3.modal-title.ng-scope')),
      subMenu: element(by.id('addDnAndExtToUserOptionButtons')),
    };
    this.extensionColumnTitle = element(by.cssContainingText('.ui-grid-header-cell-label.ng-bindin', ' Extension'));
    this.successPage = {
      newUserCount: element(by.css('[translate="usersPage.newUsers"]')),
      recordsProcessed: element(by.css('.results-total.ng-binding')),
    };
    this.usersList = {
      searchFilter: element(by.id('searchFilter')),
      userFirstName: element.all(by.css('.ui-grid-cell-contents.ng-binding.ng-scope')).first(),
    };
    this.callOverview = {
      directoryNumbers: {
        title: element(by.css('[translate="directoryNumberPanel.directNumbers"]')),
        number: element(by.css('[ng-click="$ctrl.onDirectoryNumberClick()"]')),
      },
      features: {
        title: element(by.css('[translate="telephonyPreview.features"]')),
        singleNumberReach: element(by.cssContainingText('.feature-name.ng-binding', 'Single Number Reach')),
        speedDials: element(by.cssContainingText('.feature-name.ng-binding', 'Speed Dials')),
        dialingRestrictions: element(by.cssContainingText('.feature-name.ng-binding', 'Dialing Restrictions')),
      },
    };
    this.callSubMenu = element.all(by.css('[ui-sref="user-overview.communication"]')).get(2);
    this.speedDial = {
      title: element(by.cssContainingText('.section-title-row', 'Speed Dial Numbers')),
    };
    this.dialingRestrictions = {
      nationaDialing: {
        title: element(by.cssContainingText('.section-title-row.ng-scope', 'National Dialing')),
      },
      premiumDialing: {
        title: element(by.cssContainingText('.section-title-row.ng-scope', 'Premium Dialing')),
      },
      internationalDialing: {
        title: element(by.cssContainingText('.section-title-row.ng-scope', 'International Dialing')),
      },
    };
    this.lineConfiguration = {
      title: element(by.cssContainingText('.section-title-row', 'Line Configuration')),
      directoryNumbers: {
        title: element(by.cssContainingText('.section__title.ng-scope', 'Directory Numbers')),
      },
      callForwarding: {
        title: element(by.cssContainingText('.section__title.ng-scope', 'Call Forwarding')),
      },
      simultaneousCalling: {
        title: element(by.cssContainingText('.section__title.ng-scope', 'Simultaneous Calls')),
      },
      callerId: {
        title: element(by.cssContainingText('.section__title.ng-scope', 'Caller ID')),
      },
      autoAnswer: {
        title: element(by.cssContainingText('.section__title.auto-answer-title.ng-binding', 'Auto Answer')),
      },
      sharedLine: {
        title: element(by.cssContainingText('.section__title.ng-scope', 'Shared Line')),
      },
    };
  }
};
