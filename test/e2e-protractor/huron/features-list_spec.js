/**
 * Created by sjalipar on 11/2/15.
 */
'use strict';

xdescribe('Admin should be able to', function () {

  it('login as an account admin and goto Huron Features Page', function () {
    login.login('huron-int1', '#/hurondetails/features');
  });

  it('see Create New Feature pop up when clicked on New button', function () {
    utils.expectIsDisplayed(huronFeatures.featuresList);
    utils.click(huronFeatures.newFeatureBtn);
    utils.expectIsPresent(huronFeatures.newfeatureModal);
    utils.expectIsPresent(huronFeatures.closeBtnOnModal);
  });

  it('close the create new feature pop up and stay on huron features page', function () {
    utils.expectIsPresent(huronFeatures.closeBtnOnModal);
    utils.click(huronFeatures.closeBtnOnModal);
    utils.expectIsDisplayed(huronFeatures.featuresList);
  });

  it('see only auto attendants when auto attendant filter is selected', function () {
    utils.click(huronFeatures.autoAttendantFilter);
    utils.expectIsDisplayed(huronFeatures.autoAttendants);
    utils.expectIsNotDisplayed(huronFeatures.huntGroups);
  });

  it('see only hunt groups when Hunt Group filter is selected', function () {
    utils.click(huronFeatures.huntGroupFilter);
    utils.expectIsDisplayed(huronFeatures.huntGroups);
    utils.expectIsNotDisplayed(huronFeatures.autoAttendants);
  });
});
