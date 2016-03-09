'use strict';

describe('Trial Ext Interest Flow', function () {
  var trialExtInterestUrl = '#/trialExtInterest?eqp=';
  var invalidQueryParam = 'invalidParam';
  // encrypted param to notify partner (i.e. 'phtest77+partner.integration@gmail.com') of the customer interest to extend trial
  var validEncryptedQueryParam = '_1ITsCPyAHuPPZQSevF%2BsoFci%2BvV38uWQ24dvWILRsIpQbHhlttsTWKLwiOXdZBKoQbP4GgX3EnAS4zgujsneMK2K6v_s43pnBDrWxSfbct6V%2B_6auYDjapq3kfBpTxTqDEi7U5eASA4fkLNbvoa3_GVPLAVnPh%2Bm77wTlieRuv7r6Ak5ReOB%2BFAFEfnNDj0I%2BhrQ6UcR0oGIVYHP_Fd7BJZ5LYHTbcPCLdEoRpaI%2B6QyQYpSraN2Xeb5G0%2B_0T53DvPnBw8ePRNU1u1541oGvjn3yoEcOjVynRUED8Fmtl39wuha8Wr6JKiMFzQHWwZSCHfhU4QVlHdue_MFYbP6DDuK7e9PRXMqLlKfe8VPOxbP33Kdu2heVbhOOo80kynC0gHkM0FF76qvLyagxR5e0ADQwRfRItsrvYGr47fZxsoQMHgti7gNvUI7j1tl793';

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  describe('Trial ext interest page with validEncryptedQueryParam', function () {
    it('should login as squared team member admin user', function () {
      login.login('pbr-admin');
    });

    it('should display a success message with validEncryptedQueryParam', function () {
      navigation.navigateTo(trialExtInterestUrl + validEncryptedQueryParam);
      utils.expectIsDisplayed(trialextinterest.notifyPartnerSuccess);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  describe('Trial ext interest page with invalidQueryParam', function () {
    it('should login as squared team member admin user', function () {
      login.login('pbr-admin');
    });

    it('should display an error message with invalidQueryParam', function () {
      navigation.navigateTo(trialExtInterestUrl + invalidQueryParam);
      utils.expectIsDisplayed(trialextinterest.notifyPartnerBadLink);
    });
  });

});
