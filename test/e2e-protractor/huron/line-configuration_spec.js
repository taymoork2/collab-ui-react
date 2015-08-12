'use strict';

describe('Line Configuration', function () {

  var user = utils.randomTestGmail();

  beforeAll(function () {
    utils.loginAndCreateHuronUser('huron-int1', user);
  }, 120000);

  it('should open the communcations panel', function () {
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
  });

  it('should have a primary directory number', function () {
    utils.expectIsDisplayed(telephony.directoryNumbers.first());
    utils.expectCount(telephony.directoryNumbers, 1);
  });

  it('should show directory number select', function () {
    utils.click(telephony.directoryNumbers.first());
    utils.expectIsDisplayed(telephony.internalNumber);
  });

  it('should show ESN number', function () {
    utils.expectIsDisplayed(telephony.esnTail);
    telephony.retrieveInternalNumber().then(function (number) {
      utils.expectText(telephony.esnTail, number);
    });
  });

  it('should not display remove button for primary line', function () {
    utils.expectIsNotDisplayed(telephony.lineConfigurationActionButton);
  });

  it('should select the first caller id option and save', function () {
    utils.expectIsDisplayed(telephony.callerId);
    utils.click(telephony.callerId);
    utils.click(telephony.callerIdOptionFirst);
    telephony.retrieveCallerId().then(function () {
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');
    });
  });

  it('should cancel a new directory number add', function () {
    utils.clickLastBreadcrumb();
    utils.expectIsDisplayed(telephony.communicationPanel);
    utils.click(telephony.communicationActionButton);
    utils.click(telephony.newLineButton);

    utils.expectIsDisplayed(telephony.lineConfigurationPanel);
    utils.click(telephony.cancelButton);
    utils.expectIsDisplayed(telephony.communicationPanel);
  });

  it('should add a new directory number', function () {
    utils.expectIsDisplayed(telephony.communicationPanel);
    utils.click(telephony.communicationActionButton);
    utils.click(telephony.newLineButton);

    utils.expectIsDisplayed(telephony.lineConfigurationPanel);
    telephony.waitForNewInternalNumber();
    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');
  });

  it('should verify new number', function () {
    utils.clickLastBreadcrumb();
    utils.expectIsDisplayed(telephony.communicationPanel);
    utils.expectIsDisplayed(telephony.directoryNumbers.first());
    utils.expectCount(telephony.directoryNumbers, 2);

    utils.click(telephony.directoryNumbers.last());
    utils.expectIsDisplayed(telephony.lineConfigurationPanel);
  });

  it('should update directory number', function () {
    utils.click(telephony.internalNumber);
    utils.click(telephony.internalNumberOptionFirst);
    telephony.retrieveInternalNumber().then(function (number) {
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.clickLastBreadcrumb();
      utils.expectIsDisplayed(telephony.directoryNumbers.last());
      utils.expectText(telephony.directoryNumbers.last(), number);

      utils.click(telephony.directoryNumbers.last());
      utils.expectIsDisplayed(telephony.lineConfigurationPanel);
    });
  });

  it('should save adding an external number', function () {
    telephony.retrieveExternalNumber().then(function (originalNumber) {
      utils.click(telephony.externalNumber);
      utils.click(telephony.externalNumberOptionLast);
      telephony.retrieveExternalNumber().then(function (number) {
        if (number !== originalNumber) {
          utils.click(telephony.saveButton);
          notifications.assertSuccess('Line configuration saved successfully');

          utils.clickLastBreadcrumb();
          utils.expectIsDisplayed(telephony.directoryNumbers.last());
          utils.expectText(telephony.directoryNumbers.last(), number);

          utils.click(telephony.directoryNumbers.last());
          utils.expectIsDisplayed(telephony.lineConfigurationPanel);
        }
      });
    });
  });

  it('should delete the non-primary number', function () {
    utils.click(telephony.lineConfigurationActionButton);
    utils.click(telephony.removeButton);
    utils.click(telephony.disassociateLine);
    notifications.assertSuccess('Line successfully unassigned from user');

    utils.expectIsDisplayed(telephony.communicationPanel);
    utils.expectCount(telephony.directoryNumbers, 1);
  });

  afterAll(function () {
    utils.deleteUser(user);
  });
});
