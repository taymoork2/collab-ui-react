describe('ActivationStatusController', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  describe('when fusion is enabled', function() {
    var $scope, controller, service, $httpBackend;

    beforeEach(inject(function(_$controller_, $rootScope, $injector){
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

      service = {
        getStatusesForUser: sinon.stub(),
        pollCIForUser: sinon.stub(),
        decorateWithStatus: sinon.stub()
      };
      var authinfo = {
        isFusion: function() {
          return true;
        }
      };
      $scope = $rootScope.$new();
      $scope.currentUser = {
        id: '123'
      };
      controller = _$controller_('ActivationStatusController', {
        $scope: $scope,
        USSService: service,
        Authinfo: authinfo
      });
    }));

    it('calls service on getStatus', function() {
      expect(service.decorateWithStatus.callCount).toBe(0);

      $scope.getStatus('yolo');

      expect(service.decorateWithStatus.callCount).toBe(1);
      expect(service.decorateWithStatus.args[0][0]).toBe('yolo');
    });

    it('shows enabled flag', function() {
      $scope.$digest();
      expect($scope.isEnabled).toBeTruthy();
    });

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

    it('sets and clears error flag when api derps', function(){
      expect($scope.lastRequestFailed).toBeFalsy();
      $scope.$digest();
      service.getStatusesForUser.callArgWith(1, [true]);
      expect($scope.lastRequestFailed).toBeTruthy();
      service.getStatusesForUser.callArgWith(1, null);
      expect($scope.lastRequestFailed).toBeFalsy();
    });

    it('polls CI and reloads data for a user', function() {
      expect($scope.inflight).toBeFalsy();
      expect(service.pollCIForUser.callCount).toBe(0);

      $scope.reload();

      expect($scope.inflight).toBeTruthy();
      expect(service.pollCIForUser.callCount).toBe(1);
      expect(service.pollCIForUser.args[0][0]).toBe("123");
      expect(service.getStatusesForUser.callCount).toBe(0);

      service.pollCIForUser.callArgWith(1, null, {});

      expect($scope.inflight).toBeTruthy();
      expect(service.getStatusesForUser.callCount).toBe(1);
      expect(service.getStatusesForUser.args[0][0]).toBe("123");

      service.getStatusesForUser.callArgWith(1, null, {});

      expect($scope.inflight).toBeFalsy();
    });

  });

  describe('when fusion is disenabled', function() {
    var $scope, controller, service, $httpBackend;

    beforeEach(inject(function(_$controller_, $rootScope, $injector){
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

      service = {
        getStatusesForUser: sinon.stub()
      };
      var authinfo = {
        isFusion: function() {
          return false;
        }
      };
      $scope = $rootScope.$new();
      $scope.currentUser = {
        id: '123'
      };
      controller = _$controller_('ActivationStatusController', {
        $scope: $scope,
        USSService: service,
        Authinfo: authinfo
      });
    }));

    it('does not show if user is not entitled', function(){
      $scope.$digest();
      expect(service.getStatusesForUser.callCount).toBe(0);
      expect($scope.isEnabled).toBeFalsy();
    });
  });
});
