var TodoList = React.createClass({
    togglegoing: function(event) {
        var barId = event.target.value;
        var url = '';
        if (event.target.getAttribute('data-isgoing') === "1") {
            url = '/api/ungoing/' + barId;
        }
        else {
            url = '/api/dogoing/' + barId;
        }

        var location = this.props.location;
        var myself = this;
        $.get(url, function(response) {
            if (response.status !== "1") {
                console.log(myself.props.location);
                localStorage.setItem('location', myself.props.location);
                window.location.replace("/login");
            }
            else {
                // trigger request again
                myself.props.onUpdate();
            }
        });
    },
    render: function() {
        var myself = this;
        var createItem = function(item) {
            return (<div key={item.id} className="col-md-3 bar-wrap">
            <div className="bar">
              <p>{item.name}</p>
              <img src={item.imgurl}></img>
              {(item.status)? 
              (<button value={item.id} data-isgoing="1" type="button" className="btn btn-primary" onClick={myself.togglegoing}>{item.total} Going</button>):
              (<button value={item.id} data-isgoing="0" type="button" className="btn btn-default" onClick={myself.togglegoing}>{item.total} Going</button>)}
            </div>
            </div>);
        };
        return (<div className="row">{this.props.items.map(createItem)}</div>);
    }
});
var TodoApp = React.createClass({
    getInitialState: function() {
        return {
            items: [],
            text: ''
        };
    },
    onChange: function(e) {
        this.setState({
            text: e.target.value
        });
    },
    componentDidMount: function() {
        var location = localStorage.getItem('location');
        if(location === null) {
            return;
        }
        this.setState({text: location})
        this.doSearch(location);
    },
    handleSubmit: function(e) {
        if (e) {
            e.preventDefault();
        }
        this.doSearch(this.state.text);
    },
    doSearch: function(keyword) {
        var url = '/api/search/' + keyword;
        this.serverRequest = $.get(url, function(items) {
            console.log(items);
            this.setState({
                items: items
            });
        }.bind(this));
    },
    render: function() {
        return (
            <div>
      <div className="jumbotron">
        <h1>NightLife</h1>
        <p>You can signup to JOIN bar(Not valid in china, using YELP API)</p>
        <h3>Search for nightlife bars(e.g. boston)</h3>
        <form onSubmit={this.handleSubmit} className="form-inline">
          <input className="form-control"onChange={this.onChange} value={this.state.text} />
          <button className="btn btn-default">Search</button>
        </form>
      </div>
      <TodoList items={this.state.items} location={this.state.text} onUpdate={this.handleSubmit}/>
      </div>
        );
    }
});

var mountNode = document.getElementById('todo');
ReactDOM.render(<TodoApp />, mountNode);