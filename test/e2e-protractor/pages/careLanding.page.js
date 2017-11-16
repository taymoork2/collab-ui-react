'use strict';

var CareLandingPage = function () {
  this.careCard = element(by.css('.care-bar'));
  this.careIcon = element(by.css('.icon-circle-contact-centre'));
  this.careTitle = element(by.cssContainingText('h4', 'Care'));
  this.careFeature = element(by.css('a[href*="/services/careDetails/features"]'));
  this.creatCTButton = element(by.css('.care-features .btn--people'));
  this.foundCardName = element(by.css('.cs-card-container .cs-card-layout .small header p'));
  this.deleteCardBtnOnCard = element(by.css('.cs-card-container .cs-card-layout .small .right .close'));
  this.editCardBtnOnCard = element(by.css('.cs-card-container .cs-card-layout .small article'));
  this.deleteTemplateOnModal = element(by.css('.btn.btn--negative'));
};

module.exports = CareLandingPage;
