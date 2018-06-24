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
    this.injectDependencies(
      'Analytics',
      'SearchService',
      'Notification',
      '$q',
      '$timeout');
    initSpies.call(this);

    this.SearchService.setStorage('webexOneMeeting', this.meeting);
  });

  function initSpies() {
    spyOn(this.Analytics, 'trackEvent');
    spyOn(this.SearchService, 'getUniqueParticipants').and.returnValue(this.$q.resolve(this.uniqueParticipants));

    const mockJoinData = { 50335745: 'Good' };
    spyOn(this.SearchService, 'getJoinMeetingTime').and.returnValue(this.$q.resolve(mockJoinData));

    const mockPSTNData = {
      items: [
        {
          key: '60335752',
          completed: true,
          items: [
            {
              callId: '2',
              startTime: 1515393187000,
              endTime: 1515394215000,
              tahoeQuality: [
                {
                  audioMos: 4,
                },
              ],
            },
          ],
        },
      ],
    };
    spyOn(this.SearchService, 'getPSTNSessionDetail').and.returnValue(this.$q.resolve(mockPSTNData));

    const mockVoipData = {
      items: [
        {
          key: '50335745',
          completed: true,
          items: [
            {
              startTime: 1515393187000,
              endTime: 1515394215000,
              mmpQuality: [
                {
                  lossrates: 1,
                  rtts: 100,
                },
              ],
            },
          ],
        },
      ],
    };
    spyOn(this.SearchService, 'getVoipSessionDetail').and.returnValue(this.$q.resolve(mockVoipData));

    const mockVideoData = {
      items: [
        {
          key: '50335759',
          completed: true,
          items: [
            {
              startTime: 1515393187000,
              endTime: 1515394215000,
              mmpQuality: [
                {
                  lossrates: 1,
                  rtts: 100,
                },
              ],
            },
          ],
        },
      ],
    };
    spyOn(this.SearchService, 'getVideoSessionDetail').and.returnValue(this.$q.resolve(mockVideoData));

    const mockCMRData = {
      items: [
        {
          key: '30337718',
          completed: true,
          items: [
            {
              startTime: 1515393187000,
              endTime: 1515394215000,
              audioQos: [],
              videoQos: [],
            },
          ],
        },
      ],
    };
    spyOn(this.SearchService, 'getCMRSessionDetail').and.returnValue(this.$q.resolve(mockCMRData));
  }

  function initComponent() {
    this.compileComponent('dgcTabMeetingdetail');
    this.$scope.$apply();
  }

  it('Should switch view when call onChangeQOS', function () {
    initComponent.call(this);
    this.controller.onChangeQOS('video');
    this.$timeout.flush();
    expect(this.controller.tabType).toBe('Video');
  });

  it('Should call Notification.errorResponse when response status is 404', function () {
    spyOn(this.Notification, 'errorResponse');
    this.SearchService.getUniqueParticipants.and.returnValue(this.$q.reject({ status: 404 }));
    initComponent.call(this);
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('Should update join meeting time', function () {
    initComponent.call(this);
    this.controller.getJoinMeetingTime();
    expect(this.controller.circleColor['50335745']).toBe('Good');
  });

  it('Should get voip session detail when data completed', function () {
    initComponent.call(this);
    this.controller.getVoipSessionDetail('');
    expect(this.controller.audioLines['50335745'].length).toBe(1);
  });

  it('Should retry to get voip session detail when data not completed', function () {
    const mockData = { items: [{ key: '50335745', completed: false, items: [{ startTime: 1515393187000, endTime: 1515394215000, mmpQuality: [] }] }] };
    this.SearchService.getVoipSessionDetail.and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.getVoipSessionDetail('');
    expect(this.controller.audioLines['50335745'].length).toBe(0);
  });

  it('Should get video session detail when data completed', function () {
    initComponent.call(this);
    this.controller.getVideoSessionDetail('');
    expect(this.controller.videoLines['50335759'].length).toBe(1);
  });

  it('Should get video session detail when data not completed', function () {
    const mockData = { items: [{ key: '50335759', completed: false, items: [{ startTime: 1515393187000, endTime: 1515394215000, mmpQuality: [] }] }] };
    this.SearchService.getVideoSessionDetail.and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.getVideoSessionDetail('');
    expect(this.controller.videoLines['50335759'].length).toBe(0);
  });

  it('Should get pstn session detail when data completed', function () {
    initComponent.call(this);
    this.controller.getPSTNSessionDetail('');
    expect(this.controller.audioLines['2_60335752'].length).toBe(1);
  });

  it('Should get pstn session detail when data not completed', function () {
    const mockData = {
      items: [
        {
          key: '60335752',
          completed: false,
          items: [
            {
              callId: '2',
              startTime: 1515393187000,
              endTime: 1515394215000,
              tahoeQuality: [],
            },
          ],
        },
      ],
    };
    this.SearchService.getPSTNSessionDetail.and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.getPSTNSessionDetail('');
    expect(this.controller.audioLines['2_60335752']).toBeUndefined();
  });

  it('Should get cmr session detail when data completed', function () {
    initComponent.call(this);
    this.controller.getPSTNSessionDetail('');
    expect(this.controller.audioLines['30337718'].length).toBe(1);
  });

  it('Should get cmr session detail when data not completed', function () {
    const mockData = {
      items: [
        {
          key: '40337718',
          completed: false,
          items: [
            {
              startTime: 1515393187000,
              endTime: 1515394215000,
              audioQos: [],
              videoQos: [],
            },
          ],
        },
      ],
    };
    this.SearchService.getCMRSessionDetail.and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.getPSTNSessionDetail('');
    expect(this.controller.audioLines['40337718'].length).toBe(0);
  });

  it('Should retry to send request', function () {
    initComponent.call(this);
    const mockData = { key: '0' };
    const mockFn = function(param) { mockData.key = param; };
    this.controller.retryRequest('voip', mockFn, ['40337718']);
    this.$timeout.flush();
    expect(mockData.key).toBe('40337718');
  });

  it('Should get voip quality: Poor', function () {
    initComponent.call(this);
    expect(this.controller.parseVoipQuality(6, 500)).toBe(3);
  });

  it('Should get voip quality: Fair', function () {
    initComponent.call(this);
    expect(this.controller.parseVoipQuality(4, 350)).toBe(2);
  });

  it('Should get video quality: Poor', function () {
    initComponent.call(this);
    expect(this.controller.parseVideoQuality(6, 400)).toBe(3);
  });

  it('Should get pstn quality: Poor', function () {
    initComponent.call(this);
    expect(this.controller.parsePSTNQuality(2)).toBe(3);
  });

  it('Should get pstn quality: Fail', function () {
    initComponent.call(this);
    expect(this.controller.parsePSTNQuality(0)).toBe(2);
  });
});
