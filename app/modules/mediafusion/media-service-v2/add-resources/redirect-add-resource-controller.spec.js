  'use strict';
  describe('RedirectAddResourceControllerV2', function () {
    beforeEach(angular.mock.module('Mediafusion'));
    var vm, controller, cluster, RedirectTargetService, MediaClusterServiceV2, redirectTargetServiceMock, redirectTargetPromise, mediaClusterServiceMock, MediaClusterService, $q, XhrNotificationService, log, $modal, modalInstanceMock, windowMock, $scope, firstTimeSetup;
    var hostname = "MFA";
    var enteredCluster = "blr-ecp-246";
    var $rootScope, getClusterListDiffered, getGroupsDiffered, addRedirectTargetDiffered;
    beforeEach(inject(function (_$rootScope_, $controller, _$q_, _XhrNotificationService_, $log, _$modal_) {
      $q = _$q_;
      $scope = _$rootScope_.$new();
      firstTimeSetup = false;
      redirectTargetPromise = {
        then: sinon.stub()
      };
      addRedirectTargetDiffered = $q.defer();
      redirectTargetServiceMock = {
        addRedirectTarget: sinon.stub().returns(addRedirectTargetDiffered.promise)
      };
      getClusterListDiffered = $q.defer();
      getGroupsDiffered = $q.defer();
      //    createGroupDiffered = $q.defer();
      MediaClusterServiceV2 = {
        getClustersV2: sinon.stub().returns(redirectTargetPromise),
        createClusterV2: sinon.stub().returns(redirectTargetPromise),
        addRedirectTarget: sinon.stub(),
        getAll: sinon.stub().returns(redirectTargetPromise)
      };
      modalInstanceMock = {
        close: sinon.stub()
      };
      windowMock = {
        open: sinon.stub()
      };
      XhrNotificationService = _XhrNotificationService_;
      log = $log;
      log.reset();
      $modal = _$modal_;
      controller = $controller('RedirectAddResourceControllerV2', {
        MediaClusterServiceV2: MediaClusterServiceV2,
        $q: $q,
        $modalInstance: modalInstanceMock,
        $window: windowMock,
        XhrNotificationService: XhrNotificationService,
        log: log,
        $modal: $modal,
        $scope: $scope,
        firstTimeSetup: firstTimeSetup
      });
    }));
    it('controller should be defined', function () {
      expect(controller).toBeDefined();
    });
    /*    it('should call the getClustersV2', function () {
          getClusterListDiffered.resolve();
          $scope.$apply();
          controller.getV2Clusters();
          expect(MediaClusterServiceV2.getClustersV2).toHaveBeenCalled();
          expect(MediaClusterServiceV2.getClustersV2.callCount).toBe(2);
        });*/
    it('should call the addRedirectTargetClicked with hostname and cluster name', function () {
      addRedirectTargetDiffered.resolve();
      $scope.$apply();
      controller.addRedirectTargetClicked(hostname, enteredCluster);
      expect(MediaClusterServiceV2.createClusterV2).toHaveBeenCalled();
    });
    it('should call the redirectToTargetAndCloseWindowClicked', function () {
      controller.selectedCluster = 'MF_TEAM';
      sinon.stub(controller, 'redirectPopUpAndClose');
      controller.redirectPopUpAndClose(redirectTargetPromise);
      $scope.$apply();
      controller.redirectToTargetAndCloseWindowClicked("10.20.30.40", "MF_TEAM");
      expect(controller.redirectPopUpAndClose).toHaveBeenCalled();
    });
  });
