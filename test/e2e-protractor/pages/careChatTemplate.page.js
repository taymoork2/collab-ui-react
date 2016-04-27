'use strict';

var ChatTemplateCreation = function () {
  this.setUpTitle = element(by.css('.ct-title .h1'));
  this.setUpDesc = element(by.css('.h4.ct-title-desc'));
  this.setUpLeftBtn = element(by.css('.btn--primary.btn--left'));
  this.setUpRightBtn = element(by.css('.btn--primary.btn--right'));
};

module.exports = ChatTemplateCreation;
