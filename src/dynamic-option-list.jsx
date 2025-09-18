import React from 'react';
import ID from './UUID';

export default class DynamicOptionList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      element: props.element,
      dirty: false,
    };

    this.editValue = this.editValue.bind(this);
    this.editText = this.editText.bind(this);
    this.editKey = this.editKey.bind(this);
    this.editCorrect = this.editCorrect.bind(this);
    this.updateElement = this.updateElement.bind(this);
  }

  editValue(option_index, e) {
    const this_element = this.state.element;
    this_element.options[option_index].value = e.target.value;
    this.setState({ element: this_element, dirty: true });
  }

  editText(option_index, e) {
    const this_element = this.state.element;
    this_element.options[option_index].text = e.target.value;
    this.setState({ element: this_element, dirty: true });
  }

  editKey(option_index, e) {
    const this_element = this.state.element;
    this_element.options[option_index].key = e.target.value;
    this.setState({ element: this_element, dirty: true });
  }

  editCorrect(option_index, e) {
    const this_element = this.state.element;
    this_element.options[option_index].correct = e.target.checked;
    this.setState({ element: this_element, dirty: true });
  }

  updateElement() {
    this.props.updateElement.call(this.props.preview, this.state.element);
    this.setState({ dirty: false });
  }

  addOption() {
    const this_element = this.state.element;
    const groupKey = this_element.element.toLowerCase();

    this_element.options.push({
      value: '',
      text: '',
      key: '',
      correct: false,
      id: `${groupKey}_option_${ID.uuid()}`,
    });

    this.props.updateElement.call(this.props.preview, this_element);
  }

  removeOption(index) {
    const this_element = this.state.element;
    this_element.options.splice(index, 1);
    this.props.updateElement.call(this.props.preview, this_element);
  }

  render() {
    return (
      <div className="w-full">
        {this.state.element.options.map((option, index) => (
          <div key={option.id} className="flex gap-2 mb-2">
            {/* Text Field */}
            <div className="w-1/4">
              <input
                className="w-full px-2 py-1 border border-gray-300 rounded"
                type="text"
                value={option.text || ''}
                onChange={(e) => this.editText(index, e)}
                placeholder="Enter text"
              />
            </div>

            {/* Value Field */}
            <div className="w-1/4">
              <input
                className="w-full px-2 py-1 border border-gray-300 rounded"
                type="text"
                value={option.value || ''}
                onChange={(e) => this.editValue(index, e)}
                placeholder="Enter value"
              />
            </div>

            {/* Key Field */}
            <div className="w-1/4">
              <input
                className="w-full px-2 py-1 border border-gray-300 rounded"
                type="text"
                value={option.key || ''}
                onChange={(e) => this.editKey(index, e)}
                placeholder="Enter key"
              />
            </div>

            {/* Correct Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={!!option.correct}
                onChange={(e) => this.editCorrect(index, e)}
              />
            </div>

            {/* Remove Button */}
            <div>
              <button
                type="button"
                className="px-2 py-1 text-white bg-red-500 rounded"
                onClick={() => this.removeOption(index)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* Add Option Button */}
        <div className="mt-2">
          <button
            type="button"
            className="px-3 py-1 text-white bg-blue-500 rounded"
            onClick={() => this.addOption()}
          >
            + Add Option
          </button>
        </div>

        {/* Save Changes Button */}
        {this.state.dirty && (
          <div className="mt-2">
            <button
              type="button"
              className="px-3 py-1 text-white bg-green-500 rounded"
              onClick={this.updateElement}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    );
  }
}
