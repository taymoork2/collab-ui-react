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

    get template() {
      return this._template;
    }

    get name() {
      return this._name;
    }

    get description() {
      return this._description;
    }

    get cardClass() {
      return this._cardClass;
    }

    get cardType() {
      return this._cardType;
    }

    get icon() {
      return this._icon;
    }

    get active() {
      return this._active;
    }

    abstract getButtons():Array<CardButton>;

    abstract getShowMoreButton():CardButton;

    public constructor(private _template:String, private _name:String, private _description, private _icon:String, private _active:boolean = true, private _cardClass:String = 'cs-card', private _cardType:CardType = CardType.cloud) {

    }
  }

}
