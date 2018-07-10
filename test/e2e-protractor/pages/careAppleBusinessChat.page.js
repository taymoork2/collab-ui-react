const CareAppleBusinessChatPage = function () {
  this.setUpLeftBtn = element(by.css('.btn--primary.btn--left'));
  this.setUpRightBtn = element(by.css('.btn--primary.btn--right'));
  this.setUpTitle = element(by.css('.ct-title .h3'));
  this.setUpDesc = element(by.css('.ct-title-desc'));
  this.cancelBtn = element(by.id('close-panel'));
  this.confirmCancelBtn = element(by.id('cancelChat'));

  //business id page
  this.businessId = element(by.name('idInput'));

  //name page
  this.nameHint = element(by.css('.ct-input-hint'));
  this.name = element(by.name('nameInput'));

  //cva page
  const context = this;
  context.isNewPage = false;
  element.all(by.id('toggleCvaOn')).then(function (elements) {
    if (elements.length > 0) {
      context.toggleCvaOff = element(by.id('toggleCvaOff'));
      context.cvaDropdownStorage = element(by.id('virtualAssistantSelectStorage'));
      context.storageUrl = element(by.id('storageUrl'));
      context.storageToken = element(by.id('storageToken'));
      context.toggleCvaOn = element(by.id('toggleCvaOn'));
      context.isNewPage = true;
    }
  });

  this.cvaDropdown = element(by.id('virtualAssistantSelect'));

  // status message page
  this.waitingMessage = element(by.name('waitingMessageInput'));
  this.leftChatMessage = element(by.name('leftChatMessageInput'));

  // Summary Page
  this.finishBtn = element(by.id('abcSetupFinishBtn'));
};

module.exports = CareAppleBusinessChatPage;
