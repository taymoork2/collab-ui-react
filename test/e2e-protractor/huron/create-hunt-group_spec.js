/**
 * Created by sjalipar on 11/4/15.
 */
'use strict';

xdescribe('Create Hunt Group', function () {

  beforeAll(function () {
    login.login('huron-int1', '#/hurondetails/features');
  }, 120000);

  it('should open features modal pop up', function () {
    utils.expectIsDisplayed(huronFeatures.newFeatureBtn);
    utils.click(huronFeatures.newFeatureBtn);
  });

  it('should go to huntgroup create page', function () {
    utils.expectIsDisplayed(huntGroup.huntGroupBtn);
    utils.click(huntGroup.huntGroupBtn);
    utils.expectTextToBeSet(huntGroup.huntGroupCreateTitle, 'Create Hunt Group');
  });

  it('should set the name of the hunt group', function () {
    expect(huntGroup.typeAheadInput.getAttribute('placeholder')).toContain('Name the Hunt Group');
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.randomHGName);
  });

  it('should go to the next section', function () {
    utils.click(huntGroup.rightBtn);
    utils.expectTextToBeSet(huntGroup.description, 'When this number is called, this hunt group is activated');
    utils.sendKeys(huntGroup.pilotTypeAheadInput, huntGroup.pilotNumber);
    utils.expectTextToBeSet(huntGroup.dropdownItem, huntGroup.pilotNumber);
    utils.click(huntGroup.dropdownItem);
  });

  it('should go to the hunting method section', function () {
    utils.click(huntGroup.rightBtn);
    utils.expectTextToBeSet(huntGroup.hgmethodsTitle, 'Select Hunting Method');
    utils.click(huntGroup.huntMethodLI);
  });

  it('should go to the hunt members section', function () {
    utils.expectTextToBeSet(huntGroup.description, 'These are the users who pickup the hunt group calls');
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.memberSearch);
    utils.expectTextToBeSet(huntGroup.memberDropdownItemName, huntGroup.memberSearch);
    utils.click(huntGroup.memberDropdownItem);
  });

  it('should go to the fallback destination section', function () {
    utils.click(huntGroup.rightBtn);
    utils.expectTextToBeSet(huntGroup.description, 'This is where the call goes if it was not answered by this hunt group');
  });

  it('the form should be disabled', function () {
    navigation.hasClass(huntGroup.submitBtn, 'disabled');
  });

  it('enable the button to submit', function () {
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.memberSearch);
    utils.expectTextToBeSet(huntGroup.memberDropdownItemName, huntGroup.memberSearch);
    utils.click(huntGroup.memberDropdownItem);
  });

  it('the form should be enabled', function () {
    navigation.hasClass(huntGroup.submitBtn, 'success');
  });

});
