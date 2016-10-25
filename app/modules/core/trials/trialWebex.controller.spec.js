/* globals $controller, $q, $rootScope, Orgservice, TrialWebexCtrl, TrialWebexService, TrialTimeZoneService, TrialService */

'use strict';

describe('Controller: Trial Webex', function () {
  var controller, scope;
  var trialData = getJSONFixture('core/json/trials/trialData.json');

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(function () {
    bard.inject(this, '$controller', '$q', '$rootScope', 'Orgservice', 'TrialWebexService', 'TrialTimeZoneService', 'TrialService');
  });

  beforeEach(function () {
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

    spyOn(Orgservice, 'getOrg');

    initController();
  });

  function initController() {
    scope = $rootScope.$new();
    scope.trialData = trialData.enabled;
    controller = $controller('TrialWebexCtrl', { $scope: scope.$new() });
    $rootScope.$apply();
  }

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
