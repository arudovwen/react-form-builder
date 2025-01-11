// eslint-disable-next-line max-classes-per-file
import fetch from 'isomorphic-fetch';
import { saveAs } from 'file-saver';
import React from 'react';
import Select from 'react-select';
import SignaturePad from 'react-signature-canvas';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import axios from 'axios';
import debounce from 'debounce';

import StarRating from './star-rating';
import DatePicker from './date-picker';
import ComponentHeader from './component-header';
import ComponentLabel from './component-label';
import myxss from './myxss';
import ErrorMessage from '../error-message';
import SuccessMessage from '../success-message';
import { getExtensionFromMimeType } from '../utils/getExt';

const FormElements = {};

class Header extends React.Component {
  render() {
    // const headerClasses = `dynamic-input ${this.props.data.element}-input`;
    let classNames = 'static';
    if (this.props.data.bold) {
      classNames += ' bold';
    }
    if (this.props.data.italic) {
      classNames += ' italic';
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <h3
          className={classNames}
          dangerouslySetInnerHTML={{
            __html: myxss.process(this.props.data.content),
          }}
        />
      </div>
    );
  }
}

class Paragraph extends React.Component {
  render() {
    let classNames = 'static';
    if (this.props.data.bold) {
      classNames += ' bold';
    }
    if (this.props.data.italic) {
      classNames += ' italic';
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <p
          className={classNames}
          dangerouslySetInnerHTML={{
            __html: myxss.process(this.props.data.content),
          }}
        />
      </div>
    );
  }
}

class Label extends React.Component {
  render() {
    let classNames = 'static';
    if (this.props.data.bold) {
      classNames += ' bold';
    }
    if (this.props.data.italic) {
      classNames += ' italic';
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <label
          className={`${classNames} form-label`}
          dangerouslySetInnerHTML={{
            __html: myxss.process(this.props.data.content),
          }}
        />
      </div>
    );
  }
}

