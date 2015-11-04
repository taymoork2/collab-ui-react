/**
 * Created by sjalipar on 11/2/15.
 */
'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */

describe('As an admin i should be able to', function () {

  afterEach(function () {
    utils.dumpConsoleErrors();
  });


  xit('login as an account admin and goto Huron Features Page', function () {
    login.login('huron-int1', '#/hurondetails/features');
  });

  xit('see Create New Feature pop up when clicked on New button', function(){
    utils.expectIsDisplayed(huronFeatures.featuresList);
    utils.click(huronFeatures.newFeatureBtn);
    utils.expectIsPresent(huronFeatures.newfeatureModal);
    utils.expectIsPresent(huronFeatures.closeBtnOnModal);
  });

  xit('close the create new feature pop up and stay on huron features page', function(){
    utils.expectIsPresent(huronFeatures.closeBtnOnModal);
    utils.click(huronFeatures.closeBtnOnModal);
    utils.expectIsDisplayed(huronFeatures.featuresList);
  });

  xit('see only auto attendants when auto attendant filter is selected', function(){
    utils.click(huronFeatures.autoAttendantFilter);
    utils.expectIsDisplayed(huronFeatures.autoAttendants);
    utils.expectIsNotDisplayed(huronFeatures.huntGroups);
  });

  xit('see only hunt groups when Hunt Group filter is selected', function(){
    utils.click(huronFeatures.huntGroupFilter);
    utils.expectIsDisplayed(huronFeatures.huntGroups);
    expect(huronFeatures.autoAttendants.count()).toBe(0);
  });

  xit('see the searched hunt group', function(){
    utils.click(huronFeatures.allFilter);
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, huronFeatures.huntGroupName);
    utils.expectIsDisplayed(huronFeatures.huntGroups);
    utils.expectCountToBeGreater(huronFeatures.selectedHuntGroups , 0);
  });

  xit('see the edit and delete button when clicked on menu button of a selected hunt group', function(){
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupEditBtn);
    utils.expectIsEnabled(huronFeatures.huntGroupEditBtn);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.expectIsEnabled(huronFeatures.huntGroupDeleteBtn);
  });

  it('see the delete pop up when clicked on delete button of a selected hunt group', function(){
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.closeBtnOnModal);
  });

  xit('click on close button of delete hunt group pop up', function(){
    utils.expectIsDisplayed(huronFeatures.closeBtnOnModal);
    utils.click(huronFeatures.closeBtnOnModal);
  });

  xit('click on cancel button of delete hunt group pop up', function(){
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.popUpCancelBtn);
  });

  xit('click on delete button of delete hunt group pop up', function(){
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.huntGroupDeleteBtn);
    utils.expectIsDisplayed(huronFeatures.popUpDelteBtn);
    utils.click(huronFeatures.popUpDelteBtn);
    notifications.assertSuccess(huronFeatures.huntGroupName + ' hunt group has been deleted successfully');
  });

  xit('verify the deleted hunt group is not shown on features list page', function(){
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, huronFeatures.huntGroupName);
    expect(huronFeatures.huntGroups.count()).toBe(0);
  })
});
