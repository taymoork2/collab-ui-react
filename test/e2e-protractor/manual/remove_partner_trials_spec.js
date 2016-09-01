'use strict';

/*global deleteTrialUtils*/

describe('Remove partner trials from partner org page', function () {

  var accessToken;

  it('should login as an partner admin', function () {
    login.login('partner-admin', '#/partner/customers').then(function (token) {
      accessToken = token;
    });
  });

  describe('should remove all trials matching query string', function() {
    _.times(25, deleteCurrentPage);

    function deleteCurrentPage(i) {
      var query = "Atlas_Test_UI";

      it('should select trials matching "' + query + '"', function () {
        utils.sendKeys(partner.searchFilter, query + protractor.Key.ENTER );
        utils.expectValueToBeSet(partner.searchFilter, query, TIMEOUT);
        utils.waitForSpinner();
        utils.click(partner.allFilter).then( function() {
          console.log('Removing all trials starting with "' + query + '"');
        });
      });

      it ('should delete all trials on page #' + (i + 1), function() {
        utils.waitForSpinner();
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
                    console.log('Attempting to remove ' + id[0] + ' - ' + result[1] + '...\n');
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
      }, 60000 * 10);
    }
  });
});
