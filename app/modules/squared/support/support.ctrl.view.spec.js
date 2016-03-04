'use strict';
describe('Controller: SupportCtrl', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Userservice, httpBackend, $compile, controller, Authinfo, $scope, $templateCache;

  function stubAllHttpGetRequests() {
    httpBackend.whenGET(/.*/).respond({});
  }

  beforeEach(inject(function (_Userservice_, $httpBackend, _$templateCache_, _$compile_, $rootScope, $controller, _Authinfo_) {
    Userservice = _Userservice_;

    Authinfo = _Authinfo_;
    $templateCache = _$templateCache_;
    $compile = _$compile_;
    httpBackend = $httpBackend;
    $scope = $rootScope.$new();
    controller = $controller;
    stubAllHttpGetRequests();

    controller('SupportCtrl', {
      $scope: $scope,
      Authinfo: Authinfo,
      Userservice: Userservice
    });
  }));

  describe('Tools card view', function () {
    var view;
    beforeEach(inject(function (_$templateCache_) {
      var html = _$templateCache_.get("modules/squared/support/support-status.html");
      view = $compile(angular.element(html))($scope);
    }));

    fit('shows tools card if user has helpdesk role', function () {
      Authinfo.isHelpDeskUser = sinon.stub().returns(true);
      $scope.$digest();
      var hasToolsCard = _.contains(view.html(), "supportPageToolsCard");
      expect(hasToolsCard).toBeTruthy();
    });

    fit('shows tools card if user has cisco dev role', function () {
      sinon.stub(Authinfo, 'isCisco').returns(true);
      sinon.stub(Userservice, 'getUser').yields({
        success: true,
        roles: ['ciscouc.devops', 'ciscouc.devsupport']
      });
      sinon.stub(Authinfo, 'isHelpDeskUser').returns(false);

      controller('SupportCtrl', {
        $scope: $scope,
        Authinfo: Authinfo,
        Userservice: Userservice
      });

      $scope.$digest();
      var hasToolsCard = _.contains(view.html(), "supportPageToolsCard");
      expect(hasToolsCard).toBeTruthy();
    });

    fit('does NOT show tools card if user doesnt have dev roles nor helpdesk role', function () {
      sinon.stub(Userservice, 'getUser').yields({
        success: true,
        roles: ['noDevRole']
      });
      Authinfo.isHelpDeskUser = sinon.stub().returns(false);
      $scope.$digest();
      var hasToolsCard = _.contains(view.html(), "supportPageToolsCard");
      expect(hasToolsCard).toBeFalsy();
    });

    fit('has clickable helpdesk button if user has helpdesk role', function () {
      Authinfo.isHelpDeskUser = sinon.stub().returns(true);
      $scope.gotoHelpdesk = sinon.spy($scope, 'gotoHelpdesk');
      $scope.$digest();
      view.find("#toolsCardHelpdeskButton").click();
      expect($scope.gotoHelpdesk.callCount).toBe(1);
    });

    fit('has NO helpdesk button to click if user hasnt helpdesk role', function () {
      Authinfo.isHelpDeskUser = sinon.stub().returns(false);
      $scope.gotoHelpdesk = sinon.spy($scope, 'gotoHelpdesk');
      $scope.$digest();
      view.find("toolsCardHelpdeskButton").click();
      expect($scope.gotoHelpdesk.callCount).toBe(0);
    });

    fit('has clickable call flow button if user has cisco dev role', function () {
      Authinfo.isCisco = sinon.stub().returns(true);
      Authinfo.isHelpDeskUser = sinon.stub().returns(false);
      Userservice.getUser = sinon.stub().yields({
        success: true,
        roles: ['ciscouc.devops', 'ciscouc.devsupport']
      });

      controller('SupportCtrl', {
        $scope: $scope,
        Authinfo: Authinfo,
        Userservice: Userservice
      });

      $scope.gotoCdrSupport = sinon.spy($scope, 'gotoCdrSupport');
      $scope.$digest();
      view.find("#toolsCardCdrCallFlowButton").click();
      expect($scope.gotoCdrSupport.callCount).toBe(1);
    });

    fit('has no call flow button to click if user hasnt cisco dev role', function () {
      Authinfo.isCisco = sinon.stub().returns(true);
      Authinfo.isHelpDeskUser = sinon.stub().returns(false);
      Userservice.getUser = sinon.stub().yields({
        success: true,
        roles: ['noDevopRole']
      });

      controller('SupportCtrl', {
        $scope: $scope,
        Authinfo: Authinfo,
        Userservice: Userservice
      });

      $scope.gotoCdrSupport = sinon.spy($scope, 'gotoCdrSupport');
      $scope.$digest();
      view.find("toolsCardCdrCallFlowButton").click();
      expect($scope.gotoCdrSupport.callCount).toBe(0);
    });
  });

});
