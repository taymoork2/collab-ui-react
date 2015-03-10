'use strict';

var BasicSettigsPage = function () {
  this.protoTab = element(by.css('li.webexUserSettingsTab > a'));
  this.userSettingsPanel = element(by.id('webexUserSettingsPage'));

  this.mc = element(by.id('MC'));
  this.ec = element(by.id('EC'));
  this.tc = element(by.id('TC'));

  this.mcPro = this.mc.element(by.id('MeetingCenter-3'));
  this.mcProCheckbox = this.mcPro.element(by.className('checkboxValue'));

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

  this.saveButton = element(by.id('btnUpdate'));

  this.save = function () {
    utils.click(this.saveButton);
  };

  this.clickUserSettings = function () {
    utils.click(this.protoTab);
    navigation.expectCurrentUrl('/webexUserSettings');
  };

  this.selectMcPro = function () {
    var mc = this.mcPro;
    this.mcProCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') == -1) {
        mc.click();
      }
    });
  };

  this.unSelectMcPro = function () {
    var mc = this.mcPro;
    this.mcProCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') !== -1) {
        mc.click();
      }
    });
  };

  this.clickRecordingEditor = function () {
    utils.click(this.recordingEditor);
  };

  this.selectRecordingEditor = function () {
    var re = this.recordingEditor;
    this.recordingEditorCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') == -1) {
        re.click();
      }
    });
  };

  this.unSelectRecordingEditor = function () {
    var re = this.recordingEditor;
    this.recordingEditorCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') !== -1) {
        re.click();
      }
    });
  };

  this.selectAssist = function () {
    var a = this.assist;
    this.assistCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') == -1) {
        a.click();
      }
    });
  };

  this.unSelectAssist = function () {
    var a = this.assist;
    this.assistCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') !== -1) {
        a.click();
      }
    });
  };

  this.selectHiQualVideo = function () {
    var a = this.hiQualVideo;
    this.hiQualVideoCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') == -1) {
        a.click();
      }
    });
  };

  this.unSelectHiQualVideo = function () {
    var a = this.hiQualVideo;
    this.hiQualVideoCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') !== -1) {
        a.click();
      }
    });
  };

  this.selectHiDefVideo = function () {
    var a = this.hiDefVideo;
    this.hiDefVideoCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') == -1) {
        a.click();
      }
    });
  };

  this.unSelectHiDefVideo = function () {
    var a = this.hiDefVideo;
    this.hiDefVideoCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') !== -1) {
        a.click();
      }
    });
  };

  this.selectPersonalRoom = function () {
    var a = this.personalRoom;
    this.personalRoomCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') == -1) {
        a.click();
      }
    });
  };

  this.unSelectPersonalRoom = function () {
    var a = this.personalRoom;
    this.personalRoomCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') !== -1) {
        a.click();
      }
    });
  };

  this.selectCollabRoom = function () {
    var a = this.collabRoom;
    this.collabRoomCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') == -1) {
        a.click();
      }
    });
  };

  this.unSelectCollabRoom = function () {
    var a = this.collabRoom;
    this.collabRoomCheckbox.getAttribute('class').then(function (classes) {
      if (classes.split(' ').indexOf('checked') !== -1) {
        a.click();
      }
    });
  };
};

module.exports = BasicSettigsPage;
