'use strict';

var CareLandingPage = function () {
  this.careLandingPgae = element(by.css('.care-features'));
  this.cccIcon = element(by.css('.care-features .no-features .icon-circle-contact-centre'));
  this.creatCTButton = element(by.css('.care-features .no-features .btn--people'));
};

module.exports = CareLandingPage;
