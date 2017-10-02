export class CallParkFeaturePage {
  constructor() {
    // Setup assistant pages
    this.createCPTitle = element(by.cssContainingText('h2.title', 'Create Call Park'));
    this.closeBtn = element(by.id('close-panel'));
    this.toNextPage = element(by.css('span.icon.icon-arrow-next'));
    this.disabledBtn = element(by.css('button.btn--circle.btn--primary.btn--right.disabled'));
    this.description = element(by.css('p.input-description'));
    this.cpName = element(by.css('input.form-control'));
    this.enableBtn = element(by.css('button.btn--circle.btn--primary.btn--right'));
    this.closeDialog = element(by.css('div.modal-content.undefined.dialog'));
    this.closeModalTitle = element(by.cssContainingText('h3.modal-title', 'Cancel Call Park Creation'));
    this.continueBtn = element(by.id('continueCallPark'));
    this.cancelBtn = element(by.id('cancelCallPark'));
    this.featureTitle = element(by.cssContainingText('div.title', 'Select Call Park Number'));
    this.featureDesc = element(by.cssContainingText('div.desc', 'Number ranges are used for interdepartmental transfers while single park numbers are for individual use.'));
    this.featureBackArrow = element(by.css('span.icon.icon-arrow-back'));
    this.startNumber = element(by.css('[name="startRange"]'));
    this.endNumber = element(by.css('[name="endRange"]'));
    this.singleNumber = element(by.css('[name="singleNumber"]'));
    this.leftPanel = element(by.css('div.left-panel'));
    this.rightPanel = element(by.css('div.right-panel'));
    this.leftSide = element(by.cssContainingText('p.title', '350'));
    this.rightSide = element(by.css('i.icon.icon-exit'));
    this.inputMember = element(by.css('[placeholder="Search & Add Members"]'));
    this.memberCard = element(by.css('div.card-member'));
    this.memberLeft = element(by.css('div.left-panel'));
    this.memberMiddle = element(by.css('div.middle-panel'));
    this.memberRight = element(by.css('div.right-panel'));
    this.createEnabled = element(by.cssContainingText('div.btn-helptext.helptext-btn--right', 'Create'));
    this.numberDropdown = element(by.css('[template-url="ranges.html"]'));
    this.memberDropdown = element(by.css('[template-url="callFeatureMemberWithNumberTemplate.html"]'));
    // Feature page
    this.article = element(by.css('article'));
    this.cpDetailHeader = element(by.css('div.header-with-right-icon'));
    this.btnClose = element(by.css('button.close'));
    this.cpPilot = element(by.cssContainingText('span.card-section-num', 'Numbers'));
    this.cpMembersCount = element(by.cssContainingText('span.card-members.left', 'Members'));
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
    this.editCancel = element(by.cssContainingText('button', 'Cancel'));
    this.editSave = element(by.cssContainingText('button', 'Save'));
    this.anotherDestination = element(by.css('[for="radioParkDestination"]'));
    this.fallbackDestination = element(by.css('input[typeahead-template-url="fallbackDestinationTemplate.html"]'));
    this.fallbackDestinationDropdown = element(by.css('ul[template-url="fallbackDestinationTemplate.html"]'));
    this.fallbackDestinationFormat = element(by.css('span.select-toggle'));
    this.fallbackDestinationExternal = element(by.cssContainingText('a', 'External'));
    this.fallbackDestinationExternalNumber = element(by.css('div.phone-number input'));
    this.reversionTimerSelect = element(by.css('ul.select-options li:first-child'));
    this.memberAdd = element(by.id('callfeaturememberadd'));
    this.firstMemberCardRemove = element(by.css('div.members-container cs-card-member:first-child div.right-panel'));
  }
};
