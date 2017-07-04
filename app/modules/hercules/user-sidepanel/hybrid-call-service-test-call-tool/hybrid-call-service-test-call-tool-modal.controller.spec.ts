describe('HybridCallServiceTestToolModalController', () => {

  let $controller, $q, $scope, HybridServiceUserSidepanelHelperService, L2SipService, UserListService, Userservice;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$controller_, _$q_, $rootScope, _HybridServiceUserSidepanelHelperService_, _L2SipService_, _UserListService_, _Userservice_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope;
    HybridServiceUserSidepanelHelperService = _HybridServiceUserSidepanelHelperService_;
    L2SipService = _L2SipService_;
    UserListService = _UserListService_;
    Userservice = _Userservice_;
  }

  function initSpies() {
    spyOn(Userservice, 'getUserAsPromise').and.returnValue($q.resolve({
      data: {
        id: '1234',
        displayName: 'Ronaldo',
        photos: [{
          value: 'https://example.org/ronaldo.jpg',
        }],
      },
    }));
    spyOn(HybridServiceUserSidepanelHelperService, 'getDataFromUSS').and.returnValue($q.resolve([{}, {
      entitled: true,
      state: 'activated',
    }]));
    spyOn(UserListService, 'listUsersAsPromise').and.returnValue($q.resolve({
      data: {
        totalResults: 2,
        Resources: [{
          foo: 'bar',
        }, {
          foo: 'baz',
        }],
      },
    }));
    spyOn(L2SipService, 'userTestCall').and.returnValue($q.resolve({
      steps: [{
        type: 'a',
        description: 'b',
        severity: 'Info',
      }],
    }));
  }

  function cleanup() {
    $controller = $scope = $q = HybridServiceUserSidepanelHelperService = L2SipService = UserListService = Userservice = undefined;
  }

  function initController(incomingCallerUserId: string | undefined) {
    return $controller('HybridCallServiceTestToolModalController', {
      incomingCallerUserId: incomingCallerUserId,
      allowChangingCaller: false,
    });
  }

  it ('should automatically get the caller from Common Identity and USS if you provide an incoming userId', () => {

    const ctrl = initController('1234');
    $scope.$apply();

    expect(ctrl.caller).toEqual({
      input: 'Ronaldo',
      displayName: 'Ronaldo',
      userId: '1234',
      photo: 'https://example.org/ronaldo.jpg',
      ussStatus: 'activated',
    });
    expect(ctrl.callee).toEqual({});
    expect(Userservice.getUserAsPromise).toHaveBeenCalled();
    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS).toHaveBeenCalled();
  });

  it ('should not get any user data if you do not provide an incoming userId', () => {

    const ctrl = initController(undefined);
    $scope.$apply();

    expect(ctrl.caller).toEqual({
      userId: undefined,
    });
    expect(ctrl.callee).toEqual({});
    expect(Userservice.getUserAsPromise).not.toHaveBeenCalled();
    expect(HybridServiceUserSidepanelHelperService.getDataFromUSS).not.toHaveBeenCalled();
  });

  it ('should use UserListService when searching, and return s promise containing all results', (done) => {

    const ctrl = initController(undefined);
    ctrl.search('cristiano')
      .then((result) => {
        expect(result).toEqual([{
          foo: 'bar',
        }, {
          foo: 'baz',
        }]);
        expect(UserListService.listUsersAsPromise).toHaveBeenCalledWith(jasmine.objectContaining({
          filter: {
            nameStartsWith: 'cristiano',
          },
        }));
        done();
      });
    $scope.$apply();
  });

  it ('should use L2SipService when starting the test', () => {

    const ctrl = initController(undefined);
    ctrl.startTest('123', '456');
    $scope.$apply();

    expect(L2SipService.userTestCall).toHaveBeenCalledWith('123', '456');
  });

  it ('should handle users with no picture', () => {

    const ctrl = initController(undefined);
    $scope.$apply();
    const updatedUser = ctrl.setUser({
      id: '123',
      displayName: 'Rooney',
    });

    expect(updatedUser).toEqual({
      input: 'Rooney',
      displayName: 'Rooney',
      userId: '123',
    });
  });

});