class LineBreak extends React.Component {
  render() {
    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <hr />
      </div>
    );
  }
}
// https://reqres.in/api/users
class DynamicInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.submitBtnRef = React.createRef(); // Add a ref for the submit button
    // Use state for managing errorText, successText, and validating state
    this.state = {
      errorText: '',
      successText: '',
      validating: false,
      description: '',
    };

    // Debounced functions
    this.debouncedValidateInput = debounce(this.validateInput, 1200);
    this.debouncedValidateError = debounce(this.handleError, 1500);
  }

  // Function to validate input using an API request
  async validateInput(value) {
    const { url, method, apiKey } = this.props.data;

    // Validate if URL is provided
    if (!url) {
      this.setState({ errorText: 'Please add a valid API URL' });
      return;
    }

    // API call to validate the input
    try {
      this.setState({ validating: true });
      const { data, status } = await axios[method || 'get'](`${url}/${value}`, {
        headers: { Authorization: apiKey },
      });
      if (status === 200) {
        if (data?.data?.status === true) {
          this.setState({
            successText: 'Validation success',
            errorText: '',
            description: data.data?.description,
          });
          if (this.submitBtnRef.current) {
            this.submitBtnRef.current.disabled = false; // Enable the submit button
          }
        } else {
          if (this.submitBtnRef.current) {
            this.submitBtnRef.current.disabled = true; // Disable the submit button
          }
          this.setState({
            errorText: 'Data not found!',
            successText: '',
            description: '',
          });
        }
      }
    } catch (error) {
      this.setState({
        errorText:
          error?.response?.data?.message ||
          'Validation failed, please try again',
        successText: '',
        description: '',
      });
      if (this.submitBtnRef.current) {
        this.submitBtnRef.current.disabled = true; // Disable the submit button on error
      }
    } finally {
      this.setState({ validating: false });
    }
  }

  // Handle input changes and invoke the debounced validation function
  handleChange = (event) => {
    const { value } = event.target;

    this.debouncedValidateError(value);
  };

  // Handle validation errors, updating errorText in state
  handleError = (value) => {
    const { url } = this.props.data;
    if (!url) {
      this.setState({ errorText: 'Please add a valid API URL' });
      if (this.submitBtnRef.current) {
        this.submitBtnRef.current.disabled = true; // Disable the submit button if no URL
      }
    } else {
      this.setState({ errorText: '' });
      if (this.submitBtnRef.current) {
        this.submitBtnRef.current.disabled = false; // Enable submit button if URL exists
      }
      this.debouncedValidateInput(value);
    }
  };

  render() {
    const { data, mutable, defaultValue, read_only, style } = this.props;
    const { field_name, maxLength } = data;

    // Default props setup for the input field
    const props = {
      type: 'text',
      className: 'form-control',
      name: field_name,
      disabled: read_only ? 'disabled' : undefined,
      maxLength: maxLength || undefined,
    };

    // If mutable, add defaultValue and ref
    if (mutable) {
      props.defaultValue = defaultValue;
      props.ref = this.inputField;
    }

    // Base classes for the input container
    let baseClasses = 'SortableItem rfb-item';
    if (data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }
    // https://api.dev.workflow.kusala.com.ng/api/v1/WorkFlows/validate
    return (
      <div style={style} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <div className="d-flex align-items-center position-relative clearfix pr-6">
            <input {...props} onChange={this.handleChange} />
            {this.state.validating && (
              <div
                className="spinner-border spinner-border-sm text-secondary position-absolute align-middle"
                style={{ right: '16px' }}
                role="status"
              >
                <span className="sr-only">Validating...</span>
              </div>
            )}
          </div>
          {/* Render error message if there's one */}
          {this.state.errorText && (
            <ErrorMessage message={this.state.errorText} />
          )}
          {this.state.successText && !this.state.description && (
            <SuccessMessage message={this.state.successText} />
          )}
          {this.state.description && (
            <div style={{ marginTop: '6px' }}>
              <span className="block text-capitalize text-14 font-weight-bold pt-1">
                {this.state.description}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

class DocumentSelect extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.submitBtnRef = React.createRef(); // Add a ref for the submit button
    // Use state for managing errorText, successText, and validating state
    this.state = {
      errorText: '',
      successText: '',
      description: '',
      fileLoading: false,
      documents: [],
      isSigned: false,
      clicked: 0,
    };
    this.checkDocument = this.checkDocument.bind(this);
  }

  checkDocument = async (id) => {
    try {
      const token = window.localStorage.getItem('token');
      this.setState({ fileLoading: true });
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `https://api.dev.document.kusala.com.ng/api/v1/documentmanagement/get-all-documents-main/${id}`, config,
      );
      if (response.status === 200) {
        this.setState({
         isSigned: response.data.data,
        });
      }
    } finally {
      this.setState({ fileLoading: false });
    }
  };

  componentDidMount() {
    const { data } = this.props;
    const { documentId } = data;
    const tempData = documentId && JSON.parse(documentId);

    if (tempData?.value) {
      this.checkDocument(tempData.value);

      // Set up an interval to call checkDocument every 1 minute
      this.intervalId = setInterval(() => {
        this.checkDocument(tempData.value);
      }, 10 * 1000); // 60000ms = 1 minute
    }
  }

  componentWillUnmount() {
    // Clear the interval when the component is unmounted
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  render() {
    const { data, mutable, defaultValue, read_only, style } = this.props;
    const { field_name, documentId } = data;
    const tempData = documentId && JSON.parse(documentId);

    // Default props setup for the input field
    const props = {
      type: 'text',
      className: 'form-control bg-transparent',
      name: field_name,
      disabled: read_only ? 'disabled' : undefined,
    };

    // If mutable, add defaultValue and ref
    if (mutable) {
      props.defaultValue = defaultValue;
      props.ref = this.inputField;
    }

    // Base classes for the input container
    let baseClasses = 'SortableItem rfb-item';
    if (data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    // https://api.dev.workflow.kusala.com.ng/api/v1/WorkFlows/validate
    return (
      <div style={style} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <div
            className="d-flex align-items-center position-relative clearfix pr-6"
            style={{ columnGap: '12px' }}
          >
            <input {...props} defaultValue={tempData?.label ?? ''} readOnly />
            {this.state.validating && (
              <div
                className="spinner-border spinner-border-sm text-secondary position-absolute align-middle"
                style={{ right: '16px' }}
                role="status"
              >
                <span className="sr-only">Validating...</span>
              </div>
            )}

         { !this.state.isSigned ? <div className="d-flex"
              style={{ alignItems: 'center', columnGap: '8px' }}>
          <a
              target="_blank"
              href={`https://kusala.com.ng/document/render/read/${tempData?.value}?signatory_type=form`}
            >
              <button
                type="button"
                className="btn btn-sm btn-primary"
                style={{ padding: '6px 20px', borderRadius: '6px' }}
                disabled={!tempData?.value}
              >
                Sign
              </button>
            </a>
            {/* <button
                type="button"
                className="btn btn-sm btn-secondary"
                style={{ padding: '6px 20px', borderRadius: '6px' }}
                disabled={!tempData?.value}
              >
                Query
              </button> */}
         </div> :
            <button
              type="button"
              className="btn btn-sm btn-success d-flex"
              style={{ padding: '6px 20px', borderRadius: '6px', alignItems: 'center', columnGap: '8px' }}

            >
              Signed <i className="far fa-check-circle"></i>
            </button>}
          </div>
          {/* Render error message if there's one */}
          {this.state.errorText && (
            <ErrorMessage message={this.state.errorText} />
          )}
          {this.state.successText && !this.state.description && (
            <SuccessMessage message={this.state.successText} />
          )}
          {this.state.description && (
            <div style={{ marginTop: '6px' }}>
              <span className="block text-capitalize text-14 font-weight-bold pt-1">
                {this.state.description}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.type = 'text';
    props.className = 'form-control';
    props.name = this.props.data.field_name;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }
    //  async function validateInput(){

    //  }
    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <input {...props} />
        </div>
      </div>
    );
  }
}

class EmailInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.type = 'text';
    props.className = 'form-control';
    props.name = this.props.data.field_name;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <input {...props} />
        </div>
      </div>
    );
  }
}

class PhoneNumber extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.type = 'tel';
    props.className = 'form-control';
    props.name = this.props.data.field_name;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <input {...props} />
        </div>
      </div>
    );
  }
}

class NumberInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.type = 'number';
    props.className = 'form-control';
    props.name = this.props.data.field_name;

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <input {...props} />
        </div>
      </div>
    );
  }
}

class TextArea extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.className = 'form-control';
    props.name = this.props.data.field_name;

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <textarea {...props} />
        </div>
      </div>
    );
  }
}

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.className = 'form-control';
    props.name = this.props.data.field_name;

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <select {...props}>
            {this.props.data.options.map((option) => {
              const this_key = `preview_${option.key}`;
              return (
                <option value={option.value} key={this_key}>
                  {option.text}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    );
  }
}

class Signature extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultValue: props.defaultValue,
    };
    this.inputField = React.createRef();
    this.canvas = React.createRef();
  }

  clear = () => {
    if (this.state.defaultValue) {
      this.setState({ defaultValue: '' });
    } else if (this.canvas.current) {
      this.canvas.current.clear();
    }
  };

  render() {
    const { defaultValue } = this.state;
    let canClear = !!defaultValue;
    const props = {};
    props.type = 'hidden';
    props.name = this.props.data.field_name;

    if (this.props.mutable) {
      props.defaultValue = defaultValue;
      props.ref = this.inputField;
    }
    const pad_props = {};
    // umd requires canvasProps={{ width: 400, height: 150 }}
    if (this.props.mutable) {
      pad_props.defaultValue = defaultValue;
      pad_props.ref = this.canvas;
      canClear = !this.props.read_only;
    }
    pad_props.clearOnResize = false;

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    let sourceDataURL;
    if (defaultValue && defaultValue.length > 0) {
      sourceDataURL = `data:image/png;base64,${defaultValue}`;
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.read_only === true || !!sourceDataURL ? (
            <img src={sourceDataURL} />
          ) : (
            <SignaturePad {...pad_props} />
          )}
          {canClear && (
            <i
              className="fas fa-times clear-signature"
              onClick={this.clear}
              title="Clear Signature"
            ></i>
          )}
          <input {...props} />
        </div>
      </div>
    );
  }
}

