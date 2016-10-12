/**
 * Created by snzheng on 16/9/27.
 */
'use strict';

var incidentPage = function () {
   this.newIncident = element(by.css('.btn--primary'));
   this.createIncident = element(by.id('createIncidentPage'));
   this.incidentList = element(by.css('.incidentItem'));
   this.newIncidentName = element(by.css('.incidentName input'));
   this.updateIt = element(by.css('.operationHref div a'));
   this.updateIncident = element(by.id('incidentInfo'));
   this.createIncidentBtn = element(by.css('#createIncidentPage .btn--primary'));
 //  this.incidentListPage = element(by.css('.incidentListPage'));
  this.edit = element(by.css('.editButton'));
  this.editIncidentName = element(by.css('.editIncidentName'));
  this.cancleEditName = element(by.css('.cancleModifyIncident'));
  //this.saveIncidentName = element(by.css('.editIncidentName input'));
  this.addMsg = element(by.css('.addMsg'));
  this.updateStatus = element(by.css('.componentStatuses p a'));
  this.showComponent = element(by.css('.componentStatuses div'));
  this.updateIncidentBtn = element(by.css('.addMsg input'));
  this.msgStatusEdit = element(by.css('.msgStatus'));
  this.editMsg = element(by.css('.msgList div')).element(by.css('.editMsg'));
  this.cancleEditMsg = element(by.css('.msgList div')).element(by.css('.editMsg a'));
  this.previousUpdate = element(by.css('.msgList'));
  this.showorhideComponent = element(by.css('.msgList div .msgInfo .itemRow2 a'));
  this.affectedCompList = element(by.css('.itemRow3'));

  this.DELETEInput = element(by.css('.deleteIncidentPage input'));
  this.deleteBtn = element(by.css('.btn--primary'));
};

module.exports = incidentPage;
