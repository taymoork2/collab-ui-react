'use strict';

describe('Call Forwarding', function () {

  var user = utils.randomTestGmail();
  var dropdownVariables = {
    'voicemail': 'Voicemail',
    'addNew': 'Add New',
  };
  var snrLine = telephony.getRandomNumber();
  var externalCFLine = telephony.getRandomNumber();

  beforeAll(function () {
    utils.loginAndCreateHuronUser('huron-int1', user);
  }, 120000);

  it('should open the communcations panel', function () {
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
  });

  it('should show line configuration', function () {
    utils.clickFirst(telephony.directoryNumbers);
    utils.expectIsDisplayed(telephony.internalNumber);
  });

  it('should save call forward all to an outside number', function () {
    utils.expectRadioSelected(telephony.forwardBusyNoAnswerRadio);
    utils.click(telephony.forwardAllRadio);
    telephony.selectOption(telephony.forwardAll, dropdownVariables.addNew);
    telephony.setNumber(telephony.forwardAll, snrLine);
    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');

    utils.clickLastBreadcrumb();
    utils.clickFirst(telephony.directoryNumbers);

    utils.expectInputValue(telephony.forwardAll, snrLine);
  });

  xit('should save call forward all to voicemail', function () {
    utils.click(telephony.forwardAllRadio);
    utils.expectIsDisplayed(telephony.forwardAll);
    utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
    utils.expectIsNotDisplayed(telephony.forwardExternalCalls);
    telephony.selectOption(telephony.forwardAll, dropdownVariables.voicemail);
    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');

    utils.clickLastBreadcrumb();
    utils.clickFirst(telephony.directoryNumbers);

    utils.expectIsDisplayed(telephony.forwardAll);
    utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
    utils.expectInputValue(telephony.forwardAll, dropdownVariables.voicemail);
  });

  it('should save call forward busy/no answer to an outside number', function () {
    utils.expectRadioSelected(telephony.forwardAllRadio);
    utils.click(telephony.forwardBusyNoAnswerRadio);

    utils.expectIsNotDisplayed(telephony.forwardAll);
    utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
    utils.expectIsDisplayed(telephony.forwardExternalCalls);

    telephony.selectOption(telephony.forwardBusyNoAnswer, dropdownVariables.addNew);
    telephony.setNumber(telephony.forwardBusyNoAnswer, snrLine);
    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');

    utils.clickLastBreadcrumb();
    utils.clickFirst(telephony.directoryNumbers);

    utils.expectIsNotDisplayed(telephony.forwardAll);
    utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
    utils.expectIsDisplayed(telephony.forwardExternalCalls);
    utils.expectInputValue(telephony.forwardBusyNoAnswer, snrLine);
  });

  xit('should save call forward busy/no answer to voicemail', function () {
    utils.click(telephony.forwardBusyNoAnswerRadio);
    utils.expectIsNotDisplayed(telephony.forwardAll);
    utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
    utils.expectIsDisplayed(telephony.forwardExternalCalls);

    telephony.selectOption(telephony.forwardBusyNoAnswer, dropdownVariables.voicemail);
    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');

    utils.clickLastBreadcrumb();
    utils.clickFirst(telephony.directoryNumbers);

    utils.expectIsNotDisplayed(telephony.forwardAll);
    utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
    utils.expectIsDisplayed(telephony.forwardExternalCalls);
    utils.expectInputValue(telephony.forwardBusyNoAnswer, dropdownVariables.voicemail);
  });

  it('should save external call forwarding to an outside number', function () {
    utils.expectRadioSelected(telephony.forwardBusyNoAnswerRadio);
    utils.click(telephony.forwardBusyNoAnswerRadio);
    utils.click(telephony.forwardExternalCalls);

    telephony.selectOption(telephony.forwardExternalBusyNoAnswer, dropdownVariables.addNew);
    telephony.setNumber(telephony.forwardExternalBusyNoAnswer, externalCFLine);
    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');

    utils.clickLastBreadcrumb();
    utils.clickFirst(telephony.directoryNumbers);

    utils.expectInputValue(telephony.forwardExternalBusyNoAnswer, externalCFLine);
  });

  xit('should save external call forwarding to voicemail', function () {
    utils.click(telephony.forwardBusyNoAnswerRadio);
    utils.expectIsNotDisplayed(telephony.forwardExternalBusyNoAnswer);
    utils.click(telephony.forwardExternalCalls);

    utils.expectIsDisplayed(telephony.forwardExternalBusyNoAnswer);
    telephony.selectOption(telephony.forwardExternalBusyNoAnswer, dropdownVariables.voicemail);
    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');

    utils.clickLastBreadcrumb();
    utils.clickFirst(telephony.directoryNumbers);

    utils.expectInputValue(telephony.forwardExternalBusyNoAnswer, dropdownVariables.voicemail);
  });

  it('should save call forward none selection', function () {
    utils.expectRadioSelected(telephony.forwardBusyNoAnswerRadio);
    utils.click(telephony.forwardNoneRadio);
    utils.expectIsNotDisplayed(telephony.forwardAll);
    utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
    utils.expectIsNotDisplayed(telephony.forwardExternalCalls);
    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');

    utils.clickLastBreadcrumb();
    utils.clickFirst(telephony.directoryNumbers);

    utils.expectIsDisplayed(telephony.internalNumber);
    utils.expectIsNotDisplayed(telephony.forwardAll);
    utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
    utils.expectIsNotDisplayed(telephony.forwardExternalCalls);
  });

  afterAll(function () {
    utils.deleteUser(user);
  });

});
