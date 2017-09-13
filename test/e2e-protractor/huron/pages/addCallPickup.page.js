export class CallPickupPage {
  constructor() {
    this.featureTitle = element(by.cssContainingText('h2.title.ng-binding', 'Create Call Pickup'));
    this.closePanel = element(by.id('close-panel'));
    this.nextArrow = element(by.css('span.icon.icon-arrow-next'));
    this.nameOfPickup = element(by.id('nameInput'));
    this.memberDrop = element(by.css('[ng-mouseenter="selectActive($index)"]'));
    this.memberInput = element(by.id('memberInput'));
    this.saveBtn = element(by.css('button.btn--circle.btn--primary.btn--right.save-call-feature'));
    this.saveBtnDisabled = element(by.css('button.btn--circle.btn--primary.btn--right.save-call-feature.disabled'));
    this.featureCards = element(by.css('feature-cards'));
  }
};
