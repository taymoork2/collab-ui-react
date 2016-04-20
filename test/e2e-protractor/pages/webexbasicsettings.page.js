'use strict';

var BasicSettigsPage = function () {
  this.protoTab = element(by.css('li.webexUserSettingsTab > a'));
  this.userSettingsPanel = element(by.id('webexUserSettingsPage'));
  this.errorPanel = element(by.id('errSection'));
  this.userPrivilegesLink = element(by.id('webex-user-privs'));

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

  //this.saveButton = element(by.css('[ng-click="WebExUserSettings.btnSave(userSettingsView.form)"]'));
  this.saveButton = element(by.id('saveBtn'));

  //alertify-log-error
  this.alertSuccess = element(by.css('.toast-success'));
  this.alertError = element(by.css('.toast-error'));

  this.testAdmin = {
    username: 't30citestprov9@mailinator.com',
    password: 'Cisco!23',
  };

  this.testUser = {
    username: 'prov9usr@mailinator.com',
    password: 'Cisco!23',
  };

  this.testSiteUrl = 't30citestprov9.webex.com';
  this.testSiteElement = element(by.id(this.testSiteUrl));

  this.save = function () {
    utils.click(this.saveButton);
  };

  /**  
    this.selectAllMcSessionTypeByPrefix = function (prefix) {
      usersettings.mc.all(by.repeater('sessionType in WebExUserSettings.userSettingsModel.sessionTypes')).map(function (row) {
        var checkbox = row.element(by.css('cs-checkbox'));
        //        checkbox.getOuterHtml().then(function(html) {
        //        	console.log('--->'+html);
        //        });
        var input = checkbox.element(by.css('input'));

        checkbox.element(by.css('.ng-binding')).getText().then(function (text) {
          if (text.toUpperCase() === prefix.toUpperCase()) {
            input.isSelected().then(function (selected) {
              if (!selected) {
                checkbox.click();
              }
            });
          }
        });
      });
    };

    this.unSelectAllMcSessionTypeByPrefix = function (prefix) {
      usersettings.mc.all(by.repeater('sessionType in WebExUserSettings.userSettingsModel.sessionTypes')).map(function (row) {
        var checkbox = row.element(by.css('cs-checkbox'));
        var input = checkbox.element(by.css('input'));

        checkbox.element(by.css('.ng-binding')).getText().then(function (text) {
          if (text.toUpperCase() === prefix.toUpperCase()) {
            input.isSelected().then(function (selected) {
              if (selected) {
                checkbox.click();
              }
            });
          }
        });
      });
    };
  **/

  this.selectMcPro = function () {
    var mc = this.mcPro;
    this.mcProCheckbox.isSelected().then(function (selected) {
      if (!selected) {
        mc.click();
      }
    });
  };

  this.unSelectMcPro = function () {
    var mc = this.mcPro;
    this.mcProCheckbox.isSelected().then(function (selected) {
      if (selected) {
        mc.click();
      }
    });
  };

  this.isMcProSelected = function () {
    return this.mcProCheckbox.isSelected().then(function (selected) {
      if (!selected) {
        return false;
      } else {
        return true;
      }
    });
  };

  /**
    this.selectMcAuo = function () {
      var mc = this.mcAuo;
      this.mcAuoCheckbox.isSelected().then(function (selected) {
        if (!selected) {
          mc.click();
        }
      });
    };

    this.unSelectMcAuo = function () {
      var mc = this.mcAuo;
      this.mcAuoCheckbox.isSelected().then(function (selected) {
        if (selected) {
          mc.click();
        }
      });
    };

    this.isMcAuoSelected = function () {
      this.mcAuoCheckbox.isSelected().then(function (selected) {
        if (!selected) {
          return false;
        } else {
          return true;
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
 **/
};

module.exports = BasicSettigsPage;
