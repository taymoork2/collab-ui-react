'use strict';

var trialModule = require('./trial.module');

describe('Controller: Trial Webex', function () {
  beforeEach(function () {
    // TODO: fix the module dependencies
    this.initModules(
      trialModule,
      'Core',
      'Huron',
      'Sunlight'
    );
    this.injectDependencies(
      '$controller',
      '$q',
      '$scope',
      'Analytics',
      'Config',
      'Orgservice',
      'TrialTimeZoneService',
      'TrialWebexService'
    );

    this.trialData = getJSONFixture('core/json/trials/trialData.json');
    this.timeZoneData = [
      { label: '(GMT +07:00) Jakarta' },
      { label: '(GMT +04:00) Yerevan' },
      { label: '(GMT +00:00) Reykjavik' },
      { label: '(GMT -01:00) Azores' },
      { label: '(GMT +02:00) Bucharest' },
      { label: '(GMT -05:00) Toronto' },
    ];
    this.sortedTimeZoneData = [
      { label: '(GMT -05:00) Toronto' },
      { label: '(GMT -01:00) Azores' },
      { label: '(GMT +00:00) Reykjavik' },
      { label: '(GMT +02:00) Bucharest' },
      { label: '(GMT +04:00) Yerevan' },
      { label: '(GMT +07:00) Jakarta' },
    ];

    spyOn(this.TrialWebexService, 'getData').and.returnValue(this.trialData.enabled.trials.webexTrial);
    spyOn(this.TrialWebexService, 'validateSiteUrl').and.callFake(function (siteUrl) {
      return this.$q(function (resolve) {
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
    }.bind(this));

    spyOn(this.Orgservice, 'getOrg');
    spyOn(this.Analytics, 'trackTrialSteps');
    spyOn(this.TrialTimeZoneService, 'getTimeZones').and.returnValue(this.timeZoneData);

    this.$scope.trialData = this.trialData.enabled;
    this.controller = this.$controller('TrialWebexCtrl', { $scope: this.$scope });
    this.$scope.$apply();
  });

  it('should specify the source when calling the service to validate', function () {
    this.controller.validateSiteUrl('acmecorp.webex.com', 'acmecorp.webex.com');
    this.$scope.$apply();
    expect(this.TrialWebexService.validateSiteUrl).toHaveBeenCalledWith('acmecorp.webex.com', this.Config.shallowValidationSourceTypes.serviceSetup);
  });

  it('should resolve siteUrl validation when valid', function (done) {
    this.controller.validateSiteUrl('acmecorp.webex.com', 'acmecorp.webex.com')
      .then(function () {
        expect(true).toBeTruthy();
        done();
      })
      .catch(function () {
        done.fail('validation promise was rejected');
      });
    this.$scope.$apply(); // flush pending promises
  });

  it('should reject siteUrl validation when invalid', function (done) {
    this.controller.validateSiteUrl('invalid.test.com', 'invalid.test.com')
      .then(function () {
        done.fail('validation promise was resolved');
      })
      .catch(function () {
        expect(true).toBeTruthy();
        done();
      });
    this.$scope.$apply(); // flush pending promises
  });

  it('should extract timezone offset value and covert it to bool-like string', function () {
    expect(this.controller._helpers.getNumericPortion('(GMT -07:20) Jakarta')).toBe(-720);
    expect(this.controller._helpers.getNumericPortion('(GMT -07:00) Jakarta')).toBe(-700);
    expect(this.controller._helpers.getNumericPortion('(GMT +05:00) Jakarta')).toBe(500);
    expect(this.controller._helpers.getNumericPortion('(GMTjibbersh:00) Jakarta')).toBe(0);
  });

  it('should sort the timezone list correctly', function () {
    var result = this.controller.getTimeZones();
    expect(result).toEqual(this.sortedTimeZoneData);
  });
});
