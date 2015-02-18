describe('ActivationStatusController', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, controller, service, $httpBackend;

  beforeEach(inject(function(_$controller_, $rootScope, $injector){
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    service = {
      getStatusesForUser: sinon.stub()
    }
    $scope = $rootScope.$new();
    $scope.currentUser = { 
      id: '123' 
    };
    controller = _$controller_('ActivationStatusController', {
      $scope: $scope,
      USSService: service
    });
  }));

  it('clears status when user is not selected', function() {
    $scope.$digest();
    expect(service.getStatusesForUser.callCount).toBe(1);

    $scope.currentUser = {};
    $scope.$digest();

    expect(service.getStatusesForUser.callCount).toBe(1);
    expect($scope.activationStatus).toBeFalsy();
  });

  it('updates activation status for current user', function() {
    $scope.$digest();
    expect(service.getStatusesForUser.callCount).toBe(1);
    expect($scope.activationStatus).toBeFalsy();
    expect(service.getStatusesForUser.args[0][0]).toBe("123");

    service.getStatusesForUser.callArgWith(1, null, "data");
    expect($scope.activationStatus).toBe("data");
  });

  it('updates activation status when current user changes', function(){
    $scope.$digest();
    expect(service.getStatusesForUser.callCount).toBe(1);
    expect(service.getStatusesForUser.args[0][0]).toBe("123");

    $scope.currentUser = {id: '456'};
    $scope.$digest();
    expect(service.getStatusesForUser.callCount).toBe(2);
    expect(service.getStatusesForUser.args[1][0]).toBe("456");
  });

});