class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    const { defaultValue, data } = props;
    this.state = { value: this.getDefaultValue(defaultValue, data.options) };
  }

  getDefaultValue(defaultValue, options) {
    if (defaultValue) {
      if (typeof defaultValue === 'string') {
        const vals = defaultValue.split(',').map((x) => x.trim());
        return options.filter((x) => vals.indexOf(x.value) > -1);
      }
      return options.filter((x) => defaultValue.indexOf(x.value) > -1);
    }
    return [];
  }

  // state = { value: this.props.defaultValue !== undefined ? this.props.defaultValue.split(',') : [] };

  handleChange = (e) => {
    this.setState({ value: e || [] });
  };

  render() {
    const options = this.props.data.options.map((option) => {
      option.label = option.text;
      return option;
    });
    const props = {};
    props.isMulti = true;
    props.name = this.props.data.field_name;
    props.onChange = this.handleChange;

    props.options = options;
    if (!this.props.mutable) {
      props.value = options[0].text;
    } // to show a sample of what tags looks like
    if (this.props.mutable) {
      props.isDisabled = this.props.read_only;
      props.value = this.state.value;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <Select {...props} />
        </div>
      </div>
    );
  }
}

class Checkboxes extends React.Component {
  constructor(props) {
    super(props);
    this.options = {};
  }

