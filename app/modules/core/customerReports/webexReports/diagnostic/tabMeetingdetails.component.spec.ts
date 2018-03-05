import testModule from './index';

describe('Component: dgcTabMeetingdetail', () => {
  beforeAll(function() {
    this.meeting = {
      endTime: 1513319315000,
      startTime: 1513319152000,
      featAndconn: [{ key: 'Chat', class: true, value: '40 Min' }],
      overview: { status: 2, conferenceId: '81296856363088285', createTime_: '2017-11-11' },
    };
    this.uniqueParticipants = [
      { userName: 'Felix', platform: '7', sessionType: '25', participants: [{ joinTime: 1515039409000, userName: 'Felix', browser: 2, nodeId: 16789507 }] },
      { userName: 'Felix2', platform: '10', sessionType: '0', participants: [{ joinTime: 1515039320000, leaveTime: 1515039920000, userName: 'Felix2', duration: 600, browser: 2, nodeId: 16797697 }] },
    ];
    this.pstnQOS = {
      16789507: {
        completed: true,
        items: [
          {
            callType: 'Dial In',
            startTime: 1513215016000,
            endTime: 1513219758000,
            tahoeQuality: [
              { rxPackets: 134785, txPackets: 123368, audioMos: 4, packetLost: 0, packetBad: 0, timestamp: 1513215016000 },
              { rxPackets: 134263, txPackets: 123736, audioMos: 3, packetLost: 0, packetBad: 0, timestamp: 1513215075000 },
              { rxPackets: 135110, txPackets: 123089, audioMos: 1, packetLost: 0, packetBad: 0, timestamp: 1513215135000 },
            ],
            audioQos: {
              VCS: [
                { packetLoss: 0, lossRate: 0.06, jitter: 2, timestamp: 1515389351508 },
                { packetLoss: 0, lossRate: 0.01, jitter: 21, timestamp: 1515389265000 },
              ],
            },
            videoQos: {
              VCS: [
                { packetLoss: 0, lossRate: 0.06, jitter: 3, timestamp: 1515389265000 },
                { packetLoss: 0, lossRate: 0.01, jitter: 22, timestamp: 1515389351508 },
              ],
            },
          },
        ],
      },
    };
    this.cmrQOS = {
      16797697: {
        completed: true,
        items: [
          {
            callerName: 'Felix',
            startTime: 1515389265000,
            endTime: 1515391138324,
            audioQos: {
              VCS: [
                { packetLoss: 0, lossRate: 0.06, jitter: 2, timestamp: 1515389351508 },
                { packetLoss: 0, lossRate: 0.01, jitter: 21, timestamp: 1515389265000 },
              ],
            },
            videoQos: {
              VCS: [
                { packetLoss: 0, lossRate: 0.06, jitter: 3, timestamp: 1515389265000 },
                { packetLoss: 0, lossRate: 0.01, jitter: 22, timestamp: 1515389351508 },
              ],
            },
          },
        ],
      },
    };
    this.videoQos = {
      16789507: {
        completed: true,
        items: [
          { nodeId: '16789507', userName: 'Felix', timeStamp: 1515393187000, packageLossRate: '0.0', latency: '285', dataQuality: '1' },
          { nodeId: '16789507', userName: 'Feilix', timeStamp: 1515393367000, packageLossRate: '6.593406593406594E-4', latency: '298', dataQuality: '1' },
        ],
      },
      16797697: {
        completed: false,
      },
    };
    this.createdTimeNode = '.overviewInfo li:first p:first';
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'SearchService', 'Notification', '$timeout');

    this.SearchService.setStorage('webexOneMeeting', this.meeting);
  });

  function initSpies() {
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.SearchService, 'getQOS').and.returnValue(this.$q.resolve());
    spyOn(this.SearchService, 'getJoinMeetingTime').and.returnValue(this.$q.resolve());
    spyOn(this.SearchService, 'getUniqueParticipants').and.returnValue(this.$q.resolve());
  }

  function initComponent(this) {
    this.compileComponent('dgcTabMeetingdetail');
    this.$scope.$apply();
  }

  it('Should get correct conferenceId from view', function () {
    initSpies.call(this);
    initComponent.call(this);

    expect(this.view.find(this.createdTimeNode)).toHaveText('2017-11-11');
  });

  it('should get sourceData and circleColor data', function () {
    initSpies.call(this);
    this.SearchService.getQOS.and.returnValue(this.$q.resolve(this.pstnQOS));
    this.SearchService.getUniqueParticipants.and.returnValue(this.$q.resolve(this.uniqueParticipants));
    initComponent.call(this);
    expect(_.size(this.controller.dataSet)).toBe(4);
  });

  it('should get correct data  when call onChangeQOS', function () {
    initSpies.call(this);
    this.SearchService.getQOS.and.returnValue(this.$q.resolve(this.cmrQOS));
    this.SearchService.getUniqueParticipants.and.returnValue(this.$q.resolve(this.uniqueParticipants));
    initComponent.call(this);

    this.controller.onChangeQOS('voip');
    this.$timeout.flush();
    expect(this.controller.loading).toBe(false);
  });

  it('Should call Notification.errorResponse when response status is 404', function () {
    initSpies.call(this);
    this.SearchService.getUniqueParticipants.and.returnValue(this.$q.reject({ status: 404 }));
    initComponent.call(this);
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('Should get "Good" voip quality', function() {
    initComponent.call(this);
    expect(this.controller.getVoipVideoQuality({latency: 100, packageLossRate: 0.01, }, 'voip')).toBe(1);
  });

  it('Should get "Fair" voip quality', function() {
    initComponent.call(this);
    expect(this.controller.getVoipVideoQuality({latency: 400, packageLossRate: 0.04, }, 'voip')).toBe(2);
  });

  it('Should get "Bad" voip quality', function() {
    initComponent.call(this);
    expect(this.controller.getVoipVideoQuality({latency: 500, packageLossRate: 0.06, }, 'voip')).toBe(3);
  });

  it('Should get "Good" video quality', function() {
    initComponent.call(this);
    expect(this.controller.getVoipVideoQuality({latency: 100, packageLossRate: 0.01, }, 'video')).toBe(1);
  });

  it('Should get "Bad" video quality', function() {
    initComponent.call(this);
    expect(this.controller.getVoipVideoQuality({latency: 500, packageLossRate: 0.06, }, 'video')).toBe(3);
  });

  it('Should retry to get PSTN QOS data', function() {
    initComponent.call(this);
    const mockData = { "16797697": {completed: false, items: [], }, };
    spyOn(this.SearchService, 'getQOS').and.callFake(function () {
      return {
        then: function (callback) {
          return callback(mockData);
        },
      };
    });
    
    this.controller.data['pstnReqtimes'] = 4;
    this.controller.pstnQOS(['16797697']);
    this.$timeout.flush();
    expect(this.controller.data['pstnReqtimes']).toBe(5);
  });

  it('Should retry to get CMR QOS data', function() {
    initComponent.call(this);
    const mockData = { "16797697": {completed: false, items: [], }, };
    spyOn(this.SearchService, 'getQOS').and.callFake(function () {
      return {
        then: function (callback) {
          return callback(mockData);
        },
      };
    });
    
    this.controller.data['cmrReqtimes'] = 4;
    this.controller.cmrQOS(['16797697']);
    this.$timeout.flush();
    expect(this.controller.data['cmrReqtimes']).toBe(5);
  });

  it('Should get line circle data', function () {
    initComponent.call(this);
    const mockData = { "16797697": {completed: false, items: [], }, };
    
    this.controller.data['voipReqtimes'] = 4;
    this.controller.getLineCircleData(mockData, 'voip');
    this.$timeout.flush();
    expect(this.controller.data['voipReqtimes']).toBe(5);
  });

  it('Should handle Call-Legs data', function() {
    initComponent.call(this);
    const mockData = {"tahoeInfo": [{"nodeId": "16797697", }], "voIPInfo": [{"nodeId": "16797697", }], "videoInfo": [{"nodeId": "16797697", }], };
    spyOn(this.SearchService, 'getCallLegs').and.callFake(function () {
      return {
        then: function (callback) {
          return callback(mockData);
        },
      };
    });

    const mockParam = [{"sessionType": "0", "platform": "10", "participants": [{"nodeId": "18797105", }], }, {"sessionType": "0", "platform": "0", "participants": [{"nodeId": "28991123", }], }];
    this.controller.callLegs(mockParam);
    expect(this.controller.callLegsData).toBeDefined();
  });
});
