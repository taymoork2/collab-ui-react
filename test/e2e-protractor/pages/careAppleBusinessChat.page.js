const CareAppleBusinessChatPage = function () {
  this.setUpLeftBtn = element(by.css('.btn--primary.btn--left'));
  this.setUpRightBtn = element(by.css('.btn--primary.btn--right'));
  this.setUpTitle = element(by.css('.ct-title .h3'));
  this.setUpDesc = element(by.css('.ct-title-desc'));

  //business id page
  this.businessId = element(by.name('idInput'));

  //name page
  this.nameHint = element(by.css('.ct-input-hint'));
  this.name = element(by.name('nameInput'));

  //cva page
  this.cvaDropdown = element(by.id('virtualAssistantSelect'));

  // Summary Page
  this.finishBtn = element(by.id('abcSetupFinishBtn'));
};

module.exports = CareAppleBusinessChatPage;
