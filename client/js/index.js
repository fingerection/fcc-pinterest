$(function () {
  var Markit = {};

  Markit.InteractiveChartApi = function (symbolArray, duration) {
    this.symbolArray = symbolArray; //.toUpperCase();
    this.duration = duration;
    this.PlotChart();
  };

  Markit.InteractiveChartApi.prototype.PlotChart = function () {

    var params = {
      parameters: JSON.stringify(this.getInputParams())
    };

    //Make JSON request for timeseries data
    $.ajax({
      beforeSend: function () {
        $("#updateStatus").text("Loading chart...");
      },
      data: params,
      url: "//dev.markitondemand.com/Api/v2/InteractiveChart/jsonp",
      dataType: "jsonp",
      context: this,
      success: function (json) {
        //Catch errors
        if (!json || json.Message) {
          console.error("Error: ", json.Message);
          return;
        }
        this.render(json);
        $("#updateStatus").text("");
      },
      error: function (response, txtStatus) {
        console.log(response, txtStatus);
        $("#updateStatus").text("Error, please remove error symbol");
      }
    });
  };

  Markit.InteractiveChartApi.prototype.getInputParams = function () {
    var elementArray = [];
    for (var i = 0; i < this.symbolArray.length; i++) {
      var symbol = this.symbolArray[i];
      elementArray.push({
        Symbol: symbol,
        Type: "price",
        Params: ["c"]
      });
    }
    return {
      Normalized: false,
      NumberOfDays: this.duration,
      DataPeriod: "Day",
      Elements: elementArray
      //,LabelPeriod: 'Week',
      //LabelInterval: 1
    };
  };

  Markit.InteractiveChartApi.prototype._fixDate = function (dateIn) {
    var dat = new Date(dateIn);
    return Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
  };

  Markit.InteractiveChartApi.prototype._getPrices = function (json) {
    var dates = json.Dates || [];
    var elements = json.Elements || [];
    var chartSeries = [];

    for (var j = 0; j < elements.length; j++) {
      var cs = [];
      for (var i = 0, datLen = dates.length; i < datLen; i++) {
        var dat = this._fixDate(dates[i]);
        var pointData = [dat, elements[j].DataSeries['close'].values[i]];
        cs.push(pointData);
      }
      chartSeries.push(cs);
    }

    return chartSeries;
  };

  Markit.InteractiveChartApi.prototype.render = function (data) {
    //console.log(data)
    // split the data set into ohlc and volume
    var prices = this._getPrices(data);

    // set the allowed units for data grouping
    var groupingUnits = [['week', // unit name
    [1] // allowed multiples
    ], ['month', [1, 2, 3, 4, 6]]];

    var series = [];
    for (var i = 0; i < prices.length; i++) {
      var price = prices[i];
      var seriesItem = {
        name: this.symbolArray[i],
        data: price,
        dataGrouping: {
          units: groupingUnits
        }
      };
      series.push(seriesItem);
    }

    // create the chart
    $('#chartDemoContainer').highcharts('StockChart', {

      rangeSelector: {
        selected: 1
        //enabled: false
      },

      title: {
        text: 'Historical Price'
      },

      yAxis: [{
        title: {
          text: 'Price'
        },
        height: 300,
        lineWidth: 2
      }],

      series: series,
      credits: {
        enabled: false
      }
    });
  };
  //   $(document).ready(function(){
  //     var sym = ['GOOG','MSFT'];
  //     var dur = 3650;

  //     new Markit.InteractiveChartApi(sym, dur);
  //   });

  var App = React.createClass({
    getInitialState: function () {
      var state = { items: [], text: "" };
      return state;
    },
    componentDidMount: function () {
      this.refresh();
      this.initialSocketio();
    },
    initialSocketio: function () {
      var myself = this;
      this.socket = io.connect();

      this.socket.on('connect', function () {});

      this.socket.on('message', function (msg) {
        console.log(msg.symbols);
        myself.setState({ items: msg.symbols });
        myself.refresh();
      });
    },
    sendMessage: function (data) {
      console.log('Sending message:', data);
      this.socket.emit('message', data);
    },
    refresh: function () {
      var sym = this.state.items;
      var dur = 3650;
      new Markit.InteractiveChartApi(sym, dur);
    },
    addNew: function () {
      this.sendMessage(this.state.items.concat([this.state.text]));
      //  this.state.items = this.state.items.concat([this.state.text]);
      //  console.log(this.state.items);
      //   this.refresh();
      //   this.setState({items: this.state.items, text: ""});
    },
    delete: function (event) {
      var symbol = event.target.value;
      var index = this.state.items.indexOf(symbol);
      if (index > -1) {
        this.state.items.splice(index, 1);
      }
      this.sendMessage(this.state.items);
      //   this.setState({items: this.state.items});
      //   this.refresh();
    },
    onChange: function (event) {
      this.setState({ text: event.target.value });
    },
    render: function () {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "form",
            { className: "navbar-form navbar-left", role: "search" },
            React.createElement(
              "div",
              { className: "form-group" },
              React.createElement("input", { type: "text", className: "form-control", placeholder: "股票代码", onChange: this.onChange, value: this.state.text })
            ),
            React.createElement(
              "button",
              { type: "button", className: "btn btn-default", onClick: this.addNew },
              "添加"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "row" },
          this.state.items.map(item => React.createElement(
            "h1",
            null,
            React.createElement(
              "span",
              { className: "tag label label-info" },
              React.createElement(
                "span",
                null,
                item
              ),
              React.createElement(
                "a",
                null,
                React.createElement("i", { className: "remove glyphicon glyphicon-remove-sign glyphicon-white", onClick: this.delete, value: item })
              )
            )
          ))
        )
      );
    } });

  var mountNode = document.getElementById('controller');
  ReactDOM.render(React.createElement(App, null), mountNode);
});

