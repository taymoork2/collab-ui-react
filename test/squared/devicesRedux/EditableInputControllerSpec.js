'use strict';

describe('EditableInputController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, service, auth, descriptor;

  beforeEach(inject(function (_$controller_) {
    $scope = {
      save: sinon.stub(),
      value: ''
    };
    _$controller_('EditableInputController', {
      $scope: $scope
    });
  }));

  it('defaults some scope vars', function () {
    expect($scope.editorEnabled).toBeFalsy();
    expect($scope.saveInProgress).toBeFalsy();
  });

  it('enables edit mode', function () {
    $scope.enableEditor();

    expect($scope.editorEnabled).toBeTruthy();
  });

  it('cancels edit mode and resets the value on click', function () {
    $scope.value = 'foo';
    $scope.enableEditor();

    $scope.value = 'bar';
    $scope.cancelClicked();

    expect($scope.value).toBe('foo');
    expect($scope.editorEnabled).toBeFalsy();
  });

  it('cancels edit mode and resets the value on click', function () {
    $scope.value = 'foo';
    $scope.enableEditor();

    $scope.value = 'bar';
    $scope.keyPressed({
      keyCode: 27
    });

    expect($scope.value).toBe('foo');
    expect($scope.editorEnabled).toBeFalsy();
  });

  it('should save when save is pressed and save works', function () {
    $scope.value = 'foo';
    $scope.enableEditor();

    $scope.value = 'bar';
    $scope.saveClicked();

    expect($scope.saveInProgress).toBeTruthy();
    expect($scope.save.callCount).toBe(1);

    $scope.save.callArgWith(0);

    expect($scope.editorEnabled).toBeFalsy();
    expect($scope.saveInProgress).toBeFalsy();
  });

  it('should save when save is pressed and save fails', function () {
    $scope.value = 'foo';
    $scope.enableEditor();

    $scope.value = 'bar';
    $scope.saveClicked();

    expect($scope.saveInProgress).toBeTruthy();
    expect($scope.save.callCount).toBe(1);

    $scope.save.callArgWith(1);

    expect($scope.editorEnabled).toBeTruthy();
    expect($scope.saveInProgress).toBeFalsy();
  });

});
