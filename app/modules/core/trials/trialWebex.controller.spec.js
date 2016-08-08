/* globals $controller, $q, $rootScope, TrialWebexCtrl, TrialWebexService, TrialTimeZoneService*/
'use strict';

describe('Controller: Trial Webex', function () {
  var controller;
  var trialData = getJSONFixture('core/json/trials/trialData.json');

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(function () {
    bard.inject(this, '$controller', '$q', '$rootScope', 'TrialWebexService', 'TrialTimeZoneService');

    bard.mockService(TrialWebexService, {
      getData: trialData.enabled.trials.webexTrial,
      validateSiteUrl: function (siteUrl) {
        return $q(function (resolve) {
          if (siteUrl === 'acmecorp.webex.com') {
            resolve({
              isValid: true
            });
          } else {
            resolve({
              isValid: false
            });
          }
        });
      }
    });

    bard.mockService(TrialTimeZoneService, {
      getTimeZones: $q.when([])
    });

    controller = $controller('TrialWebexCtrl');
  });

  it('should resolve siteUrl validation when valid', function (done) {
    controller.validateSiteUrl('acmecorp.webex.com')
      .then(function () {
        expect(true).toBeTruthy();
        done();
      })
      .catch(function () {
        done.fail('validation promise was rejected');
      });
    $rootScope.$apply(); // flush pending promises
  });

  it('should reject siteUrl validation when invalid', function (done) {
    controller.validateSiteUrl('invalid.test.com')
      .then(function () {
        done.fail('validation promise was resolved');
      })
      .catch(function () {
        expect(true).toBeTruthy();
        done();
      });
    $rootScope.$apply(); // flush pending promises
  });
});
