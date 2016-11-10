export interface ICardButton {
  name: string;
  buttonClass?: string;
  routerState?: string;
}

export interface ICardStatus {
  status: string | undefined;
  text: string | undefined;
  routerState: string;
}

export enum CardType {
  cloud,
  hybrid
}

export interface ICardParams {
  active?: boolean;
  display?: boolean;
  cardClass?: string;
  cardType?: CardType;
  description: string;
  icon?: string;
  name: string;
  template?: string;
}

export abstract class ServicesOverviewCard {

  private cardClass: string;
  private cardType: CardType;
  private description: string;
  private icon: string;
  private template: string;
  public active: boolean;
  public display: boolean;
  public loading = true;
  public name: string;
  public status: ICardStatus;

  public showStatus() {
    return !this.loading && this.active && (this.status && this.status.status);
  }

  public abstract getButtons(): Array<ICardButton>;

  public abstract getShowMoreButton(): ICardButton | undefined;

  public constructor({
    active = true,
    cardClass = 'cs-card',
    cardType = CardType.cloud,
    description,
    display = true,
    icon = '',
    name,
    template = 'modules/services/card.tpl.html',
  }: ICardParams) {
    this.active = active;
    this.cardClass = cardClass;
    this.cardType = cardType;
    this.description = description;
    this.display = display;
    this.icon = icon;
    this.name = name;
    this.template = template;
  }
}
