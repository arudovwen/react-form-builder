/* eslint-disable no-undef */
// eslint-disable-next-line max-classes-per-file
import React from 'react';
import Select from 'react-select';
import SignaturePad from 'react-signature-canvas';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import axios from 'axios';
import debounce from 'debounce';
import PropTypes from 'prop-types';

import CurrencyInput from 'react-currency-input-field';
import StarRating from './star-rating';
import DatePicker from './date-picker';
import ComponentHeader from './component-header';
import ComponentLabel from './component-label';
import myxss from './myxss';
import ErrorMessage from '../error-message';
import SuccessMessage from '../success-message';
import { getExtensionFromMimeType } from '../utils/getExt';
import ImageViewer from '../ImageViewer';
import TableInputElement from '../TableInputElement';
import UniversalFileViewer from '../DocumentViewer';
import DynamicInputList from '../DynamicInput';

const FormElements = {};

function isValidGuid(guid) {
  const guidPattern =
    /^[{]?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}[}]?$/;
  return guidPattern.test(guid);
}

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
      objectFileData: [],
    };

    // Debounced functions
    this.debouncedValidateInput = debounce(this.validateInput, 1200);
    this.debouncedValidateError = debounce(this.handleError, 1500);
    this.getFileUrl = this.getFileUrl.bind(this);
  }

  componentDidMount() {
    if (this.props.defaultValue) {
      this.validateInput(this.props.defaultValue);
    }
  }

  async getFileUrl(id) {
    const { fileUrl } = this.props.data;
    const tempFileUrl =
      fileUrl ||
      'https://qa-document-management.sterling.ng/api/v1/docs/preview';
    const response = await axios.get(
      `${tempFileUrl}/${id}?documentType=Others`,
    );

    if (response.status === 200 && response?.data?.data) {
      return `data:image/jpeg;base64,${response?.data?.data?.blobString}`;
    }
    return null;
  }

  // Function to validate input using an API request
  // eslint-disable-next-line no-unused-vars
  async validateInput(value) {
    const { url, method, apiKey, responseType } = this.props.data;

    // Validate if URL is provided
    if (!url) {
      this.setState({ errorText: 'Please add a valid API URL' });
      return;
    }

    // API call to validate the input
    try {
      this.setState({ validating: true });

      // Make the API call using the method provided (GET by default)
      const { data, status } = await axios[method || 'get'](`${url}/${value}`, {
        headers: { Authorization: apiKey },
      });

      if (status === 200) {
        if ((data?.data?.status || data?.status) === true) {
          this.setState({
            successText: 'Validation success',
            errorText: '',
            description: data.data?.description || data?.description,
          });

          // Check if responseType is object and process the description
          if (responseType === 'object') {
            const ObjData = data.data?.description || data?.description;

            // Map through the object and handle errors individually for each item
            const mappedData = await Promise.all(
              Object.keys(ObjData).map(async (item) => {
                const newObj = {};
                try {
                  if (isValidGuid(ObjData[item])) {
                    newObj[item] = await this.getFileUrl(ObjData[item]);
                  } else {
                    newObj[item] = ObjData[item];
                  }
                } catch (fileError) {
                  // Handle the error for each file fetch and continue
                  console.error(
                    `Error fetching file URL for ${item}:`,
                    fileError,
                  );
                  newObj[item] = null; // Fallback to original value if error occurs
                }
                return newObj;
              }),
            );

            // After resolving all the promises, flatten the result
            const flattenedData = mappedData.reduce(
              (acc, obj) => ({ ...acc, ...obj }),
              {},
            );

            this.setState({
              objectFileData: flattenedData,
            });
          }

          // Enable the submit button after success
          if (this.submitBtnRef.current) {
            this.submitBtnRef.current.disabled = false; // Enable the submit button
          }
        } else {
          // If validation fails, disable the submit button and reset description
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
      // Handle errors during API validation
      this.setState({
        errorText:
          error?.response?.data?.message ||
          'Validation failed, please try again',
        successText: '',
        description: '',
      });

      // Disable the submit button if an error occurs
      if (this.submitBtnRef.current) {
        this.submitBtnRef.current.disabled = true; // Disable the submit button on error
      }
    } finally {
      // Set validating state to false once the validation is complete
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
    const { field_name, maxLength, responseType } = data;

    // Default props setup for the input field
    const props = {
      type: 'text',
      className: 'form-control',
      name: field_name,
      disabled: read_only ? 'disabled' : undefined,
      maxLength: maxLength || undefined,
      responseType: responseType || 'string',
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
    function addSpaceToUppercase(str) {
      return str.replace(/([A-Z])/g, ' $1').trim();
    }
    function isImage(value) {
      if (!value) return false;
      // Check if the value is a base64 encoded image
      const base64Pattern = /^data:image\/(jpeg|png|gif|bmp|webp);base64,/i;

      // Check if the value is a valid image URL (ends with image file extensions)
      const urlPattern = /\.(jpeg|jpg|png|gif|bmp|webp)$/i;

      // Check if the value matches either of the patterns
      return base64Pattern.test(value) || urlPattern.test(value);
    }

    // https://api.dev.workflow.kusala.com.ng/api/v1/WorkFlows/validate
    //  https://qa-document-management.sterling.ng/api/v1/docs/preview/243bf8a6-7903-4a8e-bd2a-943558c58a69?documentType=Others
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
          {this.state.description && responseType === 'string' && (
            <div style={{ marginTop: '6px' }}>
              <span className="block text-capitalize text-14 font-weight-bold pt-1">
                {this.state.description}
              </span>
            </div>
          )}
          {this.state.objectFileData && responseType === 'object' && (
            <>
              {Object.keys(this.state.objectFileData).map((item) => (
                <div key={item} style={{ marginTop: '16px' }}>
                  <label className="block text-capitalize text-14 font-weight-bold pt-1 form-label">
                    <span>{addSpaceToUppercase(item)} </span>
                  </label>

                  {!(
                    isImage(this.state.description[item]) ||
                    isValidGuid(this.state.description[item])
                  ) ? (
                    <div
                      className="form-control loaded_file"
                      style={{ background: '#efefef4d' }}
                    >
                      {this.state.objectFileData[item] || 'N/a'}
                    </div>
                  ) : (
                    <div className="">
                      {/* Show Guid - {getFileUrl(this.state.description[item])} */}
                      {this.state.objectFileData[item] ? (
                        <ImageViewer
                          imageUrl={this.state.objectFileData[item]}
                        />
                      ) : (
                        'No file found'
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }
}

class DocumentSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorText: '',
      successText: '',
      description: '',
      fileLoading: false,
      documents: [],
      isSigned: false,
      signatures: [],
      signature: null,
    };
    this.intervalId = null;
    this.requestId = new URLSearchParams(window.location.search).get(
      'workflowId',
    );
  }

  async componentDidMount() {
    const { data } = this.props;
    const { documentId } = data;

    let parsedDocumentId;
    try {
      parsedDocumentId = documentId ? JSON.parse(documentId) : null;
    } catch (error) {
      console.error('Invalid JSON in documentId:', error);
      return;
    }

    if (parsedDocumentId?.value) {
      this.checkDocument(parsedDocumentId.value);
      if (this.state.signatures.length === 0) {
        this.getSignatures(parsedDocumentId.value);
      }

      // Set interval to check document signature status
      this.intervalId = setInterval(() => {
        if (!this.state.isSigned) {
          this.checkDocument(parsedDocumentId.value);
        } else {
          clearInterval(this.intervalId);
        }
      }, 10000); // 10 seconds
    }
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async checkDocument(id) {
    try {
      const token = window.localStorage.getItem('token');
      const tempUser = JSON.parse(
        window.localStorage.getItem('LoginInfo') || '{}',
      );
      const position = tempUser?.role ?? 'ed';
      this.setState({ fileLoading: true });

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(
        `https://api.dev.document.kusala.com.ng/api/v1/DocumentSignature/position-signature-status?documentId=${id}&position=${position}&requestId=${this.requestId}&fromWorkflow=true`,
        config,
      );

      if (response.status === 200) {
        this.setState({
          isSigned: response.data.data?.isSigned,
          signature: response.data.data,
        });
        if (response.data.data?.isSigned) {
          clearInterval(this.intervalId);
        }
      }
    } catch (error) {
      console.error('Error checking document status:', error);
      if (
        error.response.data.message ===
        'No document signature for this position'
      ) {
        clearInterval(this.intervalId);
      }
    } finally {
      this.setState({ fileLoading: false });
    }
  }

  // eslint-disable-next-line consistent-return
  async getSignatures(id) {
    try {
      const token = window.localStorage.getItem('token');

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(
        `https://api.dev.document.kusala.com.ng/api/v1/DocumentSignature/get-signatures-request?documentId=${id}&requestId=${this.requestId}`,
        config,
      );

      if (response.status === 200) {
        this.setState({ signatures: response.data?.data?.data || [] });
      }
    } catch (error) {
      console.error('Error fetching signatures:', error);
    }
  }

  isPathValid() {
    const { pathname } = window.location;
    const validPaths = [
      '/forms/editor',
      '/run/workflow/approve',
      '/run/workflow/verdict',
      '/request/process/approval',
      '/request/process/verdict',
      '/request/process/view',
      '/request/process/rework',
    ];

    return (
      validPaths.some((path) => pathname?.toLowerCase()?.includes(path)) ||
      pathname === '/'
    );
  }

  isApprovePath() {
    const { pathname } = window.location;
    const validApprovePaths = [
      '/run/workflow/approve',
      '/run/workflow/verdict',
      '/request/process/approval',
      '/request/process/verdict',
      '/request/process/view',
      '/request/process/rework',
    ];
    return validApprovePaths.some((path) => pathname?.toLowerCase()?.includes(path));
  }

  render() {
    const { data, mutable, defaultValue, read_only, style } = this.props;
    const { field_name, documentId } = data;
    const {
      errorText,
      successText,
      description,
      isSigned,
      signatures,
      signature,
    } = this.state;
    const tempUser = JSON.parse(
      window.localStorage.getItem('LoginInfo') || '{}',
    );
    const position = tempUser?.role;
    const email = tempUser?.email;
    // new URLSearchParams(window.location.search).get('email');

    const parsedDocumentId = documentId ? JSON.parse(documentId) : {};
    const userCanSign = signatures.some(
      (sig) => sig?.position?.toLowerCase() === position?.toLowerCase(),
    );
    console.log(
      '🚀 ~ DocumentSelect ~ render ~ parsedDocumentId:',
      parsedDocumentId,
    );

    if (!this.isPathValid()) {
      return null;
    }
    // if (this.isApprovePath()) {
    //   return null;
    // }
    const inputProps = {
      type: 'text',
      className: 'form-control bg-transparent',
      name: field_name,
      defaultValue: mutable ? defaultValue : undefined,
      disabled: read_only,
    };

    return (
      <div
        style={style}
        className={`SortableItem rfb-item ${
          data.pageBreakBefore ? 'alwaysbreak' : ''
        }`}
      >
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <div
            className="d-flex align-items-center position-relative clearfix pr-6"
            style={{ columnGap: '12px' }}
          >
            {/* <input
              {...inputProps}
              value={parsedDocumentId?.label || ''}
              readOnly
            /> */}
            <div {...inputProps}>{parsedDocumentId?.label || ''}</div>
            {!isSigned && userCanSign && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://kusala.com.ng/document/render/read/${parsedDocumentId?.value}/${signature?.id}?email=${email}&type=form_signature&requestId=${this.requestId}`}
              >
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  style={{ padding: '10px 20px', borderRadius: '6px' }}
                  disabled={!parsedDocumentId?.value}
                >
                  Sign
                </button>
              </a>
            )}
            {(isSigned || !userCanSign) && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://kusala.com.ng/document/preview/read/${
                  parsedDocumentId?.value
                }/${
                  signature?.id ?? '043ff984-cf11-4507-81f8-93c8d9fd48ef'
                }?email=${email}&type=form_signature&requestId=${
                  this.requestId
                }`}
              >
                <button
                  type="button"
                  className="btn btn-sm btn-success d-flex"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    alignItems: 'center',
                    columnGap: '8px',
                  }}
                >
                  {isSigned ? (
                    <>
                      Signed <i className="far fa-check-circle"></i>
                    </>
                  ) : (
                    'View'
                  )}
                </button>{' '}
              </a>
            )}
          </div>

          {errorText && <ErrorMessage message={errorText} />}
          {successText && !description && (
            <SuccessMessage message={successText} />
          )}
          {description && (
            <div style={{ marginTop: '6px' }}>
              <span className="block text-capitalize text-14 font-weight-bold pt-1">
                {description}
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
class TableInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      tableData: this.props.defaultValue || [],
    };
  }

  render() {
    const props = {};
    props.type = 'text';
    props.className = 'form-control';
    props.name = this.props.data.field_name;
    let tempDefaultValue = [];

    const { denominators } = this.props.data;
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

    if (this.props.defaultValue) {
      tempDefaultValue = this.props.defaultValue || [];
    }
    //  async function validateInput(){

    //  }
    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <TableInputElement
            onGetTotal={(data) => {
              this.setState({ tableData: data });
            }}
            denominators={denominators}
            defaultValue={tempDefaultValue}
            readOnly={this.props.read_only}
          />
        </div>
      </div>
    );
  }
}

class DynamicMultiInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      dataList: this.props.defaultValue || [],
    };
  }

  render() {
    const props = {};
    props.type = 'text';
    props.className = 'form-control';
    props.name = this.props.data.field_name;
    let tempDefaultValue = [];

    const { dynamicInputOptions } = this.props.data;
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

    if (this.props.defaultValue) {
      tempDefaultValue = this.props.defaultValue || [];
    }
    //  async function validateInput(){

    //  }
    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <DynamicInputList
            getValues={(data) => {
              this.setState({ dataList: data });
            }}
            initialFields={dynamicInputOptions || []}
            tempDefaultValue={tempDefaultValue}
            readOnly={this.props.read_only}
          />
        </div>
      </div>
    );
  }
}
class PasswordInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      type: 'password',
    };
  }

  togglePasswordVisibility = () => {
    // Toggle between 'password' and 'text' type
    this.setState((prevState) => ({
      type: prevState.type === 'text' ? 'password' : 'text',
    }));
  };

  render() {
    const { type } = this.state;
    const props = {};
    props.type = type;
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
          <div className="password-input-wrapper">
            <input {...props} />
            {this.props.data.togglePassword && (
              <button
                type="button"
                onClick={this.togglePasswordVisibility}
                className="password-toggle-button"
              >
                {type === 'text' ? 'Hide' : 'Show'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
class AmountInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      value: this.props.defaultValue || '',
    };
  }

  handleValueChange = (value, name, values) => {
    this.setState({ value });
    if (this.props.onValueChange) {
      this.props.onValueChange(value, name, values);
    }
  };

  render() {
    const { data, mutable, defaultValue, style, read_only } = this.props;
    const { toggleNegative } = data;
    const inputProps = {
      type: 'text',
      className: 'form-control',
      name: data.field_name,
      defaultValue: mutable ? defaultValue : undefined,
      ref: mutable ? this.inputField : undefined,
      disabled: read_only,
    };

    let baseClasses = 'SortableItem rfb-item';
    if (data.pageBreakBefore) {
      baseClasses += ' alwaysbreak';
    }

    return (
      <div style={style} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <CurrencyInput
            id="input-example"
            className="form-control"
            decimalsLimit={6}
            defaultValue={defaultValue}
            onValueChange={this.handleValueChange}
            disabled={read_only}
            allowNegativeValue={!!toggleNegative}
          />
          <input
            {...inputProps}
            defaultValue={this.state.value}
            className="hidden-input"
          />
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
class SmartAdaptorDropdown extends React.Component {
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
  static propTypes = {
    data: PropTypes.shape({
      field_name: PropTypes.string.isRequired,
      fileType: PropTypes.string,
      pageBreakBefore: PropTypes.bool,
    }).isRequired,
    defaultValue: PropTypes.shape({
      fileName: PropTypes.string,
      url: PropTypes.string,
    }),
    read_only: PropTypes.bool,
    style: PropTypes.object,
  };

  fileReader = null;

  MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(props) {
    super(props);
    this.state = {
      fileUpload: null,
      fileLoading: false,
      fileStatus: null,
      error: null,
    };
  }

  componentDidMount() {
    if (this.props.defaultValue) {
      this.setState({
        fileUpload: this.props.defaultValue,
      });
    }
  }

  componentWillUnmount() {
    if (this.fileReader) {
      this.fileReader.abort();
      this.fileReader = null;
    }
  }

  validateFile = (file) => {
    if (file.size > this.MAX_FILE_SIZE) {
      return 'File size exceeds 5MB limit';
    }

    if (
      this.props.data.fileType &&
      !file.type.match(this.props.data.fileType)
    ) {
      return 'Invalid file type';
    }

    return null;
  };

  getBase64 = (file) => new Promise((resolve, reject) => {
      this.fileReader = new FileReader();

      this.fileReader.onload = (event) => {
        if (event.target?.result) {
          const base64String = event.target.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      this.fileReader.onerror = (error) => {
        reject(error);
      };

      this.fileReader.readAsDataURL(file);
    });

  uploadFile = async (file) => {
    try {
      const validationError = this.validateFile(file);
      if (validationError) {
        this.setState({ error: validationError });
        return null;
      }

      this.setState({ fileLoading: true, error: null });
      const data = {
        fileName: file.name,
        base64: await this.getBase64(file),
        ext: `.${getExtensionFromMimeType(file.type)}`,
      };

      const response = await axios.post(
        'https://api.dev.workflow.kusala.com.ng/api/v1/FileUpload/upload-document',
        data,
      );

      this.setState({ fileStatus: 'success' });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Unable to upload file';
      this.setState({
        fileStatus: 'error',
        error: errorMessage,
      });
      return null;
    } finally {
      this.setState({ fileLoading: false });
    }
  };

  handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploadedFile = await this.uploadFile(file);
      if (uploadedFile) {
        this.setState({ fileUpload: uploadedFile });
      }
    }
  };

  clearFileUpload = () => {
    this.setState({
      fileUpload: null,
      fileStatus: null,
      fileLoading: false,
      error: null,
    });
  };

  handlePreviewFile = (e) => {
    e.preventDefault();
    const sourceUrl = this.props.defaultValue?.url;
    if (sourceUrl) {
      window.open(sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  render() {
    const { fileUpload, fileLoading, error } = this.state;
    const { data, read_only, defaultValue, style } = this.props;
    const baseClasses = `SortableItem rfb-item${
      data.pageBreakBefore ? ' alwaysbreak' : ''
    }`;
    const fileInputStyle = fileUpload
      ? { display: 'none' }
      : { display: 'flex' };

    return (
      <div style={style} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {read_only && defaultValue ? (
            <div>
              <div
                className="fileName"
                style={{ textTransform: 'capitalize', marginBottom: '8px' }}
              >
                {defaultValue.fileName}
              </div>
              <div>
                {/* <button
                  className="btn btn-view"
                  onClick={this.handlePreviewFile}
                  aria-label={`Preview file ${defaultValue.fileName}`}
                >
                  <span>Preview File</span>
                </button> */}
                <UniversalFileViewer
                  fileName={defaultValue.fileName}
                  fileUrl={defaultValue.url}
                />
              </div>
            </div>
          ) : (
            <div className="image-upload-container">
              {!fileUpload && (
                <div style={{ ...fileInputStyle, alignItems: 'center' }}>
                  <input
                    name={data.field_name}
                    type="file"
                    accept={data.fileType || '*'}
                    className="image-upload"
                    onChange={this.handleFileChange}
                    disabled={read_only}
                    aria-label="Choose file"
                  />
                  <div className="image-upload-control">
                    <div className="btn btn-default" role="button" tabIndex={0}>
                      <i className="fas fa-file" aria-hidden="true"></i> Upload
                      File
                    </div>
                    <p style={{ padding: '0 10px', margin: 0 }}>
                      Select a file from your device.
                    </p>
                  </div>
                  {fileLoading && (
                    <div
                      className="spinner-border spinner-border-sm text-secondary position-absolute align-middle"
                      style={{ right: '16px' }}
                      role="status"
                      aria-label="Loading"
                    />
                  )}
                </div>
              )}

              {error && (
                <div
                  className="error-message"
                  role="alert"
                  style={{ color: 'red', marginTop: '8px' }}
                >
                  {error}
                </div>
              )}

              {fileUpload && (
                <div>
                  <div className="file-upload-preview">
                    <div
                      style={{ display: 'inline-block', marginRight: '5px' }}
                    >
                      {`File Name: ${fileUpload.fileName}`}
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
                      aria-label="Remove file"
                    >
                      <i className="fas fa-trash" aria-hidden="true"></i>
                    </button>
                  </div>

                  {this.state.fileStatus === 'success' && (
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
                        role="status"
                      >
                        File uploaded successfully
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

class MultiFileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileUpload: [
        {
          fileData: null,
          fileName: null,
          isLoading: false,
        },
      ],
      error: '',
    };
  }

  componentDidMount() {
    if (this.props.defaultValue) {
      const fileUpload = this.props.defaultValue.map((file) => ({
        ...file,
        isLoading: false,
      }));
      this.setState({ fileUpload });
    }
  }

  getBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

  uploadFile = async (file, index) => {
    try {
      this.setState((prevState) => {
        const fileUpload = [...prevState.fileUpload];
        fileUpload[index] = {
          ...fileUpload[index],
          isLoading: true,
        };
        return { fileUpload, error: '' };
      });

      const data = {
        fileName: file.name,
        base64: await this.getBase64(file),
        ext: `.${file.name.split('.').pop()}`,
      };

      const response = await fetch(
        'https://api.dev.workflow.kusala.com.ng/api/v1/FileUpload/upload-document',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      this.setState({ error: error.message || 'Unable to upload file' });
      return null;
    } finally {
      this.setState((prevState) => {
        const fileUpload = [...prevState.fileUpload];
        fileUpload[index] = {
          ...fileUpload[index],
          isLoading: false,
        };
        return { fileUpload };
      });
    }
  };

  handleFileUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedFile = await this.uploadFile(file, index);
    if (uploadedFile) {
      this.setState((prevState) => {
        const fileUpload = [...prevState.fileUpload];
        fileUpload[index] = {
          fileData: uploadedFile,
          fileName: file.name,
          isLoading: false,
        };
        return { fileUpload };
      });
    }
  };

  addFileInput = () => {
    this.setState((prevState) => ({
      fileUpload: [
        ...prevState.fileUpload,
        { fileData: null, fileName: null, isLoading: false },
      ],
    }));
  };

  clearFileUpload = (index) => {
    this.setState((prevState) => {
      const fileUpload = [...prevState.fileUpload];
      fileUpload[index] = { fileData: null, fileName: null, isLoading: false };
      return { fileUpload };
    });
  };

  removeFileInput = (index) => {
    if (this.state.fileUpload.length <= 1) return;

    this.setState((prevState) => ({
      fileUpload: prevState.fileUpload.filter((_, i) => i !== index),
    }));
  };

  saveFile = (e, fileUrl) => {
    e.preventDefault();
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      console.error('File URL is missing!');
    }
  };

  renderReadOnlyView() {
    const { defaultValue } = this.props;
    return (
      <div className="d-grid gap-3" style={{ rowGap: '12px', display: 'grid' }}>
        {defaultValue.map((file, index) => (
          <div key={index} className="">
            <div className="text-capitalize form-control mb-1">
              {file.fileData?.fileName}
            </div>

            <UniversalFileViewer
              fileName={file?.fileData?.fileName}
              fileUrl={file?.fileData?.url}
            />
          </div>
        ))}
      </div>
    );
  }

  renderFileInput(file, index) {
    const { read_only } = this.props;

    return (
      <div key={index} className="d-flex align-items-center gap-3 mb-3">
        <div className="flex-grow-1 position-relative image-upload-control">
          <input
            type="file"
            onChange={(e) => this.handleFileUpload(e, index)}
            disabled={file?.isLoading || read_only}
            accept="*"
            className="d-none"
            id={`fileInput-${index}`}
          />
          <label
            htmlFor={`fileInput-${index}`}
            className=" d-flex align-items-center cursor-pointer mb-0 flex-grow-1"
            style={{ flex: 1 }}
          >
            <span className="btn btn-default mr-3">
              <i className="fas fa-upload me-2"></i> Upload
            </span>
            <span className="text-muted">
              {file?.fileName || 'Select a file from your device'}
            </span>
            {file?.isLoading && (
              <div
                className="spinner-border spinner-border-sm text-secondary position-absolute"
                style={{ right: '1rem' }}
                role="status"
                aria-label="Loading"
              />
            )}
          </label>
          <div className="d-flex gap-2" style={{ columnGap: '10px' }}>
            {file?.fileData && !file?.isLoading && (
              <button
                type="button"
                onClick={() => this.clearFileUpload(index)}
                className=" btn-file-upload-clear"
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  border: 'none',
                }}
                aria-label="Clear file"
                title="Clear file"
              >
                <i className="fas fa-trash"></i>
              </button>
            )}

            {this.state?.fileUpload?.length > 1 && !file?.isLoading && (
              <button
                type="button"
                onClick={() => this.removeFileInput(index)}
                className=" btn-file-upload-clear"
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  border: 'none',
                }}
                aria-label="Remove input"
                title="Remove input"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { fileUpload, error } = this.state;
    const { style, data, read_only, defaultValue } = this.props;

    const baseClasses = `SortableItem rfb-item${
      data.pageBreakBefore ? ' alwaysbreak' : ''
    }`;

    return (
      <div style={style} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />

          {read_only && defaultValue ? (
            this.renderReadOnlyView()
          ) : (
            <div className="mb-3">
              {fileUpload.map((file, index) => this.renderFileInput(file, index))}

              <button
                type="button"
                onClick={this.addFileInput}
                className="btn btn-link btn-sm py-0 text-decoration-none"
              >
                <i className="fas fa-plus mr-2"></i>
                Add File
              </button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
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
FormElements.AmountInput = AmountInput;
FormElements.DocumentSelect = DocumentSelect;
FormElements.TableInput = TableInput;
FormElements.DynamicMultiInput = DynamicMultiInput;
FormElements.MultiFileUpload = MultiFileUpload;
FormElements.PasswordInput = PasswordInput;
FormElements.EmailInput = EmailInput;
FormElements.PhoneNumber = PhoneNumber;
FormElements.NumberInput = NumberInput;
FormElements.TextArea = TextArea;
FormElements.Dropdown = Dropdown;
FormElements.SmartAdaptorDropdown = SmartAdaptorDropdown;
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
