'use strict';

describe('Controller: HelpdeskHeaderController', function () {
  beforeEach(function () {
    this.initModules('Squared');
    this.injectDependencies(
      '$controller',
      '$q',
      '$scope',
      'HelpdeskSearchHistoryService',
      'HelpdeskSparkStatusService',
      'FeatureToggleService',
      'UrlConfig');

    spyOn(this.HelpdeskSearchHistoryService, 'getAllSearches').and.returnValue([]);
    spyOn(this.HelpdeskSparkStatusService, 'getHealthStatuses').and.returnValue(this.$q.resolve('getHealthStatuses'));
    spyOn(this.HelpdeskSparkStatusService, 'highestSeverity').and.returnValue('highestSeverity');
    spyOn(this.UrlConfig, 'getStatusPageUrl').and.returnValue('statusPageUrl');

    this.initController = function () {
      this.controller = this.$controller('HelpdeskHeaderController', {
        $scope: this.$scope,
        HelpdeskSearchHistoryService: this.HelpdeskSearchHistoryService,
        HelpdeskSparkStatusService: this.HelpdeskSparkStatusService,
        FeatureToggleService: this.FeatureToggleService,
      });
      this.$scope.$apply();
    };
  });

  // Name Changes
  describe('atlas2017NameChangeGetStatus changes - ', function () {
    it('should have base header name when toggle is false', function () {
      spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
      this.initController();
      expect(this.controller.pageHeader).toEqual('helpdesk.navHeaderTitle');
    });

    it('should have new header name when toggle is true', function () {
      spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(true));
      this.initController();
      expect(this.controller.pageHeader).toEqual('helpdesk.navHeaderTitleNew');
    });
  });
});
