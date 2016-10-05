/**
 * Created by sjalipar on 11/2/15.
 */

'use strict';

var HuronFeaturesPage = function () {

  this.featuresList = element.all(by.css('.cs-card'));
  this.huntGroups = element.all(by.css('.cs-card.alerts'));
  this.autoAttendants = element.all(by.css('.cs-card.primary'));
  this.newFeatureBtn = element(by.css('.new-feature-button'));
  this.newfeatureModal = element(by.css('.huron-new-feature-modal'));
  this.closeBtnOnModal = element(by.css('button.close'));
  this.huntGroupMenu = element.all(by.css('.cs-card.alerts button.dropdown-toggle')).first();
  this.huntGroupEditBtn = element.all(by.css('.cs-card.alerts .dropdown-menu a')).get(0);
  this.huntGroupDeleteBtn = element.all(by.css('.cs-card.alerts .dropdown-menu a')).get(1);
  this.popUpCancelBtn = element(by.css('.modal-footer button.btn-default'));
  this.popUpDelteBtn = element(by.css('.modal-footer button.btn-danger'));
  this.allFilter = element.all(by.repeater('filter in filters')).get(0);
  this.autoAttendantFilter = element.all(by.repeater('filter in filters')).get(1);
  this.huntGroupFilter = element.all(by.repeater('filter in filters')).get(2);
  this.huntGroupDeletePopUp = element.all(by.css('.modal-body'));
  this.selectedHuntGroup = element(by.css('.cs-card.alerts .h5'));
};

module.exports = HuronFeaturesPage;
