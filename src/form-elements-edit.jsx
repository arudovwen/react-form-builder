import React from 'react';
import TextAreaAutosize from 'react-textarea-autosize';
import {
  ContentState,
  EditorState,
  convertFromHTML,
  convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import axios from 'axios';

import ReactDatePicker from 'react-datepicker';
import DynamicOptionList from './dynamic-option-list';
import { get } from './stores/requests';
import { FileTypes } from './data';
import ID from './UUID';
import IntlMessages from './language-provider/IntlMessages';
import ApiExample from './ApiExample';
import TableInputColumn from './TableInputColumns';
import DynamicInputOptionList from './DynamicInputOptions';
import FileReaderComponent from './FileReaderComponent';

import OptionCreateList from './OptionsCreate';
import OptionCreateApi from './OptionsCreateApi';
import OptionsExample from './OptionsExample';
import MultiSelectInput from './MultiSelectInput';
import DataGridOptions from './data-grid-options';
import MultiSelectValue from './MultiSelectValue';
import ArithmeticComponent from './form-elements/ArithmeticComponent';

const toolbar = {
  options: ['inline', 'list', 'textAlign', 'fontSize', 'link', 'history'],
  inline: {
    inDropdown: false,
    className: undefined,
    options: ['bold', 'italic', 'underline', 'superscript', 'subscript'],
  },
};
const dateFormats = [
  { label: 'Day/Month/Year', format: 'dd/MM/yyyy' },
  { label: 'Month/Day/Year', format: 'MM/dd/yyyy' },
  { label: 'ISO (Year-Month-Day)', format: 'yyyy-MM-dd' },
  { label: 'Full Month Day, Year', format: 'MMMM d, yyyy' },
  { label: 'Abbreviated Month Day, Year', format: 'MMM d, yyyy' },
  { label: 'Day. Month. Year (Dots)', format: 'dd.MM.yyyy' },
  { label: 'Day Month Name Year', format: 'dd MMMM yyyy' },
  { label: 'Weekday, Month Day, Year', format: 'EEEE, MMMM d, yyyy' },
  { label: 'Short Weekday, Month Day, Year', format: 'EEE, MMM d, yyyy' },
  { label: 'Day-Month-Year', format: 'dd-MM-yyyy' },
];
 const currentDate = new Date();
export default class FormElementsEdit extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    
    this.state = {
      element: this.props.element,
      data: this.props.data,
      dirty: false,
      fileLoading: false,
      documents: [],
      multiFieldOptions: this.props.formData.filter(
        (i) => i.id !== this.props.element.id,
      ),
    };
    this.getDocuments = this.getDocuments.bind(this);
  }

  getDocuments = async () => {
    try {
      const token = window.localStorage.getItem('token');
      const localData = window.localStorage.getItem('userData');
      const userData = localData ? JSON.parse(localData) : null;
      const LoginInfo = window.localStorage.getItem('LoginInfo');
      const loginData = LoginInfo ? JSON.parse(LoginInfo) : null;
      this.setState({ fileLoading: true });
      const query = {
        Page: 1,
        Page_Size: 15,
        count: 100000,
        documentType: 0,
        organizationId: userData?.id,
        documentTabs: 2,
      };
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // a4368688-3294-412e-a516-7e1bde2c32a6
      // if (!token) return;
      const url = `${this.props.apiBaseUrl}/documents/v1/documentmanagement/get-documents-inbox?email=${loginData?.email}`;
      const response = await axios.post(url, query, config);
      if (response.status === 200) {
        this.setState({
          documents: response.data.results?.map((i) => ({
            label: i?.title,
            value: i?.documentMainId,
          })),
        });
      }
    } finally {
      this.setState({ fileLoading: false });
    }
  };

  toggleRequired() {
    // const this_element = this.state.element;
  }

  editElementProp(elemProperty, targProperty, e) {
    // console.log(elemProperty);
    // console.log(targProperty);
    // console.log(e);

    const this_element = this.state.element;
    // Check if e is an event or direct value
    if (e && e.target) {
      this_element[elemProperty] = e.target[targProperty];
    } else {
      // Handle case where e is the direct value (like from TableInputColumn)
      this_element[targProperty] = e;
    }

    this.setState(
      {
        element: this_element,
        dirty: true,
      },
      () => {
        if (targProperty === 'checked') {
          this.updateElement();
        }
      },
    );
  }

  onEditorStateChange(index, property, editorContent) {
    // const html = draftToHtml(convertToRaw(editorContent.getCurrentContent())).replace(/<p>/g, '<div>').replace(/<\/p>/g, '</div>');
    const html = draftToHtml(convertToRaw(editorContent.getCurrentContent()))
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/(?:\r\n|\r|\n)/g, ' ');
    const this_element = this.state.element;
    this_element[property] = html;

    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  updateElement() {
    const this_element = this.state.element;
    // to prevent ajax calls with no change
    if (this.state.dirty) {
      this.props.updateElement.call(this.props.preview, this_element);
      this.setState({ dirty: false });
    }
  }

  updateJsonElement = () => {
    const this_element = JSON.stringify(this.state.element);
    // to prevent ajax calls with no change
    if (this.state.dirty) {
      this.props.updateElement.call(this.props.preview, this_element);
      this.setState({ dirty: false });
    }
  };

  convertFromHTML(content) {
    const newContent = convertFromHTML(content);
    if (!newContent.contentBlocks || !newContent.contentBlocks.length) {
      // to prevent crash when no contents in editor
      return EditorState.createEmpty();
    }
    const contentState = ContentState.createFromBlockArray(newContent);
    return EditorState.createWithContent(contentState);
  }

  addOptions() {
    const optionsApiUrl = document.getElementById('optionsApiUrl').value;

    if (optionsApiUrl) {
      get(optionsApiUrl).then((response) => {
        this.props.element.options = [];
        const { options } = this.props.element;
        (response.data || response)?.forEach((x) => {
          // eslint-disable-next-line no-param-reassign
          x.id = ID.uuid();
          options.push(x);
        });
        const this_element = this.state.element;
        this.setState({
          element: this_element,
          dirty: true,
        });
      });
    }
  }

  addOptionsFromSheet(data) {
    const { options } = this.props.element;
    data.forEach((x) => {
      // eslint-disable-next-line no-param-reassign
      x.id = ID.uuid();
      options.push(x);
    });
    const this_element = this.state.element;
    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  componentDidMount() {
    this.getDocuments();
  }

  render() {
    if (this.state.dirty) {
      this.props.element.dirty = true;
    }

    const this_checked = this.props.element.hasOwnProperty('required')
      ? this.props.element.required
      : false;
    // const this_read_only = this.props.element.hasOwnProperty('readOnly')
    //   ? this.props.element.readOnly
    //   : false;

    const this_is_read_only = this.props.element.hasOwnProperty('isReadOnly')
      ? this.props.element.isReadOnly
      : false;
    const this_default_today = this.props.element.hasOwnProperty('defaultToday')
      ? this.props.element.defaultToday
      : false;
    const this_show_time_select = this.props.element.hasOwnProperty(
      'showTimeSelect',
    )
      ? this.props.element.showTimeSelect
      : false;
    const this_show_time_select_only = this.props.element.hasOwnProperty(
      'showTimeSelectOnly',
    )
      ? this.props.element.showTimeSelectOnly
      : false;
    const this_show_time_input = this.props.element.hasOwnProperty(
      'showTimeInput',
    )
      ? this.props.element.showTimeInput
      : false;
    const this_hide_past_date = this.props.element.hasOwnProperty(
      'hidePastDate',
    )
      ? this.props.element.hidePastDate
      : false;
    const this_hide_future_date = this.props.element.hasOwnProperty(
      'hideFutureDate',
    )
      ? this.props.element.hideFutureDate
      : false;
    const this_checked_inline = this.props.element.hasOwnProperty('inline')
      ? this.props.element.inline
      : false;
    const this_checked_bold = this.props.element.hasOwnProperty('bold')
      ? this.props.element.bold
      : false;
    const this_checked_italic = this.props.element.hasOwnProperty('italic')
      ? this.props.element.italic
      : false;
    const this_checked_center = this.props.element.hasOwnProperty('center')
      ? this.props.element.center
      : false;
    // const this_checked_page_break = this.props.element.hasOwnProperty(
    //   'pageBreakBefore',
    // )
    //   ? this.props.element.pageBreakBefore
    //   : false;

    const this_checked_toggle_password = this.props.element.hasOwnProperty(
      'togglePassword',
    )
      ? this.props.element.togglePassword
      : false;

    const this_checked_toggle_negative = this.props.element.hasOwnProperty(
      'toggleNegative',
    )
      ? this.props.element.toggleNegative
      : false;

    const this_checked_toggle_vibility = this.props.element.hasOwnProperty(
      'toggleVisibility',
    )
      ? this.props.element.toggleVisibility
      : false;

    const this_checked_is_cascade = this.props.element.hasOwnProperty(
      'isCascade',
    )
      ? this.props.element.isCascade
      : false;

    // const this_checked_alternate_form = this.props.element.hasOwnProperty(
    //   'alternateForm',
    // )
    //   ? this.props.element.alternateForm
    //   : false;

    const {
      canHavePageBreakBefore,
      // canHaveAlternateForm,
      canHaveDisplayHorizontal,
      canHaveOptionCorrect,
      canHaveOptionValue,
    } = this.props.element;
    const canHaveImageSize =
      this.state.element.element === 'Image' ||
      this.state.element.element === 'Camera';

    const this_files = this.props.files.length ? this.props.files : [];
    if (
      this_files.length < 1 ||
      (this_files.length > 0 && this_files[0].id !== '')
    ) {
      this_files.unshift({ id: '', file_name: '' });
    }

    let editorState;
    if (this.props.element.hasOwnProperty('content')) {
      editorState = this.convertFromHTML(this.props.element.content);
    }
    if (this.props.element.hasOwnProperty('label')) {
      editorState = this.convertFromHTML(this.props.element.label);
    }

    return (
      <div>
        <div className="clearfix">
          <h4 className="float-left">{this.props.element.text}</h4>
          <i
            className="float-right fas fa-times dismiss-edit"
            onClick={this.props.manualEditModeOff}
          ></i>
        </div>
        {this.props.element.hasOwnProperty('content') && (
          <div className="form-group">
            <label className="control-label">
              <IntlMessages id="text-to-display" />:
            </label>

            <Editor
              toolbar={toolbar}
              defaultEditorState={editorState}
              onBlur={this.updateElement.bind(this)}
              onEditorStateChange={this.onEditorStateChange.bind(
                this,
                0,
                'content',
              )}
              stripPastedStyles={true}
            />
          </div>
        )}
        {this.props.element.hasOwnProperty('file_path') && (
          <div className="form-group">
            <label className="control-label" htmlFor="fileSelect">
              <IntlMessages id="choose-file" />:
            </label>
            <select
              id="fileSelect"
              className="form-control"
              defaultValue={this.props.element.file_path}
              onBlur={this.updateElement.bind(this)}
              onChange={this.editElementProp.bind(this, 'file_path', 'value')}
            >
              {this_files.map((file) => {
                const this_key = `file_${file.id}`;
                return (
                  <option value={file.id} key={this_key}>
                    {file.file_name}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        {this.props.element.hasOwnProperty('href') && (
          <div className="form-group">
            <TextAreaAutosize
              type="text"
              className="form-control"
              defaultValue={this.props.element.href}
              onBlur={this.updateElement.bind(this)}
              onChange={this.editElementProp.bind(this, 'href', 'value')}
            />
          </div>
        )}
        {this.props.element.hasOwnProperty('label') && (
          <div className="form-group">
            <label>
              <IntlMessages id="display-label" />
            </label>
            <Editor
              toolbar={toolbar}
              defaultEditorState={editorState}
              onBlur={this.updateElement.bind(this)}
              onEditorStateChange={this.onEditorStateChange.bind(
                this,
                0,
                'label',
              )}
              stripPastedStyles={true}
              height={100}
            />
            <br />
            <div className="custom-control custom-checkbox">
              <input
                id="is-required"
                className="custom-control-input"
                type="checkbox"
                checked={this_checked}
                value={true}
                onChange={this.editElementProp.bind(
                  this,
                  'required',
                  'checked',
                )}
              />
              <label className="custom-control-label" htmlFor="is-required">
                <IntlMessages id="required" />
              </label>
            </div>
            {/* {this.props.element.hasOwnProperty('readOnly') && (
              <div className="custom-control custom-checkbox">
                <input
                  id="is-read-only"
                  className="custom-control-input"
                  type="checkbox"
                  checked={this_read_only}
                  value={true}
                  onChange={this.editElementProp.bind(
                    this,
                    'readOnly',
                    'checked',
                  )}
                />
                <label className="custom-control-label" htmlFor="is-read-only">
                  <IntlMessages id="read-only" />
                </label>
              </div>
            )} */}
            {this.props.element.hasOwnProperty('isReadOnly') && (
              <div className="custom-control custom-checkbox">
                <input
                  id="read-only"
                  className="custom-control-input"
                  type="checkbox"
                  checked={this_is_read_only}
                  value={true}
                  onChange={this.editElementProp.bind(
                    this,
                    'isReadOnly',
                    'checked',
                  )}
                />
                <label className="custom-control-label" htmlFor="read-only">
                  <IntlMessages id="read-only" />
                </label>
              </div>
            )}
            {this.props.element.hasOwnProperty('defaultToday') && (
              <div className="custom-control custom-checkbox">
                <input
                  id="is-default-to-today"
                  className="custom-control-input"
                  type="checkbox"
                  checked={this_default_today}
                  value={true}
                  onChange={this.editElementProp.bind(
                    this,
                    'defaultToday',
                    'checked',
                  )}
                />
                <label
                  className="custom-control-label"
                  htmlFor="is-default-to-today"
                >
                  <IntlMessages id="default-to-today" />?
                </label>
              </div>
            )}
            {this.props.element.hasOwnProperty('showTimeSelect') && (
              <div className="custom-control custom-checkbox">
                <input
                  id="show-time-select"
                  className="custom-control-input"
                  type="checkbox"
                  checked={this_show_time_select}
                  value={true}
                  onChange={this.editElementProp.bind(
                    this,
                    'showTimeSelect',
                    'checked',
                  )}
                />
                <label
                  className="custom-control-label"
                  htmlFor="show-time-select"
                >
                  <IntlMessages id="show-time-select" />?
                </label>
              </div>
            )}

            {this_show_time_select &&
              this.props.element.hasOwnProperty('showTimeSelectOnly') && (
                <div className="custom-control custom-checkbox">
                  <input
                    id="show-time-select-only"
                    className="custom-control-input"
                    type="checkbox"
                    checked={this_show_time_select_only}
                    value={true}
                    onChange={this.editElementProp.bind(
                      this,
                      'showTimeSelectOnly',
                      'checked',
                    )}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="show-time-select-only"
                  >
                    <IntlMessages id="show-time-select-only" />?
                  </label>
                </div>
              )}
            {this.props.element.hasOwnProperty('showTimeInput') && (
              <div className="custom-control custom-checkbox">
                <input
                  id="show-time-input"
                  className="custom-control-input"
                  type="checkbox"
                  checked={this_show_time_input}
                  value={true}
                  onChange={this.editElementProp.bind(
                    this,
                    'showTimeInput',
                    'checked',
                  )}
                />
                <label
                  className="custom-control-label"
                  htmlFor="show-time-input"
                >
                  <IntlMessages id="show-time-input" />?
                </label>
              </div>
            )}
            {this.props.element.hasOwnProperty('hidePastDate') && (
              <div className="custom-control custom-checkbox">
                <input
                  id="hidePastDate"
                  className="custom-control-input"
                  type="checkbox"
                  checked={this_hide_past_date}
                  value={true}
                  onChange={this.editElementProp.bind(
                    this,
                    'hidePastDate',
                    'checked',
                  )}
                />
                <label className="custom-control-label" htmlFor="hidePastDate">
                  Hide Past date
                </label>
              </div>
            )}
            {this.props.element.hasOwnProperty('hideFutureDate') && (
              <div className="custom-control custom-checkbox">
                <input
                  id="hideFutureDate"
                  className="custom-control-input"
                  type="checkbox"
                  checked={this_hide_future_date}
                  value={true}
                  onChange={this.editElementProp.bind(
                    this,
                    'hideFutureDate',
                    'checked',
                  )}
                />
                <label
                  className="custom-control-label"
                  htmlFor="hideFutureDate"
                >
                  Hide Future date
                </label>
              </div>
            )}
            {(this.state.element.element === 'RadioButtons' ||
              this.state.element.element === 'Checkboxes') &&
              canHaveDisplayHorizontal && (
                <div className="custom-control custom-checkbox">
                  <input
                    id="display-horizontal"
                    className="custom-control-input"
                    type="checkbox"
                    checked={this_checked_inline}
                    value={true}
                    onChange={this.editElementProp.bind(
                      this,
                      'inline',
                      'checked',
                    )}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="display-horizontal"
                  >
                    <IntlMessages id="display-horizontal" />
                  </label>
                </div>
              )}
          </div>
        )}
        {this.props.element.hasOwnProperty('src') && (
          <div>
            <div className="form-group">
              <label className="control-label" htmlFor="srcInput">
                <IntlMessages id="link-to" />:
              </label>
              <input
                id="srcInput"
                type="text"
                className="form-control"
                defaultValue={this.props.element.src}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'src', 'value')}
              />
            </div>
          </div>
        )}
        {canHaveImageSize && (
          <div>
            <div className="form-group">
              <div className="custom-control custom-checkbox">
                <input
                  id="do-center"
                  className="custom-control-input"
                  type="checkbox"
                  checked={this_checked_center}
                  value={true}
                  onChange={this.editElementProp.bind(
                    this,
                    'center',
                    'checked',
                  )}
                />
                <label className="custom-control-label" htmlFor="do-center">
                  <IntlMessages id="center" />?
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-3">
                <label className="control-label" htmlFor="elementWidth">
                  <IntlMessages id="width" />:
                </label>
                <input
                  id="elementWidth"
                  type="text"
                  className="form-control"
                  defaultValue={this.props.element.width}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editElementProp.bind(this, 'width', 'value')}
                />
              </div>
              <div className="col-sm-3">
                <label className="control-label" htmlFor="elementHeight">
                  <IntlMessages id="height" />:
                </label>
                <input
                  id="elementHeight"
                  type="text"
                  className="form-control"
                  defaultValue={this.props.element.height}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editElementProp.bind(this, 'height', 'value')}
                />
              </div>
            </div>
          </div>
        )}
        {(this.state.element.element === 'FileUpload' ||
          this.state.element.element === 'MultiFileUpload') && (
          <div>
            <div className="form-group">
              <label className="control-label" htmlFor="fileType">
                <IntlMessages id="choose-file-type" />:
              </label>
              <select
                id="fileType"
                className="form-control"
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'fileType', 'value')}
                value={this.props.element.fileType}
              >
                {FileTypes.map((file, index) => (
                  <option value={file.type} key={index}>
                    {file.typeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {this.state.element.element === 'Signature' &&
        this.props.element.readOnly ? (
          <div className="form-group">
            <label className="control-label" htmlFor="variableKey">
              <IntlMessages id="variable-key" />:
            </label>
            <input
              id="variableKey"
              type="text"
              className="form-control"
              defaultValue={this.props.element.variableKey}
              onBlur={this.updateElement.bind(this)}
              onChange={this.editElementProp.bind(this, 'variableKey', 'value')}
            />
            <p className="help-block">
              <IntlMessages id="variable-key-desc" />.
            </p>
          </div>
        ) : (
          <div />
        )}
        {/* {canHavePageBreakBefore && (
          <div className="form-group">
            <label className="control-label">
              <IntlMessages id="print-options" />
            </label>
            <div className="custom-control custom-checkbox">
              <input
                id="page-break-before-element"
                className="custom-control-input"
                type="checkbox"
                checked={this_checked_page_break}
                value={true}
                onChange={this.editElementProp.bind(
                  this,
                  'pageBreakBefore',
                  'checked',
                )}
              />
              <label
                className="custom-control-label"
                htmlFor="page-break-before-element"
              >
                <IntlMessages id="page-break-before-elements" />?
              </label>
            </div>
          </div>
        )} */}
        {/* {canHaveAlternateForm && (
          <div className="form-group">
            <label className="control-label">
              <IntlMessages id="alternate-signature-page" />
            </label>
            <div className="custom-control custom-checkbox">
              <input
                id="display-on-alternate"
                className="custom-control-input"
                type="checkbox"
                checked={this_checked_alternate_form}
                value={true}
                onChange={this.editElementProp.bind(
                  this,
                  'alternateForm',
                  'checked',
                )}
              />
              <label
                className="custom-control-label"
                htmlFor="display-on-alternate"
              >
                <IntlMessages id="display-on-alternate-signature-page" />?
              </label>
            </div>
          </div>
        )} */}
        {this.props.element.hasOwnProperty('step') && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeStep">
                <IntlMessages id="step" />
              </label>
              <input
                id="rangeStep"
                type="number"
                className="form-control"
                defaultValue={this.props.element.step}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'step', 'value')}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('min_value') && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeMin">
                <IntlMessages id="min" />
              </label>
              <input
                id="rangeMin"
                type="number"
                className="form-control"
                defaultValue={this.props.element.min_value}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'min_value', 'value')}
              />
              <input
                type="text"
                className="form-control"
                defaultValue={this.props.element.min_label}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'min_label', 'value')}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('max_value') && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeMax">
                <IntlMessages id="max" />
              </label>
              <input
                id="rangeMax"
                type="number"
                className="form-control"
                defaultValue={this.props.element.max_value}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'max_value', 'value')}
              />
              <input
                type="text"
                className="form-control"
                defaultValue={this.props.element.max_label}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'max_label', 'value')}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 date_range gap-x-3">
          {this.props.element.hasOwnProperty('canHaveMinLength') && (
            <div className="form-group">
              <div className="form-group-range">
                <label className="control-label text-13" htmlFor="minLength">
                  Min Length
                </label>
                <input
                  type="number"
                  style={{ width: '100%' }}
                  className="!w-full form-control text-sm"
                  defaultValue={this.props.element.minLength}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editElementProp.bind(
                    this,
                    'minLength',
                    'value',
                  )}
                />
              </div>
            </div>
          )}
          {this.props.element.hasOwnProperty('canHaveMaxLength') && (
            <div className="form-group">
              <div className="form-group-range">
                <label className="control-label text-13" htmlFor="maxLength">
                  Max Length
                </label>
                <input
                  type="number"
                  style={{ width: '100%' }}
                  className="!w-full form-control text-sm"
                  defaultValue={this.props.element.maxLength}
                  min={this.props.element.minLength}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editElementProp.bind(
                    this,
                    'maxLength',
                    'value',
                  )}
                />
              </div>
            </div>
          )}
        </div>
        {this.props.element.hasOwnProperty('canTogglePassword') && (
          <div className="form-group">
            <div className="custom-control custom-checkbox">
              <input
                id="toggle-password"
                className="custom-control-input"
                type="checkbox"
                checked={this_checked_toggle_password}
                value={true}
                onChange={this.editElementProp.bind(
                  this,
                  'togglePassword',
                  'checked',
                )}
              />
              <label className="custom-control-label" htmlFor="toggle-password">
                Can Toggle Password
              </label>
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('canToggleNegative') && (
          <div className="form-group">
            <div className="custom-control custom-checkbox">
              <input
                id="toggle-negative"
                className="custom-control-input"
                type="checkbox"
                checked={this_checked_toggle_negative}
                value={true}
                onChange={this.editElementProp.bind(
                  this,
                  'toggleNegative',
                  'checked',
                )}
              />
              <label className="custom-control-label" htmlFor="toggle-negative">
                Can Allow Negative
              </label>
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('canMapFields') && (
          <div className="mb-2 ">
            <div className="form-group">
              <label className="control-label text-13" htmlFor="documentId">
                Select Mapped Fields
              </label>

              <MultiSelectInput
                element={this.props.element}
                options={this.state.multiFieldOptions}
                value={this.props.element.mappedFields || []}
                onChange={(newValues) => {
                  this.editElementProp(this, 'mappedFields', newValues);
                }}
              />
            </div>
            <div>
              {this.props.element.hasOwnProperty('haveArithmetic') && (
                <div>
                  <ArithmeticComponent
                    mappedFields={this.props.element.mappedFields || []}
                    calculationFields={
                      this.props.element.calculationFields || []
                    }
                    onChangeCalculationFields={(newValues) => {
                      this.editElementProp(
                        this,
                        'calculationFields',
                        newValues,
                      );
                    }}
                    isEditing
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('canToggleField') && (
          <div className="">
            <div className="mt-2 mb-3 custom-control custom-checkbox">
              <input
                id="toggle-field-visibility"
                className="custom-control-input"
                type="checkbox"
                checked={this_checked_toggle_vibility}
                onChange={this.editElementProp.bind(
                  this,
                  'toggleVisibility',
                  'checked',
                )}
              />
              <label
                className="custom-control-label"
                htmlFor="toggle-field-visibility"
              >
                Toggle Field Visibility
              </label>
            </div>
            {this_checked_toggle_vibility && (
              <div className="form-group">
                <label className="control-label text-13" htmlFor="toggeIds">
                  Dependent Fields/Values
                </label>

                <MultiSelectValue
                  element={this.props.element}
                  options={this.state.multiFieldOptions}
                  value={this.props.element.visibilityFields || []}
                  onChange={(newValues) => {
                    this.editElementProp(this, 'visibilityFields', newValues);
                  }}
                />
              </div>
            )}
          </div>
        )}
        {this.props.element.hasOwnProperty('canUseCascade') && (
          <div className="">
            <div className="mt-2 mb-3 custom-control custom-checkbox">
              <input
                id="is-cascade"
                className="custom-control-input"
                type="checkbox"
                checked={this_checked_is_cascade}
                onChange={this.editElementProp.bind(
                  this,
                  'isCascade',
                  'checked',
                )}
              />
              <label className="custom-control-label" htmlFor="is-cascade">
                Use Cascade
              </label>
            </div>
            {this_checked_is_cascade && (
              <div className="form-group">
                <label className="control-label text-13" htmlFor="toggeIds">
                  Dependent Field
                </label>

                <select
                  className="form-control"
                  value={this.props.element.method}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editElementProp.bind(
                    this,
                    'dependentField',
                    'value',
                  )}
                >
                  <option value="">Select field</option>
                  {this.state.multiFieldOptions.map((item, index) => (
                    <option key={index} value={item.field_name}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        {this.props.element.hasOwnProperty('canMakeApiValidation') && (
          <div className="">
            <div className="mb-4">
              <ApiExample />
            </div>
            <div className="form-group">
              <label className="control-label text-13" htmlFor="url">
                Api Url
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue={this.props.element.url}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'url', 'value')}
              />
            </div>
            <div className="form-group">
              <label className="control-label text-13" htmlFor="url">
                File Retrieval Api Url (optional)
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue={this.props.element.fileUrl}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'fileUrl', 'value')}
              />
            </div>
            <div className="form-group">
              <label className="control-label text-13" htmlFor="method">
                Method
              </label>

              <select
                className="form-control"
                defaultValue={this.props.element.method}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'method', 'value')}
              >
                <option value="get">GET</option>
                <option value="post">POST</option>
              </select>
            </div>
            <div className="form-group">
              <label className="control-label text-13" htmlFor="responseType">
                Response Type
              </label>

              <select
                className="form-control"
                defaultValue={this.props.element.responseType}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(
                  this,
                  'responseType',
                  'value',
                )}
              >
                <option value="string">String</option>
                <option value="object">Object</option>
              </select>
            </div>
            <div className="form-group">
              <label className="control-label text-13" htmlFor="apiKey">
                <span>
                  {' '}
                  Authorization Key{' '}
                  <span className="text-muted">(Optional)</span>
                </span>
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue={this.props.element.apiKey}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'apiKey', 'value')}
              />
            </div>

            {/* <div className="form-group">
              <label className="control-label text-13" htmlFor="apiResponse">
                Api Response
              </label>
              <textarea
                rows={4}
                type="text"
                className="form-control"
                defaultValue={this.props.element.apiResponse}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(
                  this,
                  'apiResponse',
                  'value',
                )}
              />
            </div> */}
          </div>
        )}
        {this.props.element.hasOwnProperty('canSelectDocuments') && (
          <div className="">
            <div className="form-group">
              <label className="control-label text-13" htmlFor="documentId">
                Choose a document
              </label>

              <select
                id="documentId"
                className="form-control"
                value={this.props.element.documentId}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(
                  this,
                  'documentId',
                  'value',
                )}
              >
                <option value={null}>
                  {this.state.fileLoading
                    ? 'Fetching documents...'
                    : 'Select document'}
                </option>
                {this.state.documents?.map((item) => (
                  <option key={item.value} value={JSON.stringify(item)}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('minDate') ||
        this.props.element.hasOwnProperty('maxDate') ? (
          <div className="form-group">
            {(!this.props.element.hidePastDate ||
              !this.props.element.hideFutureDate) && (
              <label className="control-label text-13">Date Range </label>
            )}
            <div className="grid grid-cols-2 date_range gap-x-3">
              {!this.props.element.hidePastDate && (
                <div>
                  {' '}
                  <ReactDatePicker
                    onChange={(newValues) => {
                      this.editElementProp(this, 'minDate', newValues);
                    }}
                    name="minDate"
                    selected={this.props.element.minDate}
                    className="form-control"
                    isClearable
                    placeholderText="Min Date Value"
                  />
                </div>
              )}
              {!this.props.element.hideFutureDate && (
                <div>
                  {' '}
                  <ReactDatePicker
                    onChange={(newValues) => {
                      this.editElementProp(this, 'maxDate', newValues);
                    }}
                    name="maxDate"
                    selected={this.props.element.maxDate}
                    minDate={this.props.element.hidePastDate ? currentDate : this.props.element.minDate}
                    className="form-control"
                    isClearable
                    placeholderText="Max Date Value"
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}
        {this.props.element.hasOwnProperty('canSelectDateFormat') && (
          <div className="">
            <div className="form-group">
              <label className="control-label text-13">
                Choose a date format
              </label>

              <select
                id="dateFormat"
                className="form-control"
                value={this.props.element.documentId}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(
                  this,
                  'dateFormat',
                  'value',
                )}
              >
                {dateFormats?.map((item) => (
                  <option key={item.format} value={item.format}>
                    {item.label} ({item.format})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('canHaveDenonimator') && (
          <div className="">
            <div className="form-group">
              {/* <label className="control-label text-13" htmlFor="documentId">
                Add Denominator
              </label> */}
              <TableInputColumn
                value={this.props.element.denominators || []}
                onChange={(newValues) => {
                  this.editElementProp(this, 'denominators', newValues);
                }}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('canHaveDynamicInputOptions') && (
          <div className="">
            <div className="form-group">
              <label
                className="control-label text-13"
                htmlFor="dynamicInputOptions"
              >
                Add Inputs Key/Label
              </label>
              <DynamicInputOptionList
                initialFields={this.props.element.dynamicInputOptions}
                onChange={(newValues) => {
                  this.editElementProp(this, 'dynamicInputOptions', newValues);
                }}
              />
            </div>
          </div>
        )}{' '}
        {this.props.element.hasOwnProperty('canHaveDataColumns') && (
          <div className="">
            <div className="form-group">
              <label
                className="control-label text-13"
                htmlFor="dynamicInputOptions"
              >
                Add Data Columns
              </label>
              <DataGridOptions
                value={this.props.element.dataColumns}
                onChange={(newValues) => {
                  this.editElementProp(this, 'dataColumns', newValues);
                }}
                onGetUrl={(url) => {
                  this.editElementProp(this, 'url', url);
                }}
              />
            </div>
          </div>
        )}{' '}
        {this.props.element.hasOwnProperty('canHandleMultiOptions') && (
          <div className="">
            <div className="form-group">
              <label className="control-label text-13" htmlFor="firstLabel">
                First DropDown Detail
              </label>
              <input
                id="firstLabel"
                className="input-style"
                defaultValue={this.props.element.firstLabel}
                placeholder="Enter First label"
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(
                  this,
                  'firstLabel',
                  'value',
                )}
              />
              <div className="mt-1">
                <OptionCreateApi
                  onChange={(newValues) => {
                    this.editElementProp(
                      this,
                      'firstDropdownOptions',
                      newValues,
                    );
                  }}
                />
              </div>
              <OptionCreateList
                hideKey
                initialFields={this.props.element.firstDropdownOptions}
                onChange={(newValues) => {
                  this.editElementProp(this, 'firstDropdownOptions', newValues);
                }}
              />
            </div>
            <div className="form-group">
              <label className="control-label text-13" htmlFor="secondLabel">
                Second DropDown Detail
              </label>
              <input
                id="secondLabel"
                className="input-style"
                defaultValue={this.props.element.secondLabel}
                placeholder="Enter Second label"
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(
                  this,
                  'secondLabel',
                  'value',
                )}
              />
              <div className="mt-1">
                <OptionCreateApi
                  onChange={(newValues) => {
                    this.editElementProp(
                      this,
                      'secondDropdownOptions',
                      newValues,
                    );
                  }}
                />
              </div>
              <OptionCreateList
                initialFields={this.props.element.secondDropdownOptions}
                onChange={(newValues) => {
                  this.editElementProp(
                    this,
                    'secondDropdownOptions',
                    newValues,
                  );
                }}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('default_value') && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="defaultSelected">
                <IntlMessages id="default-selected" />
              </label>
              <input
                id="defaultSelected"
                type="number"
                className="form-control"
                defaultValue={this.props.element.default_value}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(
                  this,
                  'default_value',
                  'value',
                )}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty('static') &&
          this.props.element.static && (
            <div className="form-group">
              <label className="control-label">
                <IntlMessages id="text-style" />
              </label>
              <div className="custom-control custom-checkbox">
                <input
                  id="do-bold"
                  className="custom-control-input"
                  type="checkbox"
                  checked={this_checked_bold}
                  value={true}
                  onChange={this.editElementProp.bind(this, 'bold', 'checked')}
                />
                <label className="custom-control-label" htmlFor="do-bold">
                  <IntlMessages id="bold" />
                </label>
              </div>
              <div className="custom-control custom-checkbox">
                <input
                  id="do-italic"
                  className="custom-control-input"
                  type="checkbox"
                  checked={this_checked_italic}
                  value={true}
                  onChange={this.editElementProp.bind(
                    this,
                    'italic',
                    'checked',
                  )}
                />
                <label className="custom-control-label" htmlFor="do-italic">
                  <IntlMessages id="italic" />
                </label>
              </div>
            </div>
          )}
        {this.props.element.showDescription && (
          <div className="form-group">
            <label className="control-label" htmlFor="questionDescription">
              <IntlMessages id="description" />
            </label>
            <TextAreaAutosize
              type="text"
              className="form-control"
              id="questionDescription"
              defaultValue={this.props.element.description}
              onBlur={this.updateElement.bind(this)}
              onChange={this.editElementProp.bind(this, 'description', 'value')}
            />
          </div>
        )}
        {this.props.showCorrectColumn &&
          this.props.element.canHaveAnswer &&
          !this.props.element.hasOwnProperty('options') && (
            <div className="form-group">
              <label className="control-label" htmlFor="correctAnswer">
                <IntlMessages id="correct-answer" />
              </label>
              <input
                id="correctAnswer"
                type="text"
                className="form-control"
                defaultValue={this.props.element.correct}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, 'correct', 'value')}
              />
            </div>
          )}
        {this.props.element.canPopulateFromApi &&
          this.props.element.hasOwnProperty('options') && (
            <div className="form-group">
              <label className="control-label" htmlFor="optionsApiUrl">
                <IntlMessages id="populate-options-from-api" />
              </label>
              <OptionsExample />
              <div className="row">
                <div className="col-sm-8">
                  <input
                    className="input-style"
                    style={{ width: '100%' }}
                    type="text"
                    id="optionsApiUrl"
                    onBlur={this.updateElement.bind(this)}
                    onChange={this.editElementProp.bind(
                      this,
                      'optionsApiUrl',
                      'value',
                    )}
                    placeholder="http://localhost:8080/api/optionsdata"
                  />
                </div>
                <div className="col-sm-4">
                  <button
                    onClick={this.addOptions.bind(this)}
                    className="button-style"
                  >
                    <IntlMessages id="populate" />
                  </button>
                </div>
              </div>
            </div>
          )}
        {this.props.element.canPopulateFromApi &&
          this.props.element.hasOwnProperty('options') && (
            <div className="form-group">
              <label className="control-label" htmlFor="optionsApiUrl">
                Populate from sheet (csv, xlsx)
              </label>

              <div className="row">
                <div className="col-sm-6">
                  <FileReaderComponent
                    name="options"
                    setValue={(name, value) => {
                      this.addOptionsFromSheet(value);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        {this.props.element.hasOwnProperty('options') && (
          <DynamicOptionList
            showCorrectColumn={this.props.showCorrectColumn}
            canHaveOptionCorrect={canHaveOptionCorrect}
            canHaveOptionValue={canHaveOptionValue}
            data={this.props.preview.state.data}
            updateElement={this.props.updateElement}
            preview={this.props.preview}
            element={this.props.element}
            key={this.props.element.options.length}
          />
        )}
      </div>
    );
  }
}
FormElementsEdit.defaultProps = { className: 'edit-element-fields' };
