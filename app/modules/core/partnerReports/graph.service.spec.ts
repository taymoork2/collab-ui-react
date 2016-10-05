import {
  IActiveUserData,
  ICallMetricsData,
  IMediaQualityData,
  IPopulationData,
} from './partnerReportInterfaces';

describe('Service: Partner Graph Service', () => {
  let validateService = {
    validate: () => {},
    validateNow: () => {},
  };

  let dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  let dummyActiveUserData: Array<IActiveUserData> = _.clone(dummyData.activeUser.one);
  let dummyPopulationData: Array<IPopulationData> = _.clone(dummyData.activeUserPopulation);
  let mediaQualityGraphData: Array<IMediaQualityData> = _.clone(dummyData.activeUser.one);
  let callMetricsData: ICallMetricsData = _.clone(dummyData.callMetrics);

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('GraphService');
    spyOn(validateService, 'validate');
    spyOn(validateService, 'validateNow');
  });

  describe('Active Users graph services', () => {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        dataProvider: dummyActiveUserData,
        validateData: validateService.validate,
      });
    });

    it('should have created a graph when getActiveUsersGraph is called the first time', function () {
      this.GraphService.getActiveUsersGraph(dummyActiveUserData, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when getActiveUsersGraph is called a second time', function () {
      let chart = this.GraphService.getActiveUsersGraph(dummyActiveUserData, null);
      this.GraphService.getActiveUsersGraph(dummyActiveUserData, chart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Active User Population graph services', () => {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        dataProvider: dummyPopulationData,
        validateData: validateService.validate,
        valueAxes: [{
          integersOnly: true,
          minimum: 0,
        }],
      });
    });

    it('should have created a graph when getActiveUserPopulationGraph is called the first time', function () {
      this.GraphService.getActiveUserPopulationGraph(dummyPopulationData, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when getActiveUserPopulationGraph is called a second time', function () {
      let chart = this.GraphService.getActiveUserPopulationGraph(dummyPopulationData, null);
      this.GraphService.getActiveUserPopulationGraph(dummyPopulationData, chart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Media Quality graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        dataProvider: mediaQualityGraphData,
        validateData: validateService.validate,
      });
    });

    it('should have created a graph when getMediaQualityGraph is called the first time', function () {
      this.GraphService.getMediaQualityGraph(mediaQualityGraphData, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when getMediaQualityGraph is called a second time', function () {
      let chart = this.GraphService.getMediaQualityGraph(mediaQualityGraphData, null);
      this.GraphService.getMediaQualityGraph(mediaQualityGraphData, chart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });

  describe('Call Metrics graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        dataProvider: callMetricsData,
        validateNow: validateService.validateNow,
      });
    });

    it('should have created a graph when getCallMetricsDonutChart is called the first time', function () {
      this.GraphService.getCallMetricsDonutChart(callMetricsData, null);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validateNow).not.toHaveBeenCalled();
    });

    it('should update graph when getCallMetricsDonutChart is called a second time', function () {
      let chart = this.GraphService.getCallMetricsDonutChart(callMetricsData, null);
      this.GraphService.getCallMetricsDonutChart(callMetricsData, chart);
      expect(validateService.validateNow).toHaveBeenCalledWith(true, false);
    });
  });
});
