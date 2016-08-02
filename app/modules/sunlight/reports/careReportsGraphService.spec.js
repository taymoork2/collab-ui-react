'use strict';

describe('Service: Care Reports Graph Service', function () {
  var CareReportsGraphService;
  var responseData = getJSONFixture('sunlight/json/careReportGraphServiceResponse.json');
  var dummyReport = {};
  dummyReport.data = 'dummyData';
  dummyReport.legendTitles = ['dummy1', 'dummy1'];
  dummyReport.colors = ['color1', 'color2'];

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(function (_CareReportsGraphService_) {
    CareReportsGraphService = _CareReportsGraphService_;
  }));

  it('should exist', function () {
    expect(CareReportsGraphService).toBeDefined();
  });

  describe('service responses:', function () {
    it('getBaseVariable should return expected responses based on the key', function () {
      // correct key responses
      expect(CareReportsGraphService.getBaseVariable('axis')).toEqual(responseData.baseVariables['axis']);
      expect(CareReportsGraphService.getBaseVariable('legend')).toEqual(responseData.baseVariables['legend']);
      expect(CareReportsGraphService.getBaseVariable('balloon')).toEqual(responseData.baseVariables['balloon']);
      expect(CareReportsGraphService.getBaseVariable('chartCursor')).toEqual(responseData.baseVariables['chartCursor']);
      expect(CareReportsGraphService.getBaseVariable('export')).toEqual(responseData.baseVariables['export']);

      // incorrect key response
      expect(CareReportsGraphService.getBaseVariable('col')).toEqual({});
    });

    it('getBaseSerialGraph should return expected defaults for an area graph', function () {
      var serialGraph = CareReportsGraphService.getBaseSerialGraph(dummyReport, {}, {}, 'dummyData', {}, {}, {});
      expect(serialGraph).toBeDefined();
    });

  });
});
