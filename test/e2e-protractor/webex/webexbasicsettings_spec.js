'use strict';

/* global describe, it, expect, login */

describe('WebEx user settings', function () {

  it('should allow login as admin user', function () {
    login.loginThroughGui(usersettings.testAdmin.username, usersettings.testAdmin.password);
  });

  it('click on users tab', function () {
    navigation.clickUsers();
  });

  it('should allow search and click on user', function () {
    utils.search(usersettings.testUser.username);
    users.clickOnUser();
  });

  it('should allow click on conferencing arrow', function () {
    expect(users.conferencingService.isPresent()).toBeTruthy();
    utils.click(users.conferencingService);
  });

  it('should allow click on site name', function () {
    expect(usersettings.testSiteElement.isPresent()).toBeTruthy();
    utils.click(usersettings.testSiteElement);
  });

  it('should display basic WebEx settigns page', function () {
    expect(usersettings.userSettingsPanel.isPresent()).toBeTruthy();
    expect(usersettings.userSettingsPanel.isDisplayed()).toBeTruthy();
  });

  it('should not display WebEx error page', function () {
    expect(usersettings.errorPanel.isPresent()).toBeFalsy();
  });

  it('should allow navigation to the 4th panel', function () {
    utils.click(usersettings.userPrivilegesLink);
    expect(usersettings.userPrivilegesPanel.isPresent()).toBeTruthy();
    expect(usersettings.userPrivilegesPanel.isDisplayed()).toBeTruthy();
  });

  it('should allow navigation back to the 3rd panel', function () {
    utils.clickLastBreadcrumb();
    expect(usersettings.userSettingsPanel.isPresent()).toBeTruthy();
    expect(usersettings.userSettingsPanel.isDisplayed()).toBeTruthy();
  });

  it('should allow show save button disabled without any changes', function () {
    expect(usersettings.saveButton.isEnabled()).toBeFalsy();
  });

  /** 
  it('should allow enable save button after a change', function () {
    if (usersettings.mc.isPresent()) { // MC is enabled 
      console.log('count=' + element.all(by.repeater('sessionType in WebExUserSettings.userSettingsModel.sessionTypes')).count());
      element.all(by.repeater('sessionType in WebExUserSettings.userSettingsModel.sessionTypes')).then(function (rows) {
        for (var i = 0; i < rows.length; ++i) {
          var checkbox = i.element(by.css('cs-checkbox'));
          if (checkbox.isDisplayed()) {
            checkbox.click();
            expect(usersettings.saveButton.isEnabled()).toBeTruthy();
            break;
          }
        }
      });
    }
  });

  it('should pause', function () {
    browser.pause();
  });
**/
  /**  it('should contain correct centres', function () {
      expect(usersettings.mc.isPresent()).toBeTruthy();
      expect(usersettings.ec.isPresent()).toBeTruthy();
      //	  expect(usersettings.tc.isPresent()).toBeFalsy();
    });

    it('should allow to un select MC PRO check box', function () {
      expect(usersettings.mcProCheckbox.getAttribute('class')).toContain('checked');
      usersettings.unSelectMcPro();
      expect(usersettings.mcProCheckbox.getAttribute('class')).not.toContain('checked');
    });
  **/

  /**
    it ('shout allow to save', function () {
  	  usersettings.save();
    });

    it('should contain correct General settings', function () {
        expect(usersettings.recordingEditor.isDisplayed()).toBeTruthy();
        expect(usersettings.assist.isDisplayed()).toBeTruthy();
        expect(usersettings.hiQualVideo.isDisplayed()).toBeTruthy();
        expect(usersettings.hiDefVideo.isDisplayed()).toBeTruthy();
        expect(usersettings.personalRoom.isDisplayed()).toBeTruthy();
        expect(usersettings.collabRoom.isDisplayed()).toBeTruthy();
    });

    it('should allow to click Recording Editor check box', function () {
  	  expect(usersettings.recordingEditorCheckbox.getAttribute('class')).toContain('checked');
  	  usersettings.clickRecordingEditor();
  	  expect(usersettings.recordingEditorCheckbox.getAttribute('class')).not.toContain('checked');
    });

    it('should allow to select Recording Editor check box', function () {
  	  usersettings.selectRecordingEditor();
  	  expect(usersettings.recordingEditorCheckbox.getAttribute('class')).toContain('checked');
    });

    it('should allow to un select Recording Editor check box', function () {
  	  usersettings.unSelectRecordingEditor();
  	  expect(usersettings.recordingEditorCheckbox.getAttribute('class')).not.toContain('checked');
  	  usersettings.unSelectRecordingEditor();
  	  expect(usersettings.recordingEditorCheckbox.getAttribute('class')).not.toContain('checked');
    });

    it('should allow to un select other check boxes', function () {
  	  usersettings.unSelectAssist();
  	  expect(usersettings.assistCheckbox.getAttribute('class')).not.toContain('checked');
  	  usersettings.unSelectHiQualVideo();
  	  expect(usersettings.hiQualVideoCheckbox.getAttribute('class')).not.toContain('checked');
  	  usersettings.unSelectHiDefVideo();
  	  expect(usersettings.hiDefVideoCheckbox.getAttribute('class')).not.toContain('checked');
  	  usersettings.unSelectPersonalRoom();
  	  expect(usersettings.personalRoomCheckbox.getAttribute('class')).not.toContain('checked');
  	  usersettings.unSelectCollabRoom();
  	  expect(usersettings.collabRoomCheckbox.getAttribute('class')).not.toContain('checked');
  	  browser.sleep(3000);
    });
  **/

  it('should allow log out', function () {
    navigation.logout();
  });
});
