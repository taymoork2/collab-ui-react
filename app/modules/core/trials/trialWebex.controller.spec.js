/* globals $controller, $q, $rootScope, Analytics, Orgservice, TrialWebexCtrl, TrialWebexService, TrialTimeZoneService, TrialService */

'use strict';

describe('Controller: Trial Webex', function () {
  var controller, scope;
  var trialData = getJSONFixture('core/json/trials/trialData.json');
  var timeZoneData = [
    { 'label': '(GMT +07:00) Jakarta' },
    { 'label': '(GMT +04:00) Yerevan' },
    { 'label': '(GMT +00:00) Reykjavik' },
    { 'label': '(GMT -01:00) Azores' },
    { 'label': '(GMT +02:00) Bucharest' },
    { 'label': '(GMT -05:00) Toronto' },
  ];
  var sortedTimeZoneData = [
    { 'label': '(GMT -05:00) Toronto' },
    { 'label': '(GMT -01:00) Azores' },
    { 'label': '(GMT +00:00) Reykjavik' },
    { 'label': '(GMT +02:00) Bucharest' },
    { 'label': '(GMT +04:00) Yerevan' },
    { 'label': '(GMT +07:00) Jakarta' },
  ];

  afterEach(function () {
    controller = scope = undefined;
  });

  afterAll(function () {
    trialData = timeZoneData = sortedTimeZoneData = undefined;
  });

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(function () {
    bard.inject(this, '$controller', '$q', '$rootScope', 'Analytics', 'Orgservice', 'TrialWebexService', 'TrialTimeZoneService', 'TrialService');
  });

  beforeEach(function () {
    bard.mockService(TrialWebexService, {
      getData: trialData.enabled.trials.webexTrial,
      validateSiteUrl: function (siteUrl) {
        return $q(function (resolve) {
          if (siteUrl === 'acmecorp.webex.com') {
            resolve({
              isValid: true,
            });
          } else {
            resolve({
              isValid: false,
            });
          }
        });
      },
    });

    bard.mockService(TrialTimeZoneService, {
      getTimeZones: $q.resolve([]),
    });

    spyOn(Orgservice, 'getOrg');
    spyOn(Analytics, 'trackTrialSteps');
    spyOn(TrialTimeZoneService, 'getTimeZones').and.returnValue(timeZoneData);

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

  it('should extract timezone offset value and covert it to bool-like string', function () {
    expect(controller._helpers.getNumericPortion('(GMT -07:20) Jakarta')).toBe(-720);
    expect(controller._helpers.getNumericPortion('(GMT -07:00) Jakarta')).toBe(-700);
    expect(controller._helpers.getNumericPortion('(GMT +05:00) Jakarta')).toBe(500);
    expect(controller._helpers.getNumericPortion('(GMTjibbersh:00) Jakarta')).toBe(0);
  });

  it('should sort the timezone list correctly', function () {
    var result = controller.getTimeZones();
    expect(result).toEqual(sortedTimeZoneData);
  });

});
