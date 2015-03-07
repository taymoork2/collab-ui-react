'use strict';

/* global describe, it, browser, expect, login, spaces, navigation, utils, notifications */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
};

describe('WebEx user settings', function () {

  it('should allow login as admin user', function () {
    login.login(testuser.username, testuser.password);
  });

  it('should should show the user settings page when clicking the prototype button', function () {
    usersettings.clickUserSettings();
    expect(usersettings.userSettingsPanel.isDisplayed()).toBeTruthy();
  });

  it('should contain correct centres', function () {
    expect(usersettings.mc.isPresent()).toBeTruthy();
    expect(usersettings.ec.isPresent()).toBeTruthy();
    //	  expect(usersettings.tc.isPresent()).toBeFalsy();
  });

  it('should allow to un select MC PRO check box', function () {
    expect(usersettings.mcProCheckbox.getAttribute('class')).toContain('checked');
    usersettings.unSelectMcPro();
    expect(usersettings.mcProCheckbox.getAttribute('class')).not.toContain('checked');
  });

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
