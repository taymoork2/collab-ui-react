export class CallParkFeaturePage {
  constructor() {
    // Setup assistant pages
    this.createCPTitle = element(by.cssContainingText('h2.title.ng-binding', 'Create Call Park'));
    this.closeBtn = element(by.id('close-panel'));
    this.toNextPage = element(by.css('span.icon.icon-arrow-next'));
    this.disabledBtn = element(by.css('button.btn--circle.btn--primary.btn--right.disabled'));
    this.description = element(by.css('p.input-description.ng-binding'));
    this.cpName = element(by.css('input.form-control'));
    this.enableBtn = element(by.css('button.btn--circle.btn--primary.btn--right'));
    this.closeDialog = element(by.css('div.modal-content.undefined.dialog'));
    this.closeModalTitle = element(by.cssContainingText('h3.modal-title', 'Cancel Call Park Creation'));
    this.continueBtn = element(by.id('continueCallPark'));
    this.cancelBtn = element(by.id('cancelCallPark'));
    this.featureTitle = element(by.cssContainingText('div.title', 'Select Call Park Number'));
    this.featureDesc = element(by.cssContainingText('div.desc', 'Number ranges are used for interdepartmental transfers while single park numbers are for individual use.'));
    this.featureBackArrow = element(by.css('span.icon.icon-arrow-back'));
    this.featureBackArrow = element(by.css('span.icon.icon-arrow-back'));
    this.startNumber = element(by.css('[name="startRange"]'));
    this.endNumber = element(by.css('[name="endRange"]'));
    this.singleNumber = element(by.css('[name="singleNumber"]'));
    this.leftPanel = element(by.css('div.left-panel'));
    this.rightPanel = element(by.css('div.right-panel'));
    this.leftSide = element(by.cssContainingText('p.title.ng-binding', '310'));
    this.rightSide = element(by.css('i.icon.icon-exit'));
    this.inputMember = element(by.css('[placeholder="Search & Add Members"]'));
    this.memberCard = element(by.css('div.card-member'));
    this.memberLeft = element(by.css('div.left-panel'));
    this.memberMiddle = element(by.css('div.middle-panel'));
    this.memberRight = element(by.css('div.right-panel'));
    this.createEnabled = element(by.cssContainingText('div.btn-helptext.helptext-btn--right.ng-binding.active.enabled', 'Create'));
    // Feature page
    this.article = element(by.css('article'));
    this.cpDetailHeader = element(by.cssContainingText('div.header-with-right-icon', 'new-cp'));
    this.btnClose = element(by.css('button.close'));
    this.cpPilot = element(by.css('span', '10 Numbers'));
    this.cpMembersCount = element(by.css('span.card-members.left', '1 Members'));
    this.deleteCP = element(by.cssContainingText('p.h3.modal-title', 'Delete'));
    this.cancelDeleteFeature = element(by.id('cancelDeleteFeature'));
    this.deleteFeature = element(by.id('deleteFeature'));
    // Edit page
    this.editName = element(by.name('editCallFeatureName'));
    this.editStartRange = element(by.name('startRange'));
    this.editEndRange = element(by.name('endRange'));
    this.editRevTime = element(by.css('input.combo-input'));
    this.editBackBtn = element(by.css('i.icon.icon-arrow-back'));
    this.editMemberCard = element(by.css('p.title'));
  }
};
