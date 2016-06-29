'use strict';

var Options = React.createClass({
  displayName: 'Options',

  getInitialState: function getInitialState() {
    return {
      inputs: ['input-0', 'input-1']
    };
  },

  appendInput: function appendInput(event) {
    var lastid = this.state.inputs[this.state.inputs.length - 1].split('-')[1];
    var newid = parseInt(lastid) + 1;
    var newInput = 'input-' + newid;
    this.setState({
      inputs: this.state.inputs.concat([newInput])
    });
    event.preventDefault();
  },

  deleteInput: function deleteInput(event) {
    if (this.state.inputs.length == 2) {
      alert("至少保留2个选项");
      return;
    }
    var inputid = event.target.id.slice(4);
    var index = this.state.inputs.indexOf(inputid);
    if (index > -1) {
      this.state.inputs.splice(index, 1);
    }
    console.log(this.state.inputs);
    this.setState({ inputs: this.state.inputs });
  },

  render: function render() {
    var _this = this;

    return React.createElement(
      'div',
      null,
      this.state.inputs.map(function (input) {
        return React.createElement(
          'div',
          { className: 'form-group', key: input, id: "group-" + input },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'div',
              { className: 'col-md-10' },
              React.createElement('input', { type: 'text', placeholder: '选项内容', className: 'form-control', name: input })
            ),
            React.createElement(
              'div',
              { className: 'col-md-2' },
              _this.state.inputs.length > 2 ? React.createElement(
                'button',
                { type: 'button', className: 'btn btn-danger', id: "del-" + input, onClick: _this.deleteInput },
                '删除'
              ) : null
            )
          )
        );
      }),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement(
          'button',
          { type: 'button', className: 'btn btn-default newoption', onClick: function onClick() {
              return _this.appendInput();
            } },
          '新建选项'
        )
      )
    );
  }
});

ReactDOM.render(React.createElement(Options), document.getElementById('choices'));