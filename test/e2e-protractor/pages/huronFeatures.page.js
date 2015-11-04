/**
 * Created by sjalipar on 11/2/15.
 */
'use strict';
var HuronFeaturesPage = function(){

  //this.newHuntGroupName = 'Hunt Group - ' + (Math.floor(Math.random() * 1000)).toString();
  //TODO 1. Remove the Hard coding of hunt group name when e2e for create hunt group gets ready
  //TODO: 2. use randomly created hunt group name
  this.huntGroupName = 'Self Driving Cars support';
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
  this.selectedHuntGroups = element.all(by.css('.cs-card.alerts .h5')).filter(function(elem, index){
    return elem.getText().then(function(text){
      return text === huronFeatures.huntGroupName;
    });
  });
};


module.exports = HuronFeaturesPage;
