'use strict';

describe('Service: AdoptionPiechartService', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var AdoptionPiechartService;
  var dummyData = {
    dataProvider: [{
      "name": "android",
      "value": 23,
    }, {
      "name": "iOS",
      "value": 45,
    }],
  };

  beforeEach(inject(function (_AdoptionPiechartService_) {
    AdoptionPiechartService = _AdoptionPiechartService_;
  }));

  it('should be defined', function () {
    expect(AdoptionPiechartService).toBeDefined();
  });

  it('setClientTypePiechart should return a donut pie successfully', function () {
    var chart = AdoptionPiechartService.setClientTypePiechart(dummyData);
    expect(chart.type).toBe('pie');
    expect(chart.fontSize).toBe(10);
  });

  it('setNumberOfMeetsOnPremisesPiechart should return a donut pie successfully', function () {
    var chart = AdoptionPiechartService.setNumberOfMeetsOnPremisesPiechart(dummyData);
    expect(chart.type).toBe('pie');
    expect(chart.fontSize).toBe(10);
    expect(chart.pullOutRadius).toBe('1%');
  });

  it('setDummyClientTypePiechart should return a dummy donut pie successfully', function () {
    var chart = AdoptionPiechartService.setDummyClientTypePiechart();
    expect(chart.type).toBe('pie');
    expect(chart.outlineColor).toBe('#ECECEC');
  });

  it('setDummyNumberOfMeetsOnPremisesPiechart should return a dummy donut pie successfully', function () {
    var chart = AdoptionPiechartService.setDummyNumberOfMeetsOnPremisesPiechart();
    expect(chart.type).toBe('pie');
    expect(chart.outlineColor).toBe('#ECECEC');
    expect(chart.borderColor).toBe('#A4ACAC');
  });

});
