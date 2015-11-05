/**
 * Created by sjalipar on 11/4/15.
 */
'use strict';

var CreateHuntGroup = function () {
  this.randomHGName = 'huntGroup-' + utils.randomId();
  //TODO: Decide about pilotNumber and memberSearch fileds
  this.pilotNumber = '972';
  this.memberSearch = 'Sun';

  this.huntGroupBtn = element(by.css('.feature-icon-color-HG'));
  this.huntGroupCreateTitle = element(by.css('.overlay-heading .title-heading'));
  this.typeAheadInput = element(by.css('.typeahead-large input'));
  this.pilotTypeAheadInput = element(by.css('.pilot-number-details .typeahead-large input'));
  this.leftBtn = element(by.css('.left-btn'));
  this.rightBtn = element(by.css('.right-btn'));
  this.description = element(by.css('.input-description'));
  this.hgmethodsTitle = element(by.css('.hgmethods .title'));
  this.dropdownItem = element(by.css('.typeahead-large .dropdown-menu li:first-child'));
  this.memberDropdownItem = element(by.css('.typeahead-large .dropdown-menu li:first-child a:last-child'));
  this.memberDropdownItemName = element(by.css('.typeahead-large .dropdown-menu li:first-child .hunt-member-name strong'));
  this.huntMethodLI = element(by.css('.hgmethod:first-child a'));
  this.submitBtn = element(by.css('[cs-btn]'));
};

module.exports = CreateHuntGroup;
