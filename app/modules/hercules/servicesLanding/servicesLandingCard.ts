namespace servicesLanding {

  /* export interface filter {
   label:String;
   columns:Array<filterColumn>;
   columnDefs?:Array<any>;
   }

   export interface filterColumn {
   label:String;
   valueFunction(row):Number;
   }*/

  export interface CardButton {
    name:String;
    buttonClass?:String;
    link:String;
  }
  export enum CardType{
    cloud,
    hybrid
  }

  export abstract class ServicesLandingCard {

    protected _status;

    get active() {
      return this._active;
    }

    get cardClass() {
      return this._cardClass;
    }

    get cardType() {
      return this._cardType;
    }

    get description() {
      return this._description;
    }

    get icon() {
      return this._icon;
    }

    get name() {
      return this._name;
    }

    get status() {
      return this._status;
    }

    get template() {
      return this._template;
    }

    abstract getButtons():Array<CardButton>;

    abstract getShowMoreButton():CardButton;

    serviceStatusToCss = {
      ok: 'success',
      warn: 'warning',
      error: 'danger',
      disabled: 'disabled',
      undefined: 'warning'
    };

    serviceStatusWeight = {
      ok: 1,
      warn: 2,
      error: 3,
      undefined: 0
    };

    public constructor(private _template:String, private _name:String, private _description, private _icon:String, private _active:boolean = true, private _cardClass:String = 'cs-card', private _cardType:CardType = CardType.cloud) {

    }

    public filterAndGetCssStatus(services:Array<{id:string,status:string}>, serviceIds:Array<String>) {
      // _.reduce(callServices, function (result, serv) {
      //   return this.serviceStatusWeight[serv.status] > this.serviceStatusWeight[result] ? serv.status : result;
      let callServiceStatus:{status:String} = _.chain(services)
        .filter((service)=> {
          let found = _.indexOf(serviceIds, service.id)>=0;
          console.log("service",service, found);
          return found;
        })
        .reduce((result, serv)=> {
          console.log("service red",result, serv);
          return this.serviceStatusWeight[serv.status] > this.serviceStatusWeight[result] ? serv.status : result
        })
        .value();
      console.log("status ", callServiceStatus);
      if (callServiceStatus) {
        return this.serviceStatusToCss[callServiceStatus] || this.serviceStatusToCss['undefined'];
      }
      return undefined;
    }
  }

}
