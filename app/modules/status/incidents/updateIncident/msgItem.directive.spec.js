/**
 * Created by pso on 16-8-25.
 */
'use strict';

describe('UI: msgItemDirective',function(){
  var $compile,$rootScope,$q;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));
  function dependencies(_$compile_,_$rootScope_,_$q_){
    $compile=_$compile_;
    $rootScope=_$rootScope_;
    $q=_$q_;


  }
  it('should replace the element',function(){
    var element = $compile("<msg-item info='msg'></msg-item>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("itemRow2");
  })
});
