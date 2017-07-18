import './_timeline.scss';
import * as d3 from 'd3';
import * as moment from 'moment';

class TimeLine implements ng.IComponentController {

  private svg;
  private option;
  private time2line;
  private coordinate;
  private data: any = {};
  private colorArr: String[];
  private sourceData: any;

  /* @ngInject */
  public constructor(
    private $element: ng.IRootElementService,
  ) {
    this.option = {
      width: 960,
      height: 340,
      paddingRight: 25,
      paddingLeft: 92.5,
      paddingButtom: 40.5,
    };
    this.data = {
      xStep: 0,
      yStep: 0,
      ticks: 0,
      domain: [],
      endTime: 0,
      startTime: 0,
      joinsLine: {},
      xAxisFormat: '%I:%M %p',
      gridVerticalLineNum: 24,
      gridHorizontalLineNum: 12,
    };
  }

  public $onInit() {
    this.initParameters();

    this.axis();
    this.drawGridVerticalLine();
    this.drawGridHorizontalLine();

    this.drawLine();
    this.showUser();
    this.showTips();
  }

  private initParameters() {
    this.colorArr = ['#43A942', '#E9691E', '#049FD9', '#AEAEAF'];
    this.option.width = this.$element.find('#svg').width();
    this.data.endTime = this.sourceData.overview.endTime;
    this.data.startTime = this.sourceData.overview.startTime;

    this.data.gridHorizontalLineNum = this.sourceData.lines.length + 2 > 12 ? this.sourceData.lines.length + 2 : 12;
    if (this.data.gridHorizontalLineNum > 12) {
      this.option.height = (this.data.gridHorizontalLineNum * 21) + this.option.paddingButtom;
    }

    this.coordinate = {
      x: this.option.paddingLeft,
      y: this.option.height - this.option.paddingButtom,
      endX: this.option.width - this.option.paddingRight,
    };

    this.data.yStep = this.coordinate.y / this.data.gridHorizontalLineNum;
    this.data.xStep = (this.coordinate.endX - this.coordinate.x) / this.data.gridVerticalLineNum;

    this.setDomain();
    this.svg = d3.select('#svg')
      .append('svg:svg')
      .attr('width', this.option.width)
      .attr('height', this.option.height);
  }

  private setDomain() {
    const duration = this.data.endTime - this.data.startTime;
    const ruler: number = this.setRuler(duration / 1000) * 1000;
    const tickNum = _.ceil(duration / ruler);

    this.data.ruler = ruler;
    this.data.ticks = this.setTicks(tickNum);

    const startTime = _.floor(this.data.startTime / ruler) * ruler;
    const endTime = startTime + (ruler * this.data.ticks);
    this.data.domain = [this.timestampToDate(startTime), this.timestampToDate(endTime)];
  }

  private drawGridHorizontalLine() {
    const x = this.coordinate.x;
    let y = this.coordinate.y + this.data.yStep;

    for (let i = 0; i < this.data.gridHorizontalLineNum + 1; i++) {
      y  -= this.data.yStep;
      this.svg.append('svg:line')
        .attr('class', 'gridLine')
        .attr('x1', x)
        .attr('y1', y)
        .attr('x2', this.coordinate.endX)
        .attr('y2', y);
    }
  }

