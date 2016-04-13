'use strict';

describe('Convert Users', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  describe('Display the overview page', function () {
    it('should login as pbr org admin', function () {
      login.login('sqtest-admin');
    });

    xit('click on convert button should pop up the convert user modal', function () {
      utils.waitUntilEnabled(landing.convertButton);
      utils.click(landing.convertButton);
      utils.expectIsDisplayed(landing.convertDialog);
      utils.expectIsDisplayed(landing.convertModalClose);
      utils.expectIsDisplayed(landing.convertNextButton);
    });
  });

  xdescribe('convert users', function () {
    it('convert user operations', function () {
      utils.expectIsDisabled(landing.convertNextButton);
      utils.click(landing.unlicensedUserRow);
      utils.expectIsEnabled(landing.convertNextButton);
      utils.scrollBottom('.modal');
      utils.click(landing.convertNextButton);
      utils.expectIsDisplayed(landing.btnConvert);
      utils.expectIsDisplayed(landing.btnBack);
      utils.click(landing.btnBack);
      utils.expectIsEnabled(landing.convertNextButton);
      utils.click(landing.convertNextButton);
      utils.expectIsDisplayed(landing.closeConvertUser);
      utils.click(landing.closeConvertUser);
      utils.expectIsNotDisplayed(landing.btnConvert);
    });
  });
});
