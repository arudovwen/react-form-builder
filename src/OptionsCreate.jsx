import React from 'react';
import ID from './UUID';

class DynamicOptionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      element: props.element || { options: [] },
      dirty: false,
    };
  }

  updateOption = (index, field, value) => {
    this.setState((prevState) => {
      const element = { ...prevState.element };
      if (!element.options) element.options = [];
      element.options[index] = { ...element.options[index], [field]: value };
      return { element, dirty: true };
    });
  };

  editCorrectValue = (index, e) => {
    this.updateOption(index, 'correct', e.target.checked);
  };

  addOption = () => {
    this.setState((prevState) => {
      const element = { ...prevState.element };
      if (!element.options) element.options = [];
      const groupKey = element.element?.toLowerCase?.() || 'unknown';
      element.options.push({
        value: '',
        text: '',
        key: '',
        correct: false,
        id: `${groupKey}_option_${ID.uuid()}`,
      });
      if (this.props.updateElement) {
        this.props.updateElement.call(this.props.preview, element);
      }
      return { element };
    });
  };

  removeOption = (index) => {
    this.setState((prevState) => {
      const element = { ...prevState.element };
      if (Array.isArray(element.options)) {
        element.options.splice(index, 1);
      }
      return { element, dirty: true };
    });
  };

  render() {
    const options = this.state.element?.options || [];

    return (
      <div className="p-4 bg-white border rounded">
        {/* Headers */}
        <div className="grid grid-cols-5 gap-2 pb-2 mb-2 font-semibold border-b">
          <div>Text</div>
          <div>Value</div>
          <div>Key</div>
          <div>Correct</div>
          <div>Actions</div>
        </div>

        {/* Option Rows */}
        {options.map((option, index) => (
          <div key={option.id || index} className="grid items-center grid-cols-5 gap-2 mb-2">
            <input
              className="input-style"
              type="text"
              value={option.text || ''}
              onChange={(e) => this.updateOption(index, 'text', e.target.value)}
              placeholder="Enter text"
            />

            <input
              className="input-style"
              type="text"
              value={option.value || ''}
              onChange={(e) => this.updateOption(index, 'value', e.target.value)}
              placeholder="Enter value"
            />

            <input
              className="input-style"
              type="text"
              value={option.key || ''}
              onChange={(e) => this.updateOption(index, 'key', e.target.value)}
              placeholder="Enter key"
            />

            <input
              type="checkbox"
              checked={option.correct || false}
              onChange={(e) => this.editCorrectValue(index, e)}
              className="w-5 h-5"
            />

            <button
              type="button"
              className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
              onClick={() => this.removeOption(index)}
            >
              Remove
            </button>
          </div>
        ))}

        {/* Add Option Button */}
        <button
          type="button"
          className="px-4 py-2 mt-3 text-white bg-blue-500 rounded hover:bg-blue-600"
          onClick={this.addOption}
        >
          Add Option
        </button>
      </div>
    );
  }
}

export default DynamicOptionList;
