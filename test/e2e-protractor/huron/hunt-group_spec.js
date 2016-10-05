/**
 * Created by sjalipar on 11/4/15.
 */

'use strict';

xdescribe('Admin should be able to', function () {

  beforeAll(function () {
    //TODO: Move the provisioning logic to API calls instead of using UI
    //create 2 Huron users
    login.login('huron-e2e', '#/users');
    utils.deleteIfUserExists(huntGroup.member1);
    utils.deleteIfUserExists(huntGroup.member2);
    utils.createHuronUser(huntGroup.member1, huntGroup.member2);
    navigation.clickUsers();
    //Add an extra line to member1
    utils.searchAndClick(huntGroup.member1);
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
    utils.expectIsDisplayed(telephony.communicationPanel);
    utils.click(telephony.communicationActionButton);
    utils.click(telephony.newLineButton);
    utils.expectIsDisplayed(telephony.lineConfigurationPanel);
    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');
    //Add an extra line to member2
    navigation.clickUsers();
    utils.searchAndClick(huntGroup.member2);
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
    utils.expectIsDisplayed(telephony.communicationPanel);
    utils.click(telephony.communicationActionButton);
    utils.click(telephony.newLineButton);
    utils.expectIsDisplayed(telephony.lineConfigurationPanel);
    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');

    //Get an extension range
    navigation.clickCommunicationWizard();
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Call Settings');
    utils.click(servicesetup.addNumberRange);
    utils.sendKeys(servicesetup.newBeginRange, huntGroup.beginNumber);
    utils.sendKeys(servicesetup.newEndRange, huntGroup.endNumber);
    utils.click(huntGroup.hgwizardCloseBtn);

  }, 300000);

  afterAll(function () {
    navigation.clickUsers();
    navigation.clickCommunicationWizard();
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Call Settings');
    notifications.clearNotifications();
    servicesetup.deleteNumberRange(huntGroup.beginNumber);
    notifications.assertSuccess('Successfully deleted');
    utils.click(huntGroup.hgwizardCloseBtn);
    utils.deleteUser(huntGroup.member1, huntGroup.member2);
  }, 300000);

  it('open features modal pop up', function () {
    //Goto Communication page and click Features Tab
    utils.click(huntGroup.serviceTab);
    utils.click(huntGroup.communicationsPage);
    utils.expectIsDisplayed(huntGroup.settingTab);
    utils.expectIsPresent(huntGroup.featuresTab);
    utils.click(huntGroup.featuresTab);
    utils.expectIsDisplayed(huronFeatures.newFeatureBtn);
    utils.click(huronFeatures.newFeatureBtn);
  });

  it('go to huntgroup create page', function () {
    utils.expectIsDisplayed(huntGroup.huntGroupBtn);
    utils.click(huntGroup.huntGroupBtn);
    utils.expectTextToBeSet(huntGroup.huntGroupCreateTitle, 'Create Hunt Group');
  });

  it('set the name of the hunt group', function () {
    utils.expectTextToBeSet(huntGroup.hint, 'This hunt group name will also be the name callers see on their device (i.e. alerting name)');
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.randomHGName);
    utils.click(huntGroup.rightBtn);
  });

  it('select pilot numbers of hunt groups', function () {
    utils.expectTextToBeSet(huntGroup.description, 'When this number is called, this hunt group is activated');
    utils.sendKeys(huntGroup.pilotTypeAheadInput, huntGroup.pilotNumber);
    utils.expectTextToBeSet(huntGroup.dropdownItem, huntGroup.pilotNumber);
    utils.click(huntGroup.dropdownItem);
    utils.expectIsDisplayed(huntGroup.addedPilotNumber);
    utils.sendKeys(huntGroup.pilotTypeAheadInput, huntGroup.pilotNumber);
    utils.expectTextToBeSet(huntGroup.dropdownItem, huntGroup.pilotNumber);
    utils.click(huntGroup.dropdownItem);
    utils.expectIsDisplayed(huntGroup.addedPilotNumber);
  });

  it('select pilot numbers and delete a selected pilot number', function () {
    utils.sendKeys(huntGroup.pilotTypeAheadInput, huntGroup.pilotNumber);
    utils.expectTextToBeSet(huntGroup.dropdownItem, huntGroup.pilotNumber);
    utils.click(huntGroup.dropdownItem);
    utils.expectIsDisplayed(huntGroup.addedPilotNumber);
    utils.click(huntGroup.addedPilotNumberCloseBtn);
  });

  it('go to the hunting method section', function () {
    utils.click(huntGroup.rightBtn);
    utils.expectTextToBeSet(huntGroup.hgmethodsTitle, 'Select Hunting Method');
    utils.click(huntGroup.huntMethod);
    utils.click(huntGroup.huntMethod);
  });

  it('go to the hunt members section', function () {
    utils.expectTextToBeSet(huntGroup.description, 'These are the users who pickup the hunt group calls');
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.member1Search);
    utils.expectTextToBeSet(huntGroup.memberDropdownItemName, huntGroup.member1Search);
    utils.click(huntGroup.memberDropdownItem);
    utils.expectIsDisplayed(huntGroup.saAddedMember);
  });

  it('add and expand a memeber', function () {
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.member2Search);
    utils.expectTextToBeSet(huntGroup.memberDropdownItemName, huntGroup.member2Search);
    utils.click(huntGroup.memberDropdownItem);
    utils.expectIsDisplayed(huntGroup.saAddedMember);
    utils.click(huntGroup.saAddedMemberChevronBtn);
  });

  it('change the number assigned and remove the number', function () {
    utils.click(huntGroup.selectNumberForSAAddedMember);
    utils.click(huntGroup.removeSAAddedMember);
  });

  it('go to the fallback destination section', function () {
    utils.click(huntGroup.rightBtn);
    utils.expectTextToBeSet(huntGroup.description, 'This is where the call goes if it was not answered by this hunt group');
  });

  it('the form should be disabled', function () {
    navigation.hasClass(huntGroup.submitBtn, 'disabled');
  });

  it('see the voice mail option is not present on hunt group setUp assistant fallback page', function () {
    utils.expectIsNotDisplayed(huntGroup.saVociemailOption);
  });

  it('enable the create hunt group button', function () {
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.member2Search);
    utils.expectTextToBeSet(huntGroup.memberDropdownItemName, huntGroup.member2Search);
    utils.click(huntGroup.memberDropdownItem);
  });

  it('see the voice mail option is present on hunt group setUp assistant fallback page when a member is selecetd', function () {
    utils.expectIsDisplayed(huntGroup.saVociemailOption);
  });

  it('click on the voicemail option', function () {
    utils.click(huntGroup.saVociemailOption);
  });

  it('see the disabled typeahead', function () {
    utils.expectIsDisabled(huntGroup.disabledTypeahead);
  });

  it('click on the selected fallback member and remove', function () {
    utils.expectIsDisplayed(huntGroup.fallbackMember);
    utils.click(huntGroup.fallbackMember);
    utils.click(huntGroup.numberForFallbackMember);
    utils.click(huntGroup.removeFallbackMember);
  });

  it('see the enabled typeahead when a selected member is removed', function () {
    utils.expectIsEnabled(huntGroup.enabledTypeahead);
    //navigation.hasClass(huntGroup.submitBtn, 'disabled');
  });

  it('see the voice mail option is not present when a selected member is removed', function () {
    utils.expectIsNotDisplayed(huntGroup.saVociemailOption);
  });

  it('add a fallback member again', function () {
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.member2Search);
    utils.expectTextToBeSet(huntGroup.memberDropdownItemName, huntGroup.member2Search);
    utils.click(huntGroup.memberDropdownItem);
  });

  it('see the voice mail option is present on when a member is added back', function () {
    utils.expectIsDisplayed(huntGroup.saVociemailOption);
  });

  it('click on the voicemail option when a member is added back', function () {
    utils.click(huntGroup.saVociemailOption);
  });

  it('should be to click on the create hunt group btn', function () {
    navigation.hasClass(huntGroup.submitBtn, 'success');
    utils.click(huntGroup.submitBtn);
  });

  it('should be able to see success notification of hunt group creation', function () {
    notifications.assertSuccess('\'' + huntGroup.randomHGName + '\' hunt group has been created successfully');
  });

  it('see the searched hunt group', function () {
    utils.click(huronFeatures.allFilter);
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, huntGroup.randomHGName);
    utils.expectIsDisplayed(huronFeatures.huntGroups);
    utils.expectTextToBeSet(huronFeatures.selectedHuntGroup, huntGroup.randomHGName);
  });

  it('see the edit button when clicked on menu button of a selected hunt group', function () {
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupEditBtn);
    utils.expectIsEnabled(huronFeatures.huntGroupEditBtn);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.expectIsEnabled(huronFeatures.huntGroupDeleteBtn);
  });

  it('click on the edit btn on the hunt group card', function () {
    utils.click(huronFeatures.huntGroupEditBtn);
    utils.expectText(huntGroup.editPageTitle, huntGroup.randomHGName);
  });

  it('change the hunt group name on hunt group edit page', function () {
    utils.expectIsDisplayed(huntGroup.editHgName);
    utils.expectValueToBeSet(huntGroup.editHgName, huntGroup.randomHGName);
    utils.clear(huntGroup.editHgName);
    utils.sendKeys(huntGroup.editHgName, huntGroup.modifiedHGName);
    utils.expectValueToBeSet(huntGroup.editHgName, huntGroup.modifiedHGName);
    utils.clear(huntGroup.editHgName);
    utils.sendKeys(huntGroup.editHgName, huntGroup.randomHGName);
    utils.expectValueToBeSet(huntGroup.editHgName, huntGroup.randomHGName);
  });

  it('click on the cancel btn of cancel/save bar on edit page', function () {
    utils.clear(huntGroup.editHgName);
    utils.sendKeys(huntGroup.editHgName, huntGroup.modifiedHGName);
    utils.expectIsDisplayed(huntGroup.cancelBtn);
    utils.click(huntGroup.cancelBtn);
  });

  it('remove all the selected hunt group numbers', function () {
    utils.expectIsDisplayed(huntGroup.hgNumbers);
    utils.click(huntGroup.hgNumbers);
    utils.clickAll(huntGroup.selectedHgNumbers);
  });

  it('see the disabled save btn', function () {
    utils.expectIsDisplayed(huntGroup.cancelSaveBar);
    utils.expectIsDisabled(huntGroup.saveBtn);
  });

  it('add hunt group numbers by using the number search functionality', function () {
    utils.expectIsDisplayed(huntGroup.numSearchFilter);
    utils.clear(huntGroup.numSearchFilter);
    utils.sendKeys(huntGroup.numSearchFilter, huntGroup.pilotNumber);
    utils.expectIsDisplayed(huntGroup.searchedNumber1);
    utils.click(huntGroup.searchedNumber1);
    utils.click(huntGroup.hgNumbers);
  });

  it('configure the hunt members max ring time', function () {
    utils.expectIsDisplayed(huntGroup.memberMaxRingTimeElmnt);
    utils.click(huntGroup.memberMaxRingTimeElmnt);
    utils.expectIsDisplayed(huntGroup.memberMaxRingTime);
    utils.click(huntGroup.memberMaxRingTime);
  });

  it('configure the caller max wait time', function () {
    utils.expectIsDisplayed(huntGroup.callerMaxWaitTimeElmnt);
    utils.click(huntGroup.callerMaxWaitTimeElmnt);
    utils.expectIsDisplayed(huntGroup.callerMaxWaitTime);
    utils.click(huntGroup.callerMaxWaitTime);
  });

  it('see the fallback member selected', function () {
    utils.expectIsDisplayed(huntGroup.fallbackDest);
  });

  it('see the voicemail option', function () {
    utils.click(huntGroup.fallbackVoiceMail);
  });

  it('click on the fallback member card and change the number', function () {
    utils.click(huntGroup.fallbackDest);
    utils.click(huntGroup.changeFallbackNumber);
  });

  it('to remove the fallback member', function () {
    utils.click(huntGroup.removeFallbackMemberonEditPage);
  });

  it('see the  warning typeahead and disabled save btn', function () {
    utils.expectIsDisplayed(huntGroup.fallbackLookupWarningTypeahed);
    utils.expectIsDisplayed(huntGroup.fallbackWarningText);
    utils.expectIsDisplayed(huntGroup.cancelSaveBar);
    utils.expectIsDisabled(huntGroup.saveBtn);
  });

  it('see the voicemail option is not present', function () {
    utils.expectIsNotDisplayed(huntGroup.fallbackVoiceMail);
  });

  it('add a fallback member using the typeahead', function () {
    utils.sendKeys(huntGroup.searchFallbackMember, huntGroup.member2Search);
    utils.click(huntGroup.addFallbackMember);
  });

  it('see the voicemail option present and be able to click', function () {
    utils.click(huntGroup.fallbackVoiceMail);
  });

  it('see the enabled save btn', function () {
    utils.expectIsDisplayed(huntGroup.cancelSaveBar);
    utils.expectIsEnabled(huntGroup.saveBtn);
  });

  it('change the hunt method', function () {
    utils.expectIsDisplayed(huntGroup.oldHuntMethod);
    utils.expectIsDisplayed(huntGroup.newHuntMethod);
    utils.click(huntGroup.newHuntMethod);
  });

  it('see the cancel/save bar when any changes are there on edit page', function () {
    utils.expectIsDisplayed(huntGroup.cancelSaveBar);
    utils.expectTextToBeSet(huntGroup.cancelSaveBar, 'Do you want to save your changes?');
  });

  it('search a member', function () {
    utils.expectIsDisplayed(huntGroup.memberSearch);
    utils.clear(huntGroup.memberSearch);
    utils.sendKeys(huntGroup.memberSearch, huntGroup.member2Search);
  });

  it('add a searched member to the hunt group', function () {
    utils.expectIsDisplayed(huntGroup.searchedMemeber);
    utils.click(huntGroup.searchedMemeber);
  });

  it('change the number of added hunt member', function () {
    utils.expectIsDisplayed(huntGroup.addedMember);
    utils.click(huntGroup.addedMember);
    utils.click(huntGroup.alternateNumforMem);
    utils.expectIsDisplayed(huntGroup.cancelSaveBar);
    utils.expectIsEnabled(huntGroup.saveBtn);
  });

  it('remove added member from the hunt group', function () {
    utils.expectIsDisplayed(huntGroup.addedMember);
    utils.expectText(huntGroup.addedMemberName, huntGroup.member2Search);
    utils.expectIsDisplayed(huntGroup.removeAddedMember);
    utils.click(huntGroup.removeAddedMember);
    utils.expectNotText(huntGroup.addedMemberName, huntGroup.member2Search);
  });

  it('click on the save btn of cancel/save bar and changes to be reflected on edit page', function () {
    utils.expectIsDisplayed(huntGroup.cancelSaveBar);
    utils.click(huntGroup.saveBtn);
    notifications.assertSuccess('\'' + huntGroup.randomHGName + '\' hunt group has been updated successfully');

  });

  it('click on the back button of hunt group edit page', function () {
    utils.expectIsDisplayed(huntGroup.backBtn);
    utils.click(huntGroup.backBtn);
  });

  it('see the searched hunt group after editing', function () {
    utils.click(huronFeatures.allFilter);
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, huntGroup.randomHGName);
    utils.expectIsDisplayed(huronFeatures.huntGroups);
    utils.expectTextToBeSet(huronFeatures.selectedHuntGroup, huntGroup.randomHGName);
  });

  it('see the delete button when clicked on menu button of a selected hunt group', function () {
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupEditBtn);
    utils.expectIsEnabled(huronFeatures.huntGroupEditBtn);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.expectIsEnabled(huronFeatures.huntGroupDeleteBtn);
  });

  it('see the delete pop up when clicked on delete button of a selected hunt group', function () {
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.huntGroupDeleteBtn);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeletePopUp);
  });

  it('click on close button of delete hunt group pop up', function () {
    utils.expectIsDisplayed(huronFeatures.closeBtnOnModal);
    utils.click(huronFeatures.closeBtnOnModal);
  });

  it('click on cancel button of delete hunt group pop up', function () {
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.popUpCancelBtn);
  });

  it('click on delete button of delete hunt group pop up', function () {
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.huntGroupDeleteBtn);
    utils.expectIsDisplayed(huronFeatures.popUpDelteBtn);
    utils.click(huronFeatures.popUpDelteBtn);
    notifications.assertSuccess(huntGroup.randomHGName + ' hunt group has been deleted successfully');
  });

  it('verify the deleted hunt group is not shown on features list page', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, huntGroup.randomHGName);
    utils.expectIsNotDisplayed(huronFeatures.huntGroups);
  });

});
