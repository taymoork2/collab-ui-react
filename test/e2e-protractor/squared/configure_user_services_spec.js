'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */

describe('Configuring services per-user', function () {

  var testUser = 'christian@pizzashop.com';

  //After navigating to and and validating the messenger interop
  //controls, performs some action on them via a callback.
  var doWithMIControls = function (callback) {

    utils.refresh().then(function () {

      navigation.clickUsers();

      utils.searchAndClick(testUser);

      utils.click(users.messagingService).then(function () {

        utils.expectIsDisabled(users.saveButton);

        utils.expectIsDisplayed(users.checkBoxEnts);

        //Make sure there's only a single entitlements checkbox
        utils.expectCount(users.checkBoxEnts, 1);

        users.checkBoxEnts.then(function (checkBoxEnts) {

          var wrapperDiv = checkBoxEnts[0];

          //Make sure the checkbox is the messenger interop entitlement
          var miLabel = utils.getInnerElementByTagName(wrapperDiv, 'span');
          utils.expectText(miLabel, 'Messenger interop');

          var miCheckbox = utils.getInnerElementByTagName(wrapperDiv, 'input');

          callback(miLabel, miCheckbox);

        });

      });

    });

  };

  //Verifies that the messenger interop entitlement starts in the opposite of the
  //desired state, then puts it into the desired state.
  var verifyAndSetMessengerInterop = function (state, done) {

    doWithMIControls(function (label, checkbox) {

      utils.isSelected(checkbox).then(function (startSelected) {

        utils.expectSelected(startSelected, !state);

        //Put messenger interop into the requested ending state
        utils.click(label).then(function () {

          utils.isSelected(checkbox).then(function (endSelected) {

            utils.expectSelected(endSelected, state);

            utils.click(users.saveButton).then(function () {

              notifications.assertSuccess(testUser, 'entitlements were updated successfully');

              done();

            });

          });

        });

      });

    });

  };

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.loginThroughGui(helper.auth['account-admin'].user, helper.auth['account-admin'].pass);
  });

  it('should enable messenger interop if necessary, before the rest of tests in this spec', function (done) {

    doWithMIControls(function (label, checkbox) {

      utils.isSelected(checkbox).then(function (startSelected) {

        if (!startSelected) {

          utils.click(label).then(function () {

            utils.isSelected(checkbox).then(function (endSelected) {

              utils.expectSelected(endSelected);

              utils.click(users.saveButton).then(function () {

                notifications.assertSuccess(testUser, 'entitlements were updated successfully');

                done();

              });

            });

          });

        } else {

          done();

        }

      });

    });

  });

  it('should disable the Messenger interop entitlement', function (done) {
    verifyAndSetMessengerInterop(false, done);
  });

  it('should re-enable the Messenger interop entitlement', function (done) {
    verifyAndSetMessengerInterop(true, done);
  });

  it('should verify that the Messenger interop entitlement was re-enabled after a refresh', function (done) {
    doWithMIControls(function (label, checkbox) {
      utils.isSelected(checkbox).then(function (selected) {
        utils.expectSelected(selected);
        done();
      });
    });
  });

  it('should log out', function () {
    navigation.logout();
  });

});
