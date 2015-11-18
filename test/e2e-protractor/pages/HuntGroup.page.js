/**
 * Created by sjalipar on 11/4/15.
 */
'use strict';

var HuntGroup = function () {
  this.randomHGName = 'e2e-huntGroup-' + utils.randomId();
  //TODO: Decide about pilotNumber and memberSearch fields
  this.pilotNumber = '972';
  this.member1Search = 'Sun';
  this.member2Search = 'Sri';
  this.member3Search = 'Ravi';

  this.huntGroupBtn = element(by.css('.feature-icon-color-HG'));
  this.huntGroupCreateTitle = element(by.css('.overlay-heading .title-heading'));
  this.typeAheadInput = element(by.css('.typeahead-large input'));
  this.pilotTypeAheadInput = element(by.css('.pilot-number-details .typeahead-large input'));
  this.leftBtn = element(by.css('.left-btn'));
  this.rightBtn = element(by.css('.right-btn'));
  this.hint = element(by.css('.input-hint'));
  this.description = element(by.css('.input-description'));
  this.hgmethodsTitle = element(by.css('.hgmethods .title'));
  this.dropdownItem = element(by.css('.typeahead-large .dropdown-menu li:first-child'));
  this.memberDropdownItem = element(by.css('.typeahead-large .dropdown-menu li:first-child a:last-child'));
  this.memberDropdownItemName = element(by.css('.typeahead-large .dropdown-menu li:first-child .hunt-member-name strong'));
  this.huntMethod = element(by.css('.hgmethod:last-child a'));
  this.submitBtn = element(by.css('[cs-btn]'));

  //Hunt Group Edit Page
  this.editPageTitle = element(by.css('.title-heading'));
  this.editHgName = element(by.css('.hg-name .formly-input-wrapper input'));
  this.modifiedHGName = 'e2e-hg-new-' + utils.randomId();
  this.backBtn = element(by.css('.page-title a'));
  this.cancelBtn = element(by.css('[ng-click="hge.resetForm()"]'));
  this.cancelSaveBar = element(by.css('.hg-save .left'));
  this.saveBtn = element(by.css('[ng-click="hge.saveForm()"]'));
  this.hgNumbers = element(by.css('.hg-num .formly-input-wrapper .select-list[name="numbers"]'));
  this.hgNumber1 = element.all(by.css('.hg-num .formly-input-wrapper .select-list[name="numbers"] .select-options li')).get(0);
  this.hgNumber2 = element.all(by.css('.hg-num .formly-input-wrapper .select-list[name="numbers"] .select-options li')).get(1);
  this.numSearchFilter = element(by.css('.hg-num .formly-input-wrapper .select-list[name="numbers"] .select-filter'));
  this.searchedNumber1 = element.all(by.css('.hg-num .formly-input-wrapper .select-list[name="numbers"] .select-options li')).get(0);
  this.memberMaxRingTimeElmnt = element(by.css('.hg-time .formly-input-wrapper .select-list[name="maxRingSecs"]'));
  this.memberMaxRingTime = element.all(by.css('.hg-time .formly-input-wrapper .select-list[name="maxRingSecs"] .select-options li')).get(0);
  this.callerMaxWaitTimeElmnt = element(by.css('.hg-time .formly-input-wrapper .select-list[name="maxWaitMins"]'));
  this.callerMaxWaitTime = element.all(by.css('.hg-time .formly-input-wrapper .select-list[name="maxWaitMins"] .select-options li')).get(0);
  this.oldHuntMethod = element.all(by.css('.method-container li.current'));
  this.newHuntMethod = element.all(by.css('.method-container li')).first();
  this.memberSearch = element(by.css('.hgmembers input'));
  this.searchedMemeber = element.all(by.css('.hgmembers .select-member li a')).first();
  this.addedMember = element.all(by.css('.hgmembers .hgmember')).last();
  this.addedMemberName = element.all(by.css('.hgmembers .hgmember .cs-card h5')).last();
  this.removeAddedMember = element.all(by.css('.hgmembers .hgmember a')).last();
};

module.exports = HuntGroup;
