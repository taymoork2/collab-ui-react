'use strict';

/*global deleteTrialUtils*/

describe('Remove partner trials from partner org page', function () {

  var accessToken;

  it('should login as an partner admin', function () {
    login.login('partner-admin', '#/partner/overview').then(function (token) {
      accessToken = token;
    });
  });

  it('should remove all trials', function () {
    for (var i = 0; i < 1; i++) {
      navigation.clickCustomers();
      utils.click(partner.trialFilter);
      utils.expectIsNotDisplayed(element.all(by.css('.icon-spinner')).get(0));

      //      utils.click(element(by.css('.ui-grid-icon-up-dir')));

      element.all(by.css('.ui-grid .ui-grid-row')).each(function (elem) {
        elem.getText().then(function (text) {
          var id = text.split('\n');
          if ((id[0] !== undefined) && (id[0].length > 0) && (id[0] !== 'Atlas Test Partner Organization My Organization')) {
            var a = element(by.css("li[id='" + id[0] + "LaunchCustomerButton']"));
            a.getInnerHtml().then(function (inner) {
              var patt = /href="#\/login\/\s*(.*?)\s*\//;
              var result = patt.exec(inner);
              if (result.length == 2) {
                //if ( id[0] === "ABC1" )
                {
                  deleteTrialUtils.deleteOrg(result[1], accessToken).then(function () {
                    console.log('Removed ' + id[0] + ' - ' + result[1] + '\n');
                  });
                }
              }
            });
          }
        });
      });

      browser.refresh();
    }
  }, 60000 * 30); // 30 minutes
});