  render() {
    const self = this;
    let classNames = 'custom-control custom-checkbox';
    if (this.props.data.inline) {
      classNames += ' option-inline';
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.data.options.map((option) => {
            const this_key = `preview_${option.key}`;
            const props = {};
            props.name = `option_${option.key}`;

            props.type = 'checkbox';
            props.value = option.value;
            if (self.props.mutable) {
              props.defaultChecked =
                self.props.defaultValue !== undefined &&
                (self.props.defaultValue.indexOf(option.key) > -1 ||
                  self.props.defaultValue.indexOf(option.value) > -1);
            }
            if (this.props.read_only) {
              props.disabled = 'disabled';
            }
            return (
              <div className={classNames} key={this_key}>
                <input
                  id={`fid_${this_key}`}
                  className="custom-control-input"
                  ref={(c) => {
                    if (c && self.props.mutable) {
                      self.options[`child_ref_${option.key}`] = c;
                    }
                  }}
                  {...props}
                />
                <label
                  className="custom-control-label"
                  htmlFor={`fid_${this_key}`}
                >
                  {option.text}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class RadioButtons extends React.Component {
  constructor(props) {
    super(props);
    this.options = {};
  }

  render() {
    const self = this;
    let classNames = 'custom-control custom-radio';
    if (this.props.data.inline) {
      classNames += ' option-inline';
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.data.options.map((option) => {
            const this_key = `preview_${option.key}`;
            const props = {};
            props.name = self.props.data.field_name;

            props.type = 'radio';
            props.value = option.value;
            if (self.props.mutable) {
              props.defaultChecked =
                self.props.defaultValue !== undefined &&
                (self.props.defaultValue.indexOf(option.key) > -1 ||
                  self.props.defaultValue.indexOf(option.value) > -1);
            }
            if (this.props.read_only) {
              props.disabled = 'disabled';
            }

            return (
              <div className={classNames} key={this_key}>
                <input
                  id={`fid_${this_key}`}
                  className="custom-control-input"
                  ref={(c) => {
                    if (c && self.props.mutable) {
                      self.options[`child_ref_${option.key}`] = c;
                    }
                  }}
                  {...props}
                />
                <label
                  className="custom-control-label"
                  htmlFor={`fid_${this_key}`}
                >
                  {option.text}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class Image extends React.Component {
  render() {
    const style = this.props.data.center ? { textAlign: 'center' } : null;

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style, ...style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        {this.props.data.src && (
          <img
            src={this.props.data.src}
            width={this.props.data.width}
            height={this.props.data.height}
          />
        )}
        {!this.props.data.src && <div className="no-image">No Image</div>}
      </div>
    );
  }
}

class Rating extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.name = this.props.data.field_name;
    props.ratingAmount = 5;

    if (this.props.mutable) {
      props.rating =
        this.props.defaultValue !== undefined
          ? parseFloat(this.props.defaultValue, 10)
          : 0;
      props.editing = true;
      props.disabled = this.props.read_only;
      props.ref = this.inputField;
    }

    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <StarRating {...props} />
        </div>
      </div>
    );
  }
}

class HyperLink extends React.Component {
  render() {
    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <label className={'form-label'}>
            <a
              target="_blank"
              href={this.props.data.href}
              dangerouslySetInnerHTML={{
                __html: myxss.process(this.props.data.content),
              }}
            />
          </label>
        </div>
      </div>
    );
  }
}

class Download extends React.Component {
  render() {
    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <a
            href={`${this.props.download_path}?id=${this.props.data.file_path}`}
          >
            {this.props.data.content}
          </a>
        </div>
      </div>
    );
  }
}

class Camera extends React.Component {
  constructor(props) {
    super(props);
    this.state = { img: null, previewImg: null };
  }

  displayImage = (e) => {
    const self = this;
    const { target } = e;
    if (target.files && target.files.length) {
      self.setState({
        img: target.files[0],
        previewImg: URL.createObjectURL(target.files[0]),
      });
    }
  };

  clearImage = () => {
    this.setState({
      img: null,
      previewImg: null,
    });
  };

  getImageSizeProps({ width, height }) {
    const imgProps = { width: '100%' };
    if (width) {
      imgProps.width =
        width < window.innerWidth ? width : 0.9 * window.innerWidth;
    }
    if (height) {
      imgProps.height = height;
    }
    return imgProps;
  }

  render() {
    const imageStyle = {
      objectFit: 'scale-down',
      objectPosition: this.props.data.center ? 'center' : 'left',
    };
    let baseClasses = 'SortableItem rfb-item';
    const name = this.props.data.field_name;
    const fileInputStyle = this.state.img ? { display: 'none' } : null;
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }
    let sourceDataURL;
    if (
      this.props.read_only === true &&
      this.props.defaultValue &&
      this.props.defaultValue.length > 0
    ) {
      if (this.props.defaultValue.indexOf(name > -1)) {
        sourceDataURL = this.props.defaultValue;
      } else {
        sourceDataURL = `data:image/png;base64,${this.props.defaultValue}`;
      }
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.read_only === true &&
          this.props.defaultValue &&
          this.props.defaultValue.length > 0 ? (
            <div>
              <img
                style={imageStyle}
                src={sourceDataURL}
                {...this.getImageSizeProps(this.props.data)}
              />
            </div>
          ) : (
            <div className="image-upload-container">
              <div style={fileInputStyle}>
                <input
                  name={name}
                  type="file"
                  accept="image/*"
                  capture="camera"
                  className="image-upload"
                  onChange={this.displayImage}
                />
                <div className="image-upload-control">
                  <div className="btn btn-default">
                    <i className="fas fa-camera"></i> Upload Photo
                  </div>
                  <p>Select an image from your computer or device.</p>
                </div>
              </div>

              {this.state.img && (
                <div>
                  <img
                    onLoad={() => URL.revokeObjectURL(this.state.previewImg)}
                    src={this.state.previewImg}
                    height="100"
                    className="image-upload-preview"
                  />
                  <br />
                  <div
                    className="btn btn-image-clear"
                    onClick={this.clearImage}
                  >
                    <i className="fas fa-times"></i> Clear Photo
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

class FileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fileUpload: null, fileLoading: false, fileStatus: null };
  }

  getBase64 = (file) => new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      const reader = new FileReader();

      reader.onload = function (event) {
        // Resolve the promise with the base64 string
        const base64String = event.target.result.split(',')[1];
        resolve(base64String);
      };

      reader.onerror = function (error) {
        // Reject the promise if there was an error
        reject(error);
      };

      // Read the file as a Data URL (Base64-encoded string)
      reader.readAsDataURL(file);
    });

  // eslint-disable-next-line consistent-return
  uploadFile = async (file) => {
    try {
      this.setState({ fileLoading: true });
      const data = {
        fileName: file.name,
        base64: await this.getBase64(file),
        ext: `.${getExtensionFromMimeType(file.type)}`,
      };
      const response = await axios.post(
        'https://api.dev.workflow.kusala.com.ng/api/v1/FileUpload/upload-document',
        data,
      );
      this.setState({ fileStatus: true });
      return response.data.data;
    } catch (error) {
      this.setState({
        fileStatus: error.response.data.message || 'Unable to upload file',
      });
    } finally {
      this.setState({ fileLoading: false });
    }
  };

  displayFileUpload = async (e) => {
    const self = this;
    const { target } = e;
    let file;

    if (target.files && target.files.length > 0) {
      file = target.files[0];

      self.setState({
        fileUpload: await this.uploadFile(file),
      });
    }
  };

  clearFileUpload = () => {
    this.setState({
      fileUpload: null,
      fileStatus: null,
      fileLoading: false,
    });
  };

  saveFile = async (e) => {
    e.preventDefault();
    const sourceUrl = this.props.defaultValue.url;
    window.open(sourceUrl, '_blank');
    // const response = await fetch(sourceUrl, {
    //   method: 'GET',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json; charset=utf-8',
    //   },
    //   responseType: 'blob',
    // });
    // const dispositionHeader = response.headers.get('Content-Disposition');
    // const resBlob = await response.blob();
    // // eslint-disable-next-line no-undef
    // const blob = new Blob([resBlob], {
    //   type: this.props.data.fileType || response.headers.get('Content-Type'),
    // });
    // if (dispositionHeader && dispositionHeader.indexOf(';filename=') > -1) {
    //   const fileName = dispositionHeader.split(';filename=')[1];
    //   saveAs(blob, fileName);
    // } else {
    //   const fileName = sourceUrl.substring(sourceUrl.lastIndexOf('/') + 1);
    //   saveAs(response.url, fileName);
    // }
  };

  render() {
    let baseClasses = 'SortableItem rfb-item';
    const name = this.props.data.field_name;
    const fileInputStyle = this.state.fileUpload
      ? { display: 'none' }
      : { display: 'flex' };
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }
    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.read_only === true && this.props.defaultValue ? (
            <div>
              <div
                className="fileName"
                style={{ textTransform: 'capitalize', marginBottom: '8px' }}
              >
                {this.props.defaultValue.fileName}
              </div>
              <div>
                <button className="btn btn-view" onClick={this.saveFile}>
                  <span>Preview File</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="image-upload-container">
              <div style={{ ...fileInputStyle, alignItems: 'center' }}>
                <input
                  name={name}
                  type="file"
                  accept={this.props.data.fileType || '*'}
                  className="image-upload"
                  onChange={this.displayFileUpload}
                  disabled={this.props.read_only === true}
                />
                <div className="image-upload-control">
                  <div className="btn btn-default">
                    <i className="fas fa-file"></i> Upload File
                  </div>
                  <p style={{ padding: '0 10px', margin: 0 }}>
                    Select a file from your device.
                  </p>
                </div>
                {this.state.fileLoading && (
                  <div
                    className="spinner-border spinner-border-sm text-secondary position-absolute align-middle"
                    style={{ right: '16px' }}
                    role="status"
                  ></div>
                )}
              </div>

              {this.state.fileUpload && (
                <div>
                  <div className="file-upload-preview">
                    <div
                      style={{ display: 'inline-block', marginRight: '5px' }}
                    >
                      {`File Name: ${this.state.fileUpload.fileName}`}
                    </div>
                    <button
                      type="button"
                      className="btn btn-file-upload-clear"
                      style={{
                        padding: '4px 0',
                        fontSize: '12px',
                        marginTop: '6px',
                      }}
                      onClick={this.clearFileUpload}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      columnGap: '20px',
                      alignItems: 'center',
                      marginTop: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'green',
                        fontStyle: 'italic',
                      }}
                    >
                      File uploaded successfully
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

class Range extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      value:
        props.defaultValue !== undefined
          ? parseInt(props.defaultValue, 10)
          : parseInt(props.data.default_value, 10),
    };
  }

  changeValue = (e) => {
    const { target } = e;
    this.setState({
      value: target.value,
    });
  };

  render() {
    const props = {};
    const name = this.props.data.field_name;

    props.type = 'range';
    props.list = `tickmarks_${name}`;
    props.min = this.props.data.min_value;
    props.max = this.props.data.max_value;
    props.step = this.props.data.step;

    props.value = this.state.value;
    props.change = this.changeValue;

    if (this.props.mutable) {
      props.ref = this.inputField;
    }

    const datalist = [];
    for (
      let i = parseInt(props.min, 10);
      i <= parseInt(props.max, 10);
      i += parseInt(props.step, 10)
    ) {
      datalist.push(i);
    }

    const oneBig = 100 / (datalist.length - 1);

    const _datalist = datalist.map((d, idx) => (
      <option key={`${props.list}_${idx}`}>{d}</option>
    ));

    const visible_marks = datalist.map((d, idx) => {
      const option_props = {};
      let w = oneBig;
      if (idx === 0 || idx === datalist.length - 1) {
        w = oneBig / 2;
      }
      option_props.key = `${props.list}_label_${idx}`;
      option_props.style = { width: `${w}%` };
      if (idx === datalist.length - 1) {
        option_props.style = { width: `${w}%`, textAlign: 'right' };
      }
      return <label {...option_props}>{d}</label>;
    });

    if (this.props.read_only) {
      props.disabled = 'disabled';
    }
    let baseClasses = 'SortableItem rfb-item';
    if (this.props.data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <div className="range">
            <div className="clearfix">
              <span className="float-left">{this.props.data.min_label}</span>
              <span className="float-right">{this.props.data.max_label}</span>
            </div>
            <ReactBootstrapSlider {...props} />
          </div>
          <div className="visible_marks">{visible_marks}</div>
          <input name={name} value={this.state.value} type="hidden" />
          <datalist id={props.list}>{_datalist}</datalist>
        </div>
      </div>
    );
  }
}

FormElements.Header = Header;
FormElements.Paragraph = Paragraph;
FormElements.Label = Label;
FormElements.LineBreak = LineBreak;
FormElements.TextInput = TextInput;
FormElements.DynamicInput = DynamicInput;
FormElements.DocumentSelect = DocumentSelect;
FormElements.EmailInput = EmailInput;
FormElements.PhoneNumber = PhoneNumber;
FormElements.NumberInput = NumberInput;
FormElements.TextArea = TextArea;
FormElements.Dropdown = Dropdown;
FormElements.Signature = Signature;
FormElements.Checkboxes = Checkboxes;
FormElements.DatePicker = DatePicker;
FormElements.RadioButtons = RadioButtons;
FormElements.Image = Image;
FormElements.Rating = Rating;
FormElements.Tags = Tags;
FormElements.HyperLink = HyperLink;
FormElements.Download = Download;
FormElements.Camera = Camera;
FormElements.FileUpload = FileUpload;
FormElements.Range = Range;

export default FormElements;
