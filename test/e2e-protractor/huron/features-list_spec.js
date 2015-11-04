/**
 * Created by sjalipar on 11/2/15.
 */
'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */

xdescribe('As an admin i should be able to', function () {

  afterEach(function () {
    utils.dumpConsoleErrors();
  });


  it('login as an account admin and goto Huron Features Page', function () {
    login.login('huron-int1', '#/hurondetails/features');
  });

  it('see Create New Feature pop up when clicked on New button', function(){
    utils.expectIsDisplayed(huronFeatures.featuresList);
    utils.click(huronFeatures.newFeatureBtn);
    utils.expectIsPresent(huronFeatures.newfeatureModal);
    utils.expectIsPresent(huronFeatures.closeBtnOnModal);
  });

  it('close the create new feature pop up and stay on huron features page', function(){
    utils.expectIsPresent(huronFeatures.closeBtnOnModal);
    utils.click(huronFeatures.closeBtnOnModal);
    utils.expectIsDisplayed(huronFeatures.featuresList);
  });

  it('see only auto attendants when auto attendant filter is selected', function(){
    utils.click(huronFeatures.autoAttendantFilter);
    utils.expectIsDisplayed(huronFeatures.autoAttendants);
    utils.expectIsNotDisplayed(huronFeatures.huntGroups);
  });

  it('see only hunt groups when Hunt Group filter is selected', function(){
    utils.click(huronFeatures.huntGroupFilter);
    utils.expectIsDisplayed(huronFeatures.huntGroups);
    expect(huronFeatures.autoAttendants.count()).toBe(0);
  });

  it('see the searched hunt group', function(){
    utils.click(huronFeatures.allFilter);
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, huntGroup.randomHGName);
    utils.expectIsDisplayed(huronFeatures.huntGroups);
    utils.expectCountToBeGreater(huronFeatures.selectedHuntGroups , 0);
  });

  it('see the edit and delete button when clicked on menu button of a selected hunt group', function(){
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

  it('click on close button of delete hunt group pop up', function(){
    utils.expectIsDisplayed(huronFeatures.closeBtnOnModal);
    utils.click(huronFeatures.closeBtnOnModal);
  });

  it('click on cancel button of delete hunt group pop up', function(){
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.popUpCancelBtn);
  });

  it('click on delete button of delete hunt group pop up', function(){
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.huntGroupDeleteBtn);
    utils.expectIsDisplayed(huronFeatures.popUpDelteBtn);
    utils.click(huronFeatures.popUpDelteBtn);
    notifications.assertSuccess(huntGroup.randomHGName + ' hunt group has been deleted successfully');
  });

  it('verify the deleted hunt group is not shown on features list page', function(){
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, huntGroup.randomHGName);
    expect(huronFeatures.huntGroups.count()).toBe(0);
  })
});
