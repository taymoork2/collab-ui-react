/**
 * Created by sjalipar on 11/4/15.
 */
'use strict';

describe('Create Hunt Group', function () {

  beforeAll(function () {
    login.login('huron-int1', '#/hurondetails/features');
  }, 120000);

  xit('should open features modal pop up', function () {
    utils.expectIsDisplayed(huronFeatures.newFeatureBtn);
    utils.click(huronFeatures.newFeatureBtn);
  });

  xit('should go to huntgroup create page', function() {
    utils.expectIsDisplayed(huntGroup.huntGroupBtn);
    utils.click(huntGroup.huntGroupBtn);
    utils.expectTextToBeSet(huntGroup.huntGroupCreateTitle, 'Create Hunt Group');
  });

  xit('should set the name of the hunt group', function() {
    expect(huntGroup.typeAheadInput.getAttribute('placeholder')).toContain('Name the Hunt Group');
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.randomHGName);
  });

  xit('should go to the next section', function() {
    utils.click(huntGroup.rightBtn);
    utils.expectTextToBeSet(huntGroup.description, 'When this number is called, this hunt group is activated');
    utils.sendKeys(huntGroup.pilotTypeAheadInput, huntGroup.pilotNumber);
    utils.expectTextToBeSet(huntGroup.dropdownItem, huntGroup.pilotNumber);
    utils.click(huntGroup.dropdownItem);
  });

  xit('should go to the hunting method section', function() {
    utils.click(huntGroup.rightBtn);
    utils.expectTextToBeSet(huntGroup.hgmethodsTitle, 'Select Hunting Method');
    utils.click(huntGroup.huntMethodLI);
  });

  xit('should go to the hunt members section', function() {
    utils.expectTextToBeSet(huntGroup.description, 'These are the users who pickup the hunt group calls');
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.memberSearch);
    utils.expectTextToBeSet(huntGroup.memberDropdownItemName, huntGroup.memberSearch);
    utils.click(huntGroup.memberDropdownItem);
  });

  xit('should go to the fallback destination section', function(){
    utils.click(huntGroup.rightBtn);
    utils.expectTextToBeSet(huntGroup.description, 'This is where the call goes if it was not answered by this hunt group');
  });

  xit('the form should be disabled', function() {
    navigation.hasClass(huntGroup.submitBtn, 'disabled');
  });

  xit('enable the button to submit', function() {
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.memberSearch);
    utils.expectTextToBeSet(huntGroup.memberDropdownItemName, huntGroup.memberSearch);
    utils.click(huntGroup.memberDropdownItem);
  });

  xit('the form should be enabled', function() {
    navigation.hasClass(huntGroup.submitBtn, 'success');
  });

});
