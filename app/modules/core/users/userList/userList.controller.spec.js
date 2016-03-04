'use strict';

describe('UserListCtrl: Ctrl', function () {
  var controller, $scope, $rootScope, $state, $timeout, Userservice, UserListService, Orgservice, Authinfo, Config, $httpBackend;
  var photoUsers, currentUser;
  photoUsers = getJSONFixture('core/json/users/userlist.controller.json');
  currentUser = getJSONFixture('core/json/currentUser.json');
  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$state_, $controller, _$timeout_, _Userservice_, _UserListService_, _Orgservice_, _Authinfo_, _Config_, _$httpBackend_) {
    $scope = $rootScope.$new();
    $timeout = _$timeout_;
    $state = _$state_;
    UserListService = _UserListService_;
    Userservice = _Userservice_;
    Orgservice = _Orgservice_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    $httpBackend = _$httpBackend_;

    $rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2
    };

    $httpBackend.whenGET(/v1\/Users\?/).respond({});
    $httpBackend.whenGET(/users\/partneradmins$/).respond({
      partners: []
    });
    $httpBackend.whenGET(/v1\/Orgs\//).respond({});

    controller = $controller('UserListCtrl', {
      $scope: $scope,
      $state: $state,
      Userservice: Userservice,
      UserListService: UserListService,
      Authinfo: Authinfo,
      Config: Config
    });

    $httpBackend.flush();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getUserPhoto', function () {
    it('should return photo thumbnail value', function () {
      expect($scope.getUserPhoto(photoUsers.photoUser)).toEqual(photoUsers.photoUser.photos[1].value);
    });
    it('should return null if no photo list', function () {
      expect($scope.getUserPhoto(currentUser)).toBeNull();
    });
  });

  describe('isValidThumbnail', function () {
    it('should verify valid photo thumbnail', function () {
      expect($scope.isValidThumbnail(photoUsers.photoUser)).toBe(true);
    });
    it('should verify no filename in thumbnail value', function () {
      expect($scope.isValidThumbnail(photoUsers.fileThumb)).toBe(false);
    });
    it('should verify no thumbnail field', function () {
      expect($scope.isValidThumbnail(currentUser)).toBe(false);
    });
    it('should verify blank thumbnail field', function () {
      expect($scope.isValidThumbnail(photoUsers.emptyThumb)).toBe(false);
    });

  });
});
