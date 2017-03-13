'use strict';

describe('Service: AdoptionCardService', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var AdoptionCardService;
  var dummyData = {
    dataProvider: [{
      'name': 'android',
      'value': 23,
    }, {
      'name': 'iOS',
      'value': 45,
    }],
  };

  beforeEach(inject(function (_AdoptionCardService_) {
    AdoptionCardService = _AdoptionCardService_;
  }));

  it('should be defined', function () {
    expect(AdoptionCardService).toBeDefined();
  });

  it('setClientTypePiechart should return a donut pie successfully', function () {
    var chart = AdoptionCardService.setClientTypePiechart(dummyData);
    expect(chart.type).toBe('pie');
    expect(chart.fontSize).toBe(10);
  });

  it('setNumberOfMeetsOnPremisesPiechart should return a donut pie successfully', function () {
    var chart = AdoptionCardService.setNumberOfMeetsOnPremisesPiechart(dummyData);
    expect(chart.type).toBe('pie');
    expect(chart.fontSize).toBe(10);
    expect(chart.pullOutRadius).toBe('1%');
  });

  it('setDummyClientTypePiechart should return a dummy donut pie successfully', function () {
    var chart = AdoptionCardService.setDummyClientTypePiechart();
    expect(chart.type).toBe('pie');
    expect(chart.outlineColor).toBe('#ECECEC');
  });

  it('setDummyNumberOfMeetsOnPremisesPiechart should return a dummy donut pie successfully', function () {
    var chart = AdoptionCardService.setDummyNumberOfMeetsOnPremisesPiechart();
    expect(chart.type).toBe('pie');
    expect(chart.outlineColor).toBe('#ECECEC');
    expect(chart.borderColor).toBe('#A4ACAC');
  });

});
