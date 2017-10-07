export class AddHuntGroupPage {
  constructor() {
    // Used in step 1 of proviosing name of hunt group
    this.createHGTtile = element(by.cssContainingText('h2.title', 'Create Hunt Group'));
    this.closeBtn = element(by.id('close-panel'));
    this.toNextPage = element(by.css('span.icon.icon-arrow-next'));
    this.disabledBtn = element(by.css('button.btn--circle.btn--primary.btn--right.disabled'));
    this.description = element(by.css('p.input-description'));
    this.hgName = element(by.css('input.form-control'));
    this.enableBtn = element(by.css('button.btn--circle.btn--primary.btn--right'));
    this.closeDialog = element(by.css('div.modal-content.undefined.dialog'));
    this.closeModalTitle = element(by.cssContainingText('h3.modal-title', 'Cancel Hunt Group Creation'));
    this.continueBtn = element(by.id('continueHuntGroup'));
    this.cancelBtn = element(by.id('cancelHuntGroup'));
    // Used in second step of provisioning number of hunt group
    this.featureTitle = element(by.cssContainingText('div.feature-title', 'Select Pilot Numbers'));
    this.featureDesc = element(by.cssContainingText('div.feature-desc', 'When these numbers are called, this hunt group will ring'));
    this.featureBackArrow = element(by.css('span.icon.icon-arrow-back'));
    this.featureBackArrow = element(by.css('span.icon.icon-arrow-back'));
    this.inputNumber = element(by.css('input'));
    this.firstCard = element.all(by.css('div.cs-card-number')).first();
    this.lastCard = element.all(by.css('div.cs-card-number')).last();
    this.leftPanel = element(by.css('div.left-panel'));
    this.rightPanel = element(by.css('div.right-panel'));
    this.leftSide = element(by.cssContainingText('p.title', '325'));
    this.rightSide = element(by.css('i.icon.icon-exit'));
    this.inputMember = element(by.css('input'));
    this.firstHG = element(by.cssContainingText('p.title', '325'));
    this.secondHG = element(by.cssContainingText('p.title', '326'));
    this.longestIdle = element(by.cssContainingText('div', 'Longest Idle'));
    this.broadcast = element(by.cssContainingText('div', 'Broadcast'));
    this.circular = element(by.cssContainingText('div', 'Circular'));
    this.topDown = element(by.cssContainingText('div', 'Top Down'));
    this.memberCard = element(by.css('div.card-member'));
    this.memberLeft = element(by.css('div.left-panel'));
    this.memberMiddle = element(by.css('div.middle-panel'));
    this.memberRight = element(by.css('div.right-panel'));
    this.fallbackTitle = element(by.cssContainingText('div.feature-title', 'Select Fallback Destination Number'));
    this.internalDest = element(by.cssContainingText('button.call-dest-button', 'Internal'));
    this.externalDest = element(by.cssContainingText('button.call-dest-button', 'External'));
    this.createEnabled = element(by.cssContainingText('div.btn-helptext.helptext-btn--right.active.enabled', 'Create'));
    this.article = element(by.css('article'));
    this.hgDetailHeader = element(by.css('div.header-with-right-icon'));
    this.btnClose = element(by.css('button.close'));
    this.hgPilot = element(by.css('span.card-section-num', '2 Numbers'));
    this.hgMembersCount = element(by.css('span.card-members.left', '1 Members'));
    this.deleteHG = element(by.cssContainingText('p.h3.modal-title', 'Delete'));
    this.cancelDeleteFeature = element(by.id('cancelDeleteFeature'));
    this.deleteFeature = element(by.id('deleteFeature'));
  }
};
