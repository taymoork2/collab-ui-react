import './_timeline.scss';
import * as d3 from 'd3';

class TimeLine implements ng.IComponentController {

  private svg;
  private option;
  private time2line;
  private coordinate;
  private data: any = {};
  private sourceData: any;

  /* @ngInject */
  public constructor(
    private $element: ng.IRootElementService,
  ) {
    this.option = {
      width: 960,
      height: 340,
      paddingRight: 25,
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
    this.option.width = this.$element.find('#svg').width();
    this.data.endTime = moment(this.sourceData.overview.endTime).unix();
    this.data.startTime = moment(this.sourceData.overview.startTime).unix();
    this.coordinate = { x: 22.25, y: this.option.height - 40.25, endX: this.option.width - this.option.paddingRight };

    this.svg = d3.select('#svg')
      .append('svg:svg')
      .attr('width', this.option.width)
      .attr('height', this.option.height);

    this.setDomain();
    this.setGridHorizontalLineNum();

    this.drawGridVerticalLine();
    this.drawGridHorizontalLine();

    this.axis();
    this.drawLine();
    this.colorSign();
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

  private setDomain() {
    const duration = this.data.endTime - this.data.startTime;
    const ruler: number = this.setRuler(duration);
    const ticks = _.ceil(duration / ruler);

    this.data.ruler = ruler;
    this.data.ticks = ticks > 6 ? 12 : 6; // six at least
    const startDate = _.floor(this.data.startTime / ruler) * ruler;
    const startDomain = moment.unix(startDate).format('YYYY-MM-DD HH:mm:ss');
    const endDomain =  moment.unix(startDate + (ruler * this.data.ticks) ).format('YYYY-MM-DD HH:mm:ss');

    this.data.domain = [moment(startDomain).toDate(), moment(endDomain).toDate()];
  }

  private setRuler(time): number {
    const rulerArr = [
      [86400, 43200, 7200],
      [43200, 21600, 3600],
      [21600, 10800, 1800],
      [10800, 1800, 900],
      [1800, 0, 300],
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

  private setGridHorizontalLineNum() {
    this.data.gridHorizontalLineNum = this.sourceData.participants.length + 2 > 12 ? this.sourceData.participants.length + 2 : 12;
  }

  private drawLine() {
    let y = 0;
    const x = this.coordinate.x;
    const colorArr = ['#43A942', '#E9691E', '#049FD9'];
    let i = 0;
    const data = _.map(this.sourceData.participants, (item: any) => {
      i++;
      const leaveTime = item.leaveTime || this.sourceData.overview.endTime;
      return { joinTime: this.time2line(moment(item.joinTime).toDate()), leaveTime: this.time2line(moment(leaveTime).toDate()), quality: i, color: colorArr[i % 3] };
    });
    this.data.joinsLine = data;
    _.forEach(data, (item) => {
      y += this.data.yStep;

      this.svg.append('svg:line')
        .attr('x1', x + item.joinTime)
        .attr('y1', y)
        .attr('x2', x + item.leaveTime)
        .attr('y2', y)
        .style('stroke', item.color)
        .style('stroke-width', 1);
    });

    // this.drawStartAndEndLine(); // TODO Need to check the requirement -- by zoncao@cisco.com
    this.drawBadges();
  }

  // TODO Need to check the requirement -- by zoncao@cisco.com
  // private drawStartAndEndLine() {
  //   const x = this.coordinate.x;
  //   const endTime = this.time2line(moment(this.sourceData.overview.endTime).toDate());
  //   const startTime = this.time2line(moment(this.sourceData.overview.startTime).toDate());
  //   const time = [startTime, endTime];
  //   this.$log.info(time);
  //   _.forEach(time, (val) => {
  //     this.svg.append('svg:line')
  //       .attr('x1', x + val)
  //       .attr('y1', 0)
  //       .attr('x2', x + val)
  //       .attr('y2', this.coordinate.y)
  //       .style('stroke', '#AEAEAF')
  //       .style('stroke-width', 0.5);
  //   });
  // }

  private drawBadges() {
    const badges = this.svg.append('g');
    let x, y;
    y = 0;
    _.forEach(this.data.joinsLine, (item: any) => {
      x = this.coordinate.x + item.joinTime;
      y += this.coordinate.y / this.data.gridHorizontalLineNum;
      badges.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 10)
        .style('fill', item.color);
      badges.append('text')
        .attr('x', x - 4)
        .attr('y', y + 4)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text(item.quality);
    });
  }

  private drawGridHorizontalLine() {
    const x = this.coordinate.x;
    this.data.yStep = this.coordinate.y / this.data.gridHorizontalLineNum;
    let y = this.coordinate.y + this.data.yStep;

    for (let i = 0; i < this.data.gridHorizontalLineNum + 1; i++) {
      y  -= this.data.yStep;
      this.svg.append('svg:line')
        .attr('x1', x)
        .attr('y1', y)
        .attr('x2', this.coordinate.endX)
        .attr('y2', y)
        .style('stroke', '#D7D7D8')
        .style('stroke-width', 0.5);
    }
  }

  private drawGridVerticalLine() {
    const y = this.coordinate.y;
    this.data.xStep = (this.coordinate.endX - this.coordinate.x) / this.data.gridVerticalLineNum;
    let x = this.coordinate.x - this.data.xStep;
    for (let i = 0; i < this.data.gridVerticalLineNum + 1; i++) {
      x += this.data.xStep;
      this.svg.append('svg:line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .style('stroke', '#D7D7D8')
        .style('stroke-width', 0.5);
    }
  }

  private colorSign() {
    const x = this.coordinate.x;
    const y = this.coordinate.y + 1;
    const colorG = this.svg.append('g');
    const colorArr = ['#43A942', '#E9691E', '#049FD9'];
    const colorText = ['Good', 'Fail', 'Poor'];
    const xStart = this.option.width / colorArr.length;
    const lineData = [
      { x: x, y: y },
      { x: x + 30, y: y },
      { x: x + 30, y: y + 6 },
      { x: x, y: y + 6 },
      { x: x, y: y },
    ];
    const lineFunction = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .interpolate('linear');

    _.forEach(colorArr, (val, key) => {
      const xStep = xStart + key * 150;
      colorG.append('path')
        .attr('d', lineFunction(lineData))
        .attr('stroke', val)
        .attr('stroke-width', 0.5)
        .attr('fill', val)
        .attr('transform', `translate(${xStep} , 25)`);

      colorG.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '12px')
        .attr('fill', val)
        .attr('transform', `translate(${xStep + 35} , 32)`)
        .text(colorText[key]);
    });
  }
}

export class CustTimeLineComponent implements ng.IComponentOptions {
  public controller = TimeLine;
  public bindings = { sourceData: '<' };
  public template = '<div id="svg"></div>';
}
