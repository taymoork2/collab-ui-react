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
      });
      this.$scope.$apply();
    };
  });

  // Name Changes
  describe('default nav header title - ', function () {
    it('should be navHeaderTitleNew', function () {
      this.initController();
      expect(this.controller.pageHeader).toEqual('helpdesk.navHeaderTitleNew');
    });
  });
});
