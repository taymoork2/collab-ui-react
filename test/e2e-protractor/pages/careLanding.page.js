'use strict';

var CareLandingPage = function () {
  this.careCard = element(by.css('.care-bar'));
  this.careIcon = element(by.css('.icon-circle-contact-centre'));
  this.careTitle = element(by.cssContainingText('h4', 'Care'));
  this.careFeature = element(by.css('a[href*="#/careDetails/features"]'));
  this.careSetting = element(by.css('a[href*="#/careDetails/settings"]'));
  this.creatCTButton = element(by.css('.care-features .btn--people'));
};

module.exports = CareLandingPage;
