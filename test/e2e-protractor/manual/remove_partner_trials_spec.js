'use strict';

describe('Remove partner trials from partner org page', function () {

  var accessToken;

  it('should login as an partner admin', function () {
    login.login('partner-admin', '#/partner/overview');
  });

  it('should have a partner token', function (done) {
    utils.retrieveToken().then(function (token) {
      accessToken = token;
      done();
    });
  });

  it('should remove all trials', function () {
    for ( var i = 0; i < 10; i++ )
    {
      navigation.clickCustomers();
      utils.expectIsNotDisplayed(element(by.css('.icon-spinner')));

      element.all(by.css('.ui-grid .ui-grid-row')).each(function (elem, index) {
        elem.getText().then(function (text) {
          var id = text.split('\n');
          if ((id[0] !== undefined) && (id[0].length > 0)
            && (id[0] !== 'Atlas Test Partner Organization My Organization')) {
              var a = element(by.id(id[0]+'LaunchCustomerButton'));
              a.getInnerHtml().then( function(inner) {
                var patt = /href="#\/login\/\s*(.*?)\s*\//;
                var result=patt.exec(inner);
                if ( result.length == 2 )
                {
                  console.log('Removing... ' + id[0] + ' - ' + result[1] );
                  if ( result[1] === "ABC1" )
                  {
                    //deleteTrialUtils.deleteOrg(result[1], accessToken);
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
