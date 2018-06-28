import moduleName from './index';
import { SearchStorage } from './partner-meeting.enum';

describe('Component: DgcPartnerTabMeetingDetail', () => {
  beforeAll(function() {
    this.meeting = {
      endTime: 1513319315000,
      startTime: 1513319152000,
      featAndConn: [{ key: 'Chat', class: true, value: '40 Min' }],
      overview: { status: 2, conferenceId: '81296856363088285', createTime_: '2017-11-11' },
    };
    this.uniqueParticipants = [
      {
        userName: 'Felix',
        platform: '7',
        sessionType: '25',
        participants: [
          {
            joinTime: 1515039409000,
            userName: 'Felix',
            browser: 2,
            nodeId: 16789507,
          },
        ],
      },
      {
        userName: 'Felix2',
        platform: '10',
        sessionType: '0',
        participants: [
          {
            joinTime: 1515039320000,
            leaveTime: 1515039920000,
            userName: 'Felix2',
            duration: 600,
            browser: 2,
            nodeId: 16797697,
          },
        ],
      },
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
          { nodeId: '16789507', userName: 'Felix', timeStamp: 1515393367000, packageLossRate: '6.593406593406594E-4', latency: '298', dataQuality: '1' },
        ],
      },
      16797697: {
        completed: false,
      },
    };
    this.createdTimeNode = '.overviewInfo li:first p:first';
  });

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$q', '$timeout', 'Notification', 'PartnerSearchService', 'WebexReportsUtilService');

    this.WebexReportsUtilService.setStorage(SearchStorage.WEBEX_ONE_MEETING, this.meeting);

    spyOn(this.WebexReportsUtilService, 'isPartnerReportPage').and.returnValue(true);
    initSpies.apply(this);
  });

  function initComponent(this, isReject?: boolean) {
    if (isReject) {
      spyOn(this.PartnerSearchService, 'getUniqueParticipants').and.returnValue(this.$q.reject({ status: 404 }));
    } else {
      spyOn(this.PartnerSearchService, 'getUniqueParticipants').and.returnValue(this.$q.resolve(this.uniqueParticipants));
    }
    this.compileComponent('dgcPartnerTabMeetingDetail');
  }

  function initSpies() {
    spyOn(this.PartnerSearchService, 'getJoinMeetingTime').and.returnValue(this.$q.resolve({ 50335745: 'Good' }));
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
    spyOn(this.PartnerSearchService, 'getVoipSessionDetail').and.returnValue(this.$q.resolve(mockVoipData));

    const mockVideoSessionData = {
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
    spyOn(this.PartnerSearchService, 'getVideoSessionDetail').and.returnValue(this.$q.resolve(mockVideoSessionData));

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
    spyOn(this.PartnerSearchService, 'getPSTNSessionDetail').and.returnValue(this.$q.resolve(mockPSTNData));

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
    spyOn(this.PartnerSearchService, 'getCMRSessionDetail').and.returnValue(this.$q.resolve(mockCMRData));

    const mockSharingData = {
      items: [
        {
          key: '50335745',
          completed: true,
          items: [
            {
              sharingEvent: 'ApplicationSharing',
              startTime: '1530061874000',
              endTime: '1530062163000',
            },
          ],
        },
      ],
    };
    spyOn(this.PartnerSearchService, 'getSharingSessionDetail').and.returnValue(this.$q.resolve(mockSharingData));
  }

  it('should switch view when call onChangeQOS', function () {
    initComponent.call(this);
    this.controller.onChangeQOS('video');
    this.$timeout.flush();
    expect(this.controller.tabType).toBe('Video');
  });

  it('should call Notification.errorResponse when response status is 404', function () {
    spyOn(this.Notification, 'errorResponse');
    initComponent.call(this, true);
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('should update join meeting time', function () {
    initComponent.call(this);
    this.controller.getJoinMeetingTime();
    expect(this.controller.circleJoinTime['50335745']).toBe('Good');
  });

  it('should get meeting hosts', function () {
    const mockData = [
      { roleType: 'Host', timestamp: '1530061102000', toNodeId: '33558529' },
      { roleType: 'Presenter', timestamp: '1530063605000', toNodeId: '33562625' },
      { roleType: 'Host', timestamp: '1530067759000', toNodeId: '33562625' },
    ];
    spyOn(this.PartnerSearchService, 'getRoleChange').and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.getHosts();
    expect(this.controller.activityPoints.length).toBe(2);
  });

  it('should get sharing session detail when data completed', function () {
    initComponent.call(this);
    this.controller.getSharingSessionDetail('');
    expect(this.controller.sharingLines['50335745'].length).toBe(1);
  });

  it('should retry to get sharing session detail when data not completed', function () {
    const mockData = {
      items: [
        {
          key: '50335745',
          completed: false,
          items: [],
        },
      ],
    };
    this.PartnerSearchService.getSharingSessionDetail.and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.getSharingSessionDetail('');
    expect(this.controller.sharingLines['50335745'].length).toBe(0);
  });

  it('should get voip session detail when data completed', function () {
    initComponent.call(this);
    this.controller.getVoipSessionDetail('');
    expect(this.controller.audioLines['50335745'].length).toBe(1);
  });

  it('should retry to get voip session detail when data not completed', function () {
    const mockData = {
      items: [
        {
          key: '50335745',
          completed: false,
          items: [
            {
              startTime: 1515393187000,
              endTime: 1515394215000,
              mmpQuality: [],
            },
          ],
        },
      ],
    };
    this.PartnerSearchService.getVoipSessionDetail.and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.getVoipSessionDetail('');
    expect(this.controller.audioLines['50335745'].length).toBe(0);
  });

  it('should get video session detail when data completed', function () {
    initComponent.call(this);
    this.controller.getVideoSessionDetail('');
    expect(this.controller.videoLines['50335759'].length).toBe(1);
  });

  it('should get video session detail when data not completed', function () {
    const mockData = {
      items: [
        {
          key: '50335759',
          completed: false,
          items: [
            {
              startTime: 1515393187000,
              endTime: 1515394215000,
              mmpQuality: [],
            },
          ],
        },
      ],
    };
    this.PartnerSearchService.getVideoSessionDetail.and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.getVideoSessionDetail('');
    expect(this.controller.videoLines['50335759'].length).toBe(0);
  });

  it('should get pstn session detail when data completed', function () {
    initComponent.call(this);
    this.controller.getPSTNSessionDetail('');
    expect(this.controller.audioLines['2_60335752'].length).toBe(1);
  });

  it('should get pstn session detail when data not completed', function () {
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
    this.PartnerSearchService.getPSTNSessionDetail.and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.getPSTNSessionDetail('');
    expect(this.controller.audioLines['2_60335752']).toBeUndefined();
  });

  it('should get cmr session detail when data completed', function () {
    initComponent.call(this);
    this.controller.getPSTNSessionDetail('');
    expect(this.controller.audioLines['30337718'].length).toBe(1);
  });

  it('should get cmr session detail when data not completed', function () {
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
    this.PartnerSearchService.getCMRSessionDetail.and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.getPSTNSessionDetail('');
    expect(this.controller.audioLines['40337718'].length).toBe(0);
  });

  describe('retryRequest():', () => {
    it('should retry to send request', function () {
      initComponent.call(this);
      const mockData = { key: '0' };
      const mockFn = function(param) { mockData.key = param; };
      this.controller.retryRequest('voip', mockFn, ['40337718']);
      this.$timeout.flush();
      expect(mockData.key).toBe('40337718');
    });
  });

  describe('parseVoipQuality():', () => {
    it('should get voip quality: Poor', function () {
      initComponent.call(this);
      expect(this.controller.parseVoipQuality(6, 500)).toBe(3);
    });

    it('should get voip quality: Fair', function () {
      initComponent.call(this);
      expect(this.controller.parseVoipQuality(4, 350)).toBe(2);
    });
  });

  describe('parsePSTNQuality():', () => {
    it('should get pstn quality: Poor', function () {
      initComponent.call(this);
      expect(this.controller.parsePSTNQuality(2)).toBe(3);
    });

    it('should get pstn quality: Fail', function () {
      initComponent.call(this);
      expect(this.controller.parsePSTNQuality(3)).toBe(2);
    });
  });

  describe('parseVideoQuality():', () => {
    it('should get video quality: Poor', function () {
      initComponent.call(this);
      expect(this.controller.parseVideoQuality(6, 400)).toBe(3);
    });
  });
});
