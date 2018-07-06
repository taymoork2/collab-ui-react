export class QosNodesController {

  public nodesArrayQos: any[] = [];
  /* @ngInject */
  constructor(
    public enableQos: boolean,
    public nodesArrayQosEnabled: any[] = [],
    public nodesArrayQosDisabled: any[] = [],
  ) { this.$onInit();
  }

  public $onInit(): void {
    //if enableQos is true then Qos for that Org is Enabled,Hence we show Nodes whose Qos is still Disabled
    //if enableQos is false then Qos for that Org is Disabled,Hence we show Nodes whose Qos is still Enabled
    if (this.enableQos) {
      this.nodesArrayQos = this.nodesArrayQosDisabled;
    } else {
      this.nodesArrayQos = this.nodesArrayQosEnabled;
    }
  }
}