  private drawGridVerticalLine() {
    const y = this.coordinate.y;
    let x = this.coordinate.x - this.data.xStep;
    for (let i = 0; i < this.data.gridVerticalLineNum + 1; i++) {
      x += this.data.xStep;
      this.svg.append('svg:line')
        .attr('class', 'gridLine')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y);
    }
  }

  private axis() {
    const timeRange = d3.time.scale()
      .domain(this.data.domain)
      .range([0, this.coordinate.endX - this.coordinate.x]);
    this.time2line = timeRange;

    const xAxis = d3.svg.axis()
      .scale(timeRange)
      .orient('bottom')
      .ticks(this.data.ticks)
      .tickSize(3, 0)
      .tickFormat(d3.time.format(this.data.xAxisFormat));

    this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${this.coordinate.x}, ${this.coordinate.y})`)
      .call(xAxis);
  }

  private drawLine() {
    let y = 0;
    const x = this.coordinate.x;
    const data = _.map(this.sourceData.lines, (item: any) => {
      const leaveTime = item.leaveTime || this.sourceData.overview.endTime;
      const joinTime = item.joinTime;
      const end = this.time2line(this.timestampToDate(leaveTime));
      const end_ = this.coordinate.endX - this.coordinate.x;

      return {
        text: item.jmtQuality,
        userName_ : item.userName,
        userName: _.truncate(item.userName, { length: 15 }),
        end: end > end_ ? end_ : end,
        start: this.time2line(this.timestampToDate(joinTime)),
        lineColor: item.dataQuality ? this.colorArr[item.dataQuality - 1] : this.colorArr[3],
        circleColor: item.jmtQuality ? this.colorArr[item.jmtQuality - 1] : this.colorArr[3],
      };
    });

    this.data.joinsLine = data;
    _.forEach(data, (item) => {
      y += this.data.yStep;

      this.svg.append('svg:line')
        .attr('x1', x + item.start)
        .attr('y1', y)
        .attr('x2', x + item.end)
        .attr('y2', y)
        .style('stroke', item.lineColor)
        .style('stroke-width', 1);
    });

    this.drawBadges();
  }

  private drawBadges() {
    let x, y;
    y = 0;
    const badges = this.svg.append('g');
    _.forEach(this.data.joinsLine, (item: any) => {
      x = this.coordinate.x + item.start;
      y += this.coordinate.y / this.data.gridHorizontalLineNum;
      badges.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 5)
        .style('fill', item.circleColor);
    });
  }

  private showUser() {
    const x = 0;
    let y = 0;
    const g = this.svg.append('g');
    _.forEach(this.data.joinsLine, (item: any) => {
      y += this.data.yStep;
      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('class', 'showUser')
        .attr('transform', `translate(${this.coordinate.x - 10} , 0)`)
        .text(item.userName);
    });
  }

  private showTips() {
    let xStart = 0;
    const x = this.coordinate.x;
    const y = this.coordinate.y + 1;
    const colorG = this.svg.append('g').attr('class', 'showCircleTips');
    const tips = [
      { text: 'Good', color: this.colorArr[0] },
      { text: 'Fair', color: this.colorArr[1] },
      { text: 'Poor', color: this.colorArr[2] },
      { text: 'N/A', color: this.colorArr[3] },
    ];
    colorG.append('text')
      .attr('class', 'circleTips')
      .attr('x', x)
      .attr('y', y)
      .attr('transform', `translate(${xStart} , 32)`)
      .text('Join Meeting Time: ');
    xStart += 50;

    _.forEach(tips, function (val) {
      xStart += 70;
      colorG.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 5)
        .attr('transform', `translate(${xStart} , 28)`)
        .style('fill', val.color);

      colorG.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('font-size', '12px')
        .attr('fill', val.color)
        .attr('transform', `translate(${xStart + 10} , 32)`)
        .text(val.text);
    });
    this.lineMsgTips();
  }

  private lineMsgTips() {
    const colorG = this.svg.append('g').attr('class', 'lineMsgTips');
    const x = this.coordinate.x;
    const y = this.coordinate.y + 1;
    const tips = [
      { text: 'Good', color: this.colorArr[0] },
      { text: 'Bad', color: this.colorArr[1] },
      { text: 'N/A', color: this.colorArr[3] },
    ];

    let xStart = 400;
    const lineData = [
      { x: x, y: y + 5 },
      { x: x + 30, y: y + 5 },
    ];
    const lineFunction = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .interpolate('linear');

    colorG.append('text')
      .attr('class', 'msgTips')
      .attr('x', x)
      .attr('y', y)
      .attr('transform', `translate(${xStart} , 32)`)
      .text('Meeting Quality: ');
    xStart += 30;
    _.forEach(tips, (val) => {
      xStart += 80;
      colorG.append('path')
        .attr('d', lineFunction(lineData))
        .attr('stroke', val.color)
        .attr('stroke-width', 1)
        .attr('fill', val.color)
        .attr('transform', `translate(${xStart} , 25)`);

      colorG.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('font-size', '12px')
        .attr('fill', val.color)
        .attr('transform', `translate(${xStart + 35} , 32)`)
        .text(val.text);
    });
  }

  private setRuler(time): number {
    const rulerArr = [
      [1800, 0, 300],
      [10800, 1800, 900],
      [21600, 10800, 1800],
      [43200, 21600, 3600],
      [86400, 43200, 7200],
    ];
    let ruler = 300;
    _.forEach(rulerArr, (item) => {
      if (time <= item[0] && time > item[1]) {
        ruler = item[2];
        return false;
      }
    });
    return ruler;
  }

  private timestampToDate(timestamp) {
    const dateStr = moment(timestamp).utc().format('YYYY-MM-DD HH:mm:ss');
    return moment(dateStr).toDate();
  }

  private setTicks(tick: number) {
    let tickNum = 4;
    if (tick > 4 ) {
      tickNum = tick > 6 ? 12 : 6;
    }
    return tickNum;
  }
}

export class CustTimeLineComponent implements ng.IComponentOptions {
  public controller = TimeLine;
  public bindings = { sourceData: '<' };
  public template = '<div id="svg"></div>';
}
