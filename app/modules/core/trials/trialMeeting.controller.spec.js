/* globals $controller, $q, $rootScope, TrialMeetingCtrl, TrialMeetingService, WebexTrialService*/
'use strict';

describe('Controller: Trial Meeting', function () {
  var controller;
  var trialData = getJSONFixture('core/json/trials/trialData.json');

  beforeEach(module('core.trial'));
  beforeEach(module('Core'));

  beforeEach(function () {
    bard.inject(this, '$controller', '$q', '$rootScope', 'TrialMeetingService', 'WebexTrialService');

    bard.mockService(TrialMeetingService, {
      getData: trialData.enabled.trials.meetingTrial
    });

    bard.mockService(WebexTrialService, {
      getTimeZones: $q.when([]),
      validateSiteUrl: function (siteUrl) {
        return $q(function (resolve, reject) {
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

    controller = $controller('TrialMeetingCtrl');
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
