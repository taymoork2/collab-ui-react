'use strict';

var WebExUserSettingsPage = function () {
  this.protoTab = element(by.css('li.webexUserSettingsTab > a'));
  this.userSettingsPanel = element(by.id('webexUserSettingsPage'));
  this.errorPanel = element(by.id('errSection'));
  this.userPrivilegesLink = element(by.id('webex-user-privs'));

  this.alertSuccess = element(by.css('.toast-success'));
  this.alertError = element(by.css('.toast-error'));

  this.mc = element(by.id('MC'));
  this.ec = element(by.id('EC'));
  this.tc = element(by.id('TC'));

  this.mcPro = this.mc.element(by.css('[ckid="sessionType-214"]'));
  this.mcProCheckbox = this.mcPro.element(by.css('input'));

  this.mcAuo = this.mc.element(by.css('[ckid="sessionType-16"]'));
  this.mcAuoCheckbox = this.mcAuo.element(by.css('input'));

  this.userPrivilegesPanel = element(by.id('webexUserSettingsPage2'));
  this.telephonyPrivileges = element(by.id('telephonyPrivileges'));

  this.recordingEditor = element(by.model('WebExUserSettings.userPrivileges.general.recordingEditor.value'));
  this.recordingEditorCheckbox = this.recordingEditor.element(by.className('checkboxValue'));
  this.assist = element(by.model('WebExUserSettings.userPrivileges.general.assist.value'));
  this.assistCheckbox = this.assist.element(by.className('checkboxValue'));
  this.hiQualVideo = element(by.model('WebExUserSettings.userPrivileges.general.hiQualVideo.value'));
  this.hiQualVideoCheckbox = this.hiQualVideo.element(by.className('checkboxValue'));
  this.hiDefVideo = element(by.model('WebExUserSettings.userPrivileges.general.hiDefVideo.value'));
  this.hiDefVideoCheckbox = this.hiDefVideo.element(by.className('checkboxValue'));
  this.personalRoom = element(by.model('WebExUserSettings.userPrivileges.general.personalRoom.value'));
  this.personalRoomCheckbox = this.personalRoom.element(by.className('checkboxValue'));
  this.collabRoom = element(by.model('WebExUserSettings.userPrivileges.general.collabRoom.value'));
  this.collabRoomCheckbox = this.collabRoom.element(by.className('checkboxValue'));

  this.callInTeleconf = element(by.model('WebExUserSettings.userPrivileges.general.callInTeleconf.value'));
  this.callInTeleconfCheckbox = this.callInTeleconf.element(by.className('checkboxValue'));

  this.t30TestUser = {
    username: 'provteam+ee@csgtrials.webex.com',
    password: 'Cisco!23',
  };

  this.t31TestUser = {
    username: 'provteam+t31ee@csgtrials.webex.com',
    password: 'Cisco!23',
  };

  this.scrollToBottom = function () {
    browser.executeScript('window.scrollTo(0,1000);');
  };
};

module.exports = WebExUserSettingsPage;
