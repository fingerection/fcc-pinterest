var TodoList = React.createClass({
    togglegoing: function (event) {
        var barId = event.target.value;
        var url = '';
        if (event.target.getAttribute('data-isgoing') === "1") {
            url = '/api/ungoing/' + barId;
        } else {
            url = '/api/dogoing/' + barId;
        }

        var location = this.props.location;
        var myself = this;
        $.get(url, function (response) {
            if (response.status !== "1") {
                console.log(myself.props.location);
                localStorage.setItem('location', myself.props.location);
                window.location.replace("/login");
            } else {
                // trigger request again
                myself.props.onUpdate();
            }
        });
    },
    render: function () {
        var myself = this;
        var createItem = function (item) {
            return React.createElement(
                'div',
                { key: item.id, className: 'col-md-3 bar-wrap' },
                React.createElement(
                    'div',
                    { className: 'bar' },
                    React.createElement(
                        'p',
                        null,
                        item.name
                    ),
                    React.createElement('img', { src: item.imgurl }),
                    item.status ? React.createElement(
                        'button',
                        { value: item.id, 'data-isgoing': '1', type: 'button', className: 'btn btn-primary', onClick: myself.togglegoing },
                        item.total,
                        ' Going'
                    ) : React.createElement(
                        'button',
                        { value: item.id, 'data-isgoing': '0', type: 'button', className: 'btn btn-default', onClick: myself.togglegoing },
                        item.total,
                        ' Going'
                    )
                )
            );
        };
        return React.createElement(
            'div',
            { className: 'row' },
            this.props.items.map(createItem)
        );
    }
});
var TodoApp = React.createClass({
    getInitialState: function () {
        return {
            items: [],
            text: ''
        };
    },
    onChange: function (e) {
        this.setState({
            text: e.target.value
        });
    },
    componentDidMount: function () {
        var location = localStorage.getItem('location');
        if (location === null) {
            return;
        }
        this.setState({ text: location });
        this.doSearch(location);
    },
    handleSubmit: function (e) {
        if (e) {
            e.preventDefault();
        }
        this.doSearch(this.state.text);
    },
    doSearch: function (keyword) {
        var url = '/api/search/' + keyword;
        this.serverRequest = $.get(url, function (items) {
            console.log(items);
            this.setState({
                items: items
            });
        }.bind(this));
    },
    render: function () {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { className: 'jumbotron' },
                React.createElement(
                    'h1',
                    null,
                    'NightLife'
                ),
                React.createElement(
                    'p',
                    null,
                    'You can signup to JOIN bar(Not valid in china, using YELP API)'
                ),
                React.createElement(
                    'h3',
                    null,
                    'Search for nightlife bars(e.g. boston)'
                ),
                React.createElement(
                    'form',
                    { onSubmit: this.handleSubmit, className: 'form-inline' },
                    React.createElement('input', { className: 'form-control', onChange: this.onChange, value: this.state.text }),
                    React.createElement(
                        'button',
                        { className: 'btn btn-default' },
                        'Search'
                    )
                )
            ),
            React.createElement(TodoList, { items: this.state.items, location: this.state.text, onUpdate: this.handleSubmit })
        );
    }
});

var mountNode = document.getElementById('todo');
ReactDOM.render(React.createElement(TodoApp, null), mountNode);

