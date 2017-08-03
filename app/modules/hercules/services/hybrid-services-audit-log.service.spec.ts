describe('HybridServicesAuditLogService', () => {

  beforeEach(angular.mock.module('Hercules'));

  describe('Expressway cluster history', () => {

    let HybridServicesAuditLogService;
    let $q: ng.IQService;
    let $scope;
    let rawData;
    let ResourceGroupService;
    let Userservice;

    const expectedUserDisplaynameGeorge = 'George Bush';
    const expectedUserDisplaynameBill = 'Bill Clinton';
    const groupName1 = 'Group Name 1';
    const groupName2 = 'Group Name 2';

    beforeEach(inject(dependencies));
    beforeEach(initSpies);

    function dependencies($rootScope, _$q_, _HybridServicesAuditLogService_, _ResourceGroupService_, _Userservice_) {
      $scope = $rootScope.$new();
      $q = _$q_;
      HybridServicesAuditLogService = _HybridServicesAuditLogService_;
      ResourceGroupService = _ResourceGroupService_;
      Userservice = _Userservice_;
    }

    function initSpies() {
      rawData = getJSONFixture('hercules/cluster-history-events.json');
      spyOn(HybridServicesAuditLogService, 'getClusterData').and.returnValue($q.resolve(rawData));
      spyOn(Userservice, 'getUserAsPromise').and.callFake((userId: string) => {
        if (userId === '983761d5-3120-4747-9ab3-a3960ecdecc8') {
          return $q.resolve({
            data: {
              id: '983761d5-3120-4747-9ab3-a3960ecdecc8',
              displayName: expectedUserDisplaynameGeorge,
            },
          });
        }
        if (userId === '5505f959-6d2f-4771-8f41-53b072335dbb') {
          return $q.resolve({
            data: {
              id: '5505f959-6d2f-4771-8f41-53b072335dbb',
              displayName: expectedUserDisplaynameBill,
            },
          });
        }
      });
      spyOn(ResourceGroupService, 'getAll').and.returnValue($q.resolve([{
        id: 'e65fde3f-56f4-4a9e-a5ea-e9ad7812e792',
        name: groupName1,
      }, {
        id: '501cb7db-a7b2-43fa-bc03-c78f6918a45a',
        name: groupName2,
      }]));
    }

    it('should get the timestamp, next link, and process the list of items', () => {
      HybridServicesAuditLogService.getFormattedExpresswayClusterHistory('1234')
        .then((data) => {
          expect(data.earliestTimestampSearched).toBe('2017-05-12T00:00:00Z');
          expect(data.nextUrl).toBe('https://i.am.next.url');
          expect(data.items.length).toBe(24);
        });
      $scope.$apply();
    });

    it('should process a name change event', () => {
      HybridServicesAuditLogService.getFormattedExpresswayClusterHistory('1234')
        .then((data) => {
          expect(data.items[2].type).toEqual('nameChange');
          expect(data.items[2].previousValue).toEqual('Vi savner Susanna Evens!');
          expect(data.items[2].newValue).toEqual('Vi er alle fra Vål\'enga!');
        });
      $scope.$apply();
    });

    it('should process a release channel change event', () => {
      HybridServicesAuditLogService.getFormattedExpresswayClusterHistory('1234')
        .then((data) => {
          expect(data.items[12].type).toEqual('releaseChannel');
          expect(data.items[12].previousValue).toEqual('hercules.fusion.add-resource-group.release-channel.stable');
          expect(data.items[12].newValue).toEqual('hercules.fusion.add-resource-group.release-channel.beta');
        });
      $scope.$apply();
    });

    it('should process an upgrade schedule change event', () => {
      HybridServicesAuditLogService.getFormattedExpresswayClusterHistory('1234')
        .then((data) => {
          expect(data.items[6].type).toEqual('upgradeSchedule');
          expect(data.items[6].previousValue).toEqual('06:00:00 weekDays.everyDay, Europe/Amsterdam. hercules.clusterHistoryTable.urgentUpgrades: 03:00:00');
          expect(data.items[6].newValue).toEqual('03:00:00 weekDays.everyDay, Europe/Oslo. hercules.clusterHistoryTable.urgentUpgrades: 03:00:00');
        });
      $scope.$apply();
    });

    it('should process an upgrade schedule change event also when only the urgent schedule changes', () => {
      HybridServicesAuditLogService.getFormattedExpresswayClusterHistory('1234')
        .then((data) => {
          expect(data.items[5].type).toEqual('upgradeSchedule');
          expect(data.items[5].previousValue).toEqual('03:00:00 weekDays.everyDay, Europe/Oslo. hercules.clusterHistoryTable.urgentUpgrades: 06:00:00');
          expect(data.items[5].newValue).toEqual('03:00:00 weekDays.everyDay, Europe/Oslo. hercules.clusterHistoryTable.urgentUpgrades: 03:00:00');
        });
      $scope.$apply();
    });

    it('should process a c_cal change event', () => {
      HybridServicesAuditLogService.getFormattedExpresswayClusterHistory('1234')
        .then((data) => {
          expect(data.items[1].type).toEqual('c_calVersion');
          expect(data.items[1].previousValue).toEqual('8.8-1.0.4292');
          expect(data.items[1].newValue).toEqual('8.8-1.0.4311');
        });
      $scope.$apply();
    });

    it('should process a c_ucmc change event', () => {
      HybridServicesAuditLogService.getFormattedExpresswayClusterHistory('1234')
        .then((data) => {
          expect(data.items[3].type).toEqual('c_ucmcVersion');
          expect(data.items[3].previousValue).toEqual('8.8-1.0.4326');
          expect(data.items[3].newValue).toEqual('');
        });
      $scope.$apply();
    });

    it('should process a c_mgmt change event', () => {
      HybridServicesAuditLogService.getFormattedExpresswayClusterHistory('1234')
        .then((data) => {
          expect(data.items[21].type).toEqual('c_mgmtVersion');
          expect(data.items[21].previousValue).toEqual('8.8-1.0.321255');
          expect(data.items[21].newValue).toEqual('8.8-1.0.321257');
        });
      $scope.$apply();
    });

    it('should use ResourceGroupService to resolve resourceGroupIds into proper names', () => {
      HybridServicesAuditLogService.getFormattedExpresswayClusterHistory('1234')
        .then((data) => {
          expect(data.items[13].type).toEqual('resourceGroup');
          expect(data.items[13].previousValue).toEqual(groupName2);
          expect(data.items[13].newValue).toEqual(groupName1);
          expect(ResourceGroupService.getAll).toHaveBeenCalledTimes(1);
        });
      $scope.$apply();
    });

    it('should call Userservice to resolve the display name of users, and set the name to empty is the user cannot be found', () => {
      HybridServicesAuditLogService.getFormattedExpresswayClusterHistory('1234')
        .then((data) => {
          expect(data.items[0].username).toEqual(expectedUserDisplaynameGeorge);
          expect(data.items[6].username).toEqual(expectedUserDisplaynameBill);
          expect(data.items[21].username).toEqual(''); // This is userId = 0f418c1b-517d-4ad9-8d46-aaed5697d0b5, i.e. a machine account
          expect(Userservice.getUserAsPromise).toHaveBeenCalledWith('983761d5-3120-4747-9ab3-a3960ecdecc8');
          expect(Userservice.getUserAsPromise).toHaveBeenCalledWith('5505f959-6d2f-4771-8f41-53b072335dbb');
          expect(Userservice.getUserAsPromise).toHaveBeenCalledTimes(2);
          expect(Userservice.getUserAsPromise).not.toHaveBeenCalledWith('0f418c1b-517d-4ad9-8d46-aaed5697d0b5');
        });
      $scope.$apply();
    });

  });

});
