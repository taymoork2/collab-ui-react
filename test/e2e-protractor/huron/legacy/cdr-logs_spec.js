'use strict';

describe('Huron CDR Support', function () {
  var pageTitle = 'Device Support';

  beforeAll(function () {
    login.login('huron-e2e');
  }, 120000);

  //TODO CDR Logs is hidden
  xdescribe('CDR Logs feature', function () {
    it('should navigate to the CDR Support page', function () {
      navigation.clickCDRSupport();

      utils.expectIsDisplayed(cdr.pageTitle);
      utils.expectText(cdr.pageTitle, pageTitle);
    });

    it('should verify the search fields are present', function () {
      utils.expectIsDisplayed(cdr.searchRadio);
      utils.expectIsDisplayed(cdr.uploadRadio);
      utils.expectRadioSelected(cdr.searchRadio);

      utils.expectIsDisplayed(cdr.callingPartyNumber);
      utils.expectIsDisplayed(cdr.calledPartyNumber);
      utils.expectIsDisplayed(cdr.callingPartyDevice);
      utils.expectIsDisplayed(cdr.calledPartyDevice);
      utils.expectIsDisplayed(cdr.startTime);
      utils.expectIsDisplayed(cdr.endTime);
      utils.expectIsDisplayed(cdr.startDate);
      utils.expectIsDisplayed(cdr.endDate);
      utils.expectIsDisplayed(cdr.hitSize);
      utils.expectIsDisplayed(cdr.submit);
      utils.expectIsDisplayed(cdr.reset);
    });

    it('should display upload option when uploadRadio button is clicked', function () {
      utils.click(cdr.uploadRadio);

      utils.expectIsDisplayed(cdr.searchRadio);
      utils.expectIsDisplayed(cdr.uploadRadio);
      utils.expectRadioSelected(cdr.uploadRadio);

      utils.expectIsDisplayed(cdr.uploadFile);
      utils.expectIsDisplayed(cdr.uploadBtn);
    });
  });
});
