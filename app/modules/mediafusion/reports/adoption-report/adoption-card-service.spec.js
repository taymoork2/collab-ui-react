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
    }, {
      'name': 'SIP',
      'value': 2,
    }, {
      'name': 'iPhone',
      'value': 1,
    }, {
      'name': 'Windows',
      'value': 4,
    }, {
      'name': 'Jabber',
      'value': 8,
    }, {
      'name': 'Spark',
      'value': 14,
    }],
  };
  var othersHeading = 'mediaFusion.metrics.othersHeading';

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

  it('setTotalParticipantsPiechart should return a donut pie successfully', function () {
    var chart = AdoptionCardService.setTotalParticipantsPiechart(dummyData);
    expect(chart.type).toBe('pie');
    expect(chart.outlineThickness).toBe(0);
    expect(chart.labelRadius).toBe(5);
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

  it('setDummyTotalParticipantsPiechart should return a dummy donut pie successfully', function () {
    var chart = AdoptionCardService.setDummyTotalParticipantsPiechart();
    expect(chart.type).toBe('pie');
    expect(chart.innerRadius).toBe('60%');
  });

  it('formatOthersData should create "others" tag by aggregate the values less than 5%, when setClientTypePiechart is called', function () {
    var chart = AdoptionCardService.setClientTypePiechart(dummyData);
    var totalPercentage = 0;
    expect(chart.dataProvider[4].percentage).toBe(7.22);
    expect(chart.dataProvider[4].name).toBe(othersHeading);
    _.each(chart.dataProvider, function (type) {
      totalPercentage += type.percentage;
    });
    expect(totalPercentage).toBeGreaterThan(99);
    expect(totalPercentage).toBeLessThan(101);
  });

});
