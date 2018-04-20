'use strict';

describe('Service: AdoptionCardService', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var AdoptionCardService;
  var dummyData = {
    dataProvider: [{
      name: 'mediaFusion.metrics.clientType.android',
      value: 11684,
    }, {
      name: 'mediaFusion.metrics.clientType.DES',
      value: 1,
    }, {
      name: 'mediaFusion.metrics.clientType.desktop',
      value: 225394,
    }, {
      name: 'mediaFusion.metrics.clientType.ipad',
      value: 4444,
    }, {
      name: 'mediaFusion.metrics.clientType.iphone',
      value: 77276,
    }, {
      name: 'mediaFusion.metrics.clientType.jabber',
      value: 119,
    }, {
      name: 'mediaFusion.metrics.clientType.sip',
      value: 230012,
    }, {
      name: 'mediaFusion.metrics.clientType.board',
      value: 19231,
    }, {
      name: 'mediaFusion.metrics.clientType.tp',
      value: 132537,
    }, {
      name: 'mediaFusion.metrics.clientType.uc',
      value: 2,
    }, {
      name: 'mediaFusion.metrics.clientType.Unknown',
      value: 1294,
    }],
  };
  var sparkMobileHeading = 'mediaFusion.metrics.clientType.sparkMobile';
  var sparkDesktopHeading = 'mediaFusion.metrics.clientType.sparkDesktop';
  var sparkDevicesHeading = 'mediaFusion.metrics.clientType.sparkDevices';
  var sipHeading = 'mediaFusion.metrics.clientType.sip';


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

  it('all mobiles should be groped together when setClientTypePiechart is called', function () {
    var chart = AdoptionCardService.setClientTypePiechart(dummyData);
    var totalPercentage = 0;
    expect(chart.dataProvider[1].percentage).toBe(13.31);
    expect(chart.dataProvider[1].name).toBe(sparkMobileHeading);
    _.each(chart.dataProvider, function (type) {
      totalPercentage += type.percentage;
    });
    expect(totalPercentage).toBeGreaterThan(99);
    expect(totalPercentage).toBeLessThan(102);
  });

  it('all desktop should be groped together when setClientTypePiechart is called', function () {
    var chart = AdoptionCardService.setClientTypePiechart(dummyData);
    var totalPercentage = 0;
    expect(chart.dataProvider[0].percentage).toBe(32.11);
    expect(chart.dataProvider[0].name).toBe(sparkDesktopHeading);
    _.each(chart.dataProvider, function (type) {
      totalPercentage += type.percentage;
    });
    expect(totalPercentage).toBeGreaterThan(99);
    expect(totalPercentage).toBeLessThan(102);
  });

  it('all tp should be groped together when setClientTypePiechart is called', function () {
    var chart = AdoptionCardService.setClientTypePiechart(dummyData);
    var totalPercentage = 0;
    expect(chart.dataProvider[2].percentage).toBe(32.77);
    expect(chart.dataProvider[2].name).toBe(sipHeading);
    _.each(chart.dataProvider, function (type) {
      totalPercentage += type.percentage;
    });
    expect(totalPercentage).toBeGreaterThan(99);
    expect(totalPercentage).toBeLessThan(102);
  });

  it('all others should be groped together when setClientTypePiechart is called', function () {
    var chart = AdoptionCardService.setClientTypePiechart(dummyData);
    var totalPercentage = 0;
    expect(chart.dataProvider[3].percentage).toBe(21.62);
    expect(chart.dataProvider[3].name).toBe(sparkDevicesHeading);
    _.each(chart.dataProvider, function (type) {
      totalPercentage += type.percentage;
    });
    expect(totalPercentage).toBeGreaterThan(99);
    expect(totalPercentage).toBeLessThan(102);
  });
});
