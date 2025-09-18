import React from 'react';
import ReactDOM from 'react-dom';
import { EventEmitter } from 'fbemitter';
import { injectIntl } from 'react-intl';
import FormValidator from './form-validator';
import FormElements from './form-elements';
import { TwoColumnRow, ThreeColumnRow, MultiColumnRow } from './multi-column';
import { FieldSet } from './fieldset';
import CustomElement from './form-elements/custom-element';
import Registry from './stores/registry';
import ToggleFieldsContainer from './ToggleFieldsContainer';

const { Image, Checkboxes, Signature, Download, Camera, FileUpload } = FormElements;

// ---- validators (hoisted) ----
const EMAIL_RE =
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}(\.\d{1,3}){3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const validateEmail = (email) => EMAIL_RE.test(String(email || '').trim());
const validatePhone = (phone) => /^(\+)?([0-9]{1,4}[\s\-()]?){2,}$/.test(String(phone || '').trim());

class ReactForm extends React.Component {
  form = null;
  inputs = {};            // map field_name -> ref/component
  emitter = new EventEmitter();
  onChangeDebounceId = null;

  constructor(props) {
    super(props);
    this.state = {
      answers: this._convert(props.answer_data) || {}, // canonical answers
    };

    this.getDataById = this.getDataById.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    if (this.onChangeDebounceId) clearTimeout(this.onChangeDebounceId);
  }

  // Convert array<{name,value}> to object
  _convert(answers) {
    if (Array.isArray(answers)) {
      const result = {};
      answers.forEach((x) => {
        if (x?.name?.indexOf('tags_') > -1) {
          result[x.name] = (x.value || []).map((y) => y.value);
        } else {
          result[x.name] = x.value;
        }
      });
      return result;
    }
    return answers || {};
  }

  // answers accessor with variable overlays (read-only variables)
  _answersWithVariables() {
    const { answers } = this.state;
    const { variables = {}, data = [] } = this.props;
    if (!variables || !data?.length) return answers;

    const overlay = { ...answers };
    for (const item of data) {
      if (!item) continue;
      if (item.readOnly && item.variableKey && variables[item.variableKey] != null) {
        overlay[item.field_name] = variables[item.variableKey];
      }
    }
    return overlay;
  }

  _getDefaultValue = (item) => this.state.answers?.[item.field_name];

  _optionsDefaultValue(item) {
    const defaultValue = this._getDefaultValue(item);
    if (defaultValue) return defaultValue;

    const def = [];
    (item.options || []).forEach((option) => {
      const key = option?.key;
      if (key && this.state.answers?.[`option_${key}`]) {
        def.push(key);
      }
    });
    return def;
  }

  _getItemValue(item, ref, trimValue) {
    // Return uniform { element, value }
    const $ = { element: item.element, value: '' };

    if (!item || !ref) return $;

    switch (item.element) {
      case 'Rating':
        $.value = ref?.inputField?.current?.state?.rating ?? '';
        return $;
      case 'Tags':
        $.value = ref?.inputField?.current?.state?.value ?? '';
        return $;
      case 'DatePicker':
        $.value = ref?.state?.value ?? '';
        return $;
      case 'Camera':
        $.value = ref?.state?.img ?? '';
        return $;
      case 'TableInput':
        $.value = ref?.state?.tableData ?? '';
        return $;
      case 'RadioButton':
        $.value = ref?.state?.selectedValue ?? '';
        return $;
      case 'DynamicMultiInput':
      case 'DataGridInput':
      case 'CascadeSelect':
      case 'CustomDatePicker':
      case 'ArithmeticInput':
      case 'CustomSelect':
        $.value = ref?.state?.dataList ?? '';
        return $;
      case 'FileUpload':
      case 'MultiFileUpload':
        $.value = ref?.state?.fileUpload ?? [];
        return $;
      default: {
        // Native input path: prefer an explicit ref from child if provided
        const inputRef = ref?.inputField?.current;
        if (inputRef) {
          const dom = inputRef; // current is a DOM node for native inputs
          let v = dom.value;
          if (trimValue && typeof v === 'string') v = v.trim();
          $.value = v;
          return $;
        }
        // Fallback (legacy): try findDOMNode on child wrapper
        const dom = ReactDOM.findDOMNode(ref?.inputField?.current || ref);
        if (dom && dom.value != null) {
          $.value = trimValue && typeof dom.value === 'string' ? dom.value.trim() : dom.value;
        }
        return $;
      }
    }
  }

  _getOptionKeyValue = (option) =>
    (this.props.option_key_value === 'value' ? option?.value : option?.key);

  _isIncorrect(item) {
    if (!item?.canHaveAnswer) return false;
    const ref = this.inputs[item.field_name];
    if (!ref) return false;

    if (item.element === 'Checkboxes' || item.element === 'RadioButtons') {
      for (const option of item.options || []) {
        const child = ref.options?.[`child_ref_${option.key}`];
        const dom = child && ReactDOM.findDOMNode(child);
        const checked = !!dom?.checked;
        const hasCorrect = Object.prototype.hasOwnProperty.call(option || {}, 'correct');
        if ((hasCorrect && !checked) || (!hasCorrect && checked)) return true;
      }
      return false;
    }

    const $item = this._getItemValue(item, ref, true);
    if (item.element === 'Rating') {
      return String($item.value) !== String(item.correct);
    }
    return String($item.value || '').toLowerCase() !== String(item.correct || '').trim().toLowerCase();
  }

  _isInvalid(item) {
    if (!item?.required) return false;

    const ref = this.inputs[item.field_name];
    if (!ref) return true;

    if (item.element === 'Checkboxes' || item.element === 'RadioButtons') {
      let checked = 0;
      for (const option of item.options || []) {
        const child = ref.options?.[`child_ref_${option.key}`];
        const dom = child && ReactDOM.findDOMNode(child);
        if (dom?.checked) checked += 1;
      }
      return checked < 1;
    }

    const $item = this._getItemValue(item, ref, false);
  
    if (item.element === 'Rating') return Number($item.value) === 0;
    if (item.element === 'MultiFileUpload') return ($item.value || []).some((dt) => !dt?.fileData);
    return !$item.value || ($item.value?.length < 1);
  }

  _collect(item, trimValue) {
    if (!item?.field_name) return null;

    const ref = this.inputs[item.field_name];
    const itemData = {
      id: item.id,
      name: item.field_name,
      custom_name: item.custom_name || item.field_name,
    };

    if (item.element === 'Checkboxes' || item.element === 'RadioButtons') {
      const checked = [];
      for (const option of item.options || []) {
        const child = this.inputs[item.field_name]?.options?.[`child_ref_${option.key}`];
        const dom = child && ReactDOM.findDOMNode(child);
        if (dom?.checked) checked.push(this._getOptionKeyValue(option));
      }
      itemData.value = checked;
      return itemData;
    }

    if (!ref) return null;
    itemData.value = this._getItemValue(item, ref, trimValue).value;
    return itemData;
  }

  _collectFormData(items, trimValue) {
    const out = [];
    for (const item of items || []) {
      const d = this._collect(item, trimValue);
      if (d) out.push(d);
    }
    return out;
  }

  _getSignatureImg(item) {
    const ref = this.inputs[item.field_name];
    const canvas = ref?.canvas?.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL().replace('data:image/png;base64,', '');
    const isEmpty = canvas.isEmpty();
    const input = ref?.inputField?.current && ReactDOM.findDOMNode(ref.inputField.current);
    if (input) input.value = isEmpty ? '' : base64;
  }

  // ---- events ----

  handleSubmit(e) {
    e.preventDefault();

    let errors = [];
    if (!this.props.skip_validations) {
      errors = this.validateForm();
      this.emitter.emit('formValidation', errors);
    }

    if (errors.length < 1) {
      const data = this._collectFormData(this.props.data, true);
      if (this.props.onSubmit) {
        this.props.onSubmit(data);
      } else {
        const $form = ReactDOM.findDOMNode(this.form);
        $form && $form.submit && $form.submit();
      }
    }
  }

  handleBlur() {
    // snapshot answers on blur (trimmed)
    const data = this._collectFormData(this.props.data, true);
    const next = {};
    data.forEach((item) => (next[item.name] = item.value));
    this.setState({ answers: next }, () => {
      this.props.onBlur?.(data);
    });
  }

  handleChange() {
    // snapshot answers on change (untrimmed), debounce parent onChange
    const data = this._collectFormData(this.props.data, false);
    const next = {};
 
    data.forEach((item) => (next[item.name] = item.value));
    this.setState({ answers: next });

    if (this.onChangeDebounceId) clearTimeout(this.onChangeDebounceId);
    this.onChangeDebounceId = setTimeout(() => {
      this.props.onChange?.(data);
    }, 120);
  }

  // ---- validation ----

  validateForm() {
    const errors = [];
    const { intl, display_short } = this.props;
    const data_items = display_short
      ? (this.props.data || []).filter((i) => i?.alternateForm === true)
      : (this.props.data || []);

    for (const item of data_items) {
      if (!item) continue;


      if (item.element === 'Signature') this._getSignatureImg(item);

      if (this._isInvalid(item)) {
        errors.push(`${item.label} ${intl.formatMessage({ id: 'message.is-required' })}!`);
      }

      if (item.element === 'EmailInput') {
        const ref = this.inputs[item.field_name];
        const emailValue = this._getItemValue(item, ref).value;
        if (emailValue && !validateEmail(emailValue)) {
          errors.push(`${item.label} ${intl.formatMessage({ id: 'message.invalid-email' })}`);
        }
      }

      if (item.element === 'PhoneNumber') {
        const ref = this.inputs[item.field_name];
        const phoneValue = this._getItemValue(item, ref).value;
        if (phoneValue && !validatePhone(phoneValue)) {
          errors.push(`${item.label} ${intl.formatMessage({ id: 'message.invalid-phone-number' })}`);
        }
      }

      if (this.props.validateForCorrectness && this._isIncorrect(item)) {
        errors.push(`${item.label} ${intl.formatMessage({ id: 'message.was-answered-incorrectly' })}!`);
      }
    }

    return errors;
  }

  // ---- rendering ----

  getDataById(id) {
    return (this.props.data || []).find((x) => x?.id === id);
  }

  getInputElement(item) {
    if (!item) return null;
    if (item.custom) return this.getCustomElement(item);
    const Input = FormElements[item.element];
    const ro = this.props.read_only || item?.readOnly;

    // Pass live answers (with variable overlays) so dependent fields update
    const liveAnswers = this._answersWithVariables();

    return (
      <div key={`form_${item.id}`}>
        <ToggleFieldsContainer data={item}  toggleVisibility={item?.toggleVisibility} fields={item?.visibilityFields || []} results={liveAnswers}>
          <Input
            handleChange={this.handleChange}
            ref={(c) => (this.inputs[item.field_name] = c)}
            mutable
            data={item}
            read_only={ro}
            defaultValue={this._getDefaultValue(item)}
            resultData={liveAnswers}
            apiBaseUrl={this.props.apiBaseUrl || 'https://api.dev.gateway.kusala.com.ng'}
          />
        </ToggleFieldsContainer>
      </div>
    );
  }

  getContainerElement(item, Element) {
    const controls = (item.childItems || []).map((x) =>
      x ? this.getInputElement(this.getDataById(x)) : <div key={`empty_${item.id}`}>&nbsp;</div>
    );
    return <Element mutable key={`form_${item.id}`} data={item} controls={controls} apiBaseUrl={this.props.apiBaseUrl || 'https://api.dev.gateway.kusala.com.ng'} />;
  }

  getSimpleElement(item) {
    const Element = FormElements[item.element];
    return <Element mutable key={`form_${item.id}`} data={item} apiBaseUrl={this.props.apiBaseUrl || 'https://api.dev.gateway.kusala.com.ng'} />;
  }

  getCustomElement(item) {
    const { intl } = this.props;
    if (!item.component || typeof item.component !== 'function') {
      item.component = Registry.get(item.key);
      if (!item.component) {
        console.error(`${item.element} ${intl.formatMessage({ id: 'message.was-not-registered' })}`);
      }
    }

    const inputProps =
      item.forwardRef
        ? {
            handleChange: this.handleChange,
            defaultValue: this._getDefaultValue(item),
            ref: (c) => (this.inputs[item.field_name] = c),
          }
        : {};

    const liveAnswers = this._answersWithVariables();

    return (
      <div key={`form_${item.id}`}>
        <ToggleFieldsContainer data={item} toggleVisibility={item?.toggleVisibility} fields={item?.visibilityFields || []} results={liveAnswers}>
          <CustomElement
            mutable
            read_only={this.props.read_only || item?.readOnly}
            data={item}
            resultData={liveAnswers}
            apiBaseUrl={this.props.apiBaseUrl || 'https://api.dev.gateway.kusala.com.ng'}
            {...inputProps}
          />
        </ToggleFieldsContainer>
      </div>
    );
  }

  handleRenderSubmit = () => {
    const name = this.props.action_name || this.props.actionName || 'Submit';
    return this.props.submitButton || <input type="submit" className="btn btn-big" value={name} />;
  };

  handleRenderBack = () => {
    const name = this.props.back_name || this.props.backName || 'Cancel';
    if (!this.props.back_action) return null;
    return this.props.backButton || (
      <a href={this.props.back_action} className="btn btn-default btn-cancel btn-big">
        {name}
      </a>
    );
  };

  render() {
    const displayItems = this.props.display_short
      ? (this.props.data || []).filter((i) => i?.alternateForm === true)
      : (this.props.data || []);

    const items = displayItems
      .filter((x) => x && !x.parentId)
      .map((item) => {
        switch (item.element) {
          case 'TextInput':
          case 'DynamicInput':
          case 'AmountInput':
          case 'ArithmeticInput':
          case 'DocumentSelect':
          case 'CascadeSelect':
          case 'DynamicMultiInput':
          case 'DataGridInput':
          case 'CustomSelect':
          case 'CustomDatepicker':
          case 'TableInput':
          case 'EmailInput':
          case 'PhoneNumber':
          case 'NumberInput':
          case 'PasswordInput':
          case 'MultiFileUpload':
          case 'TextArea':
          case 'Dropdown':
          case 'SmartAdaptorDropdown':
          case 'DatePicker':
          case 'RadioButtons':
          case 'RadioButton':
          case 'Rating':
          case 'Tags':
          case 'Range':
            return this.getInputElement(item);
          case 'CustomElement':
            return this.getCustomElement(item);
          case 'MultiColumnRow':
            return this.getContainerElement(item, MultiColumnRow);
          case 'ThreeColumnRow':
            return this.getContainerElement(item, ThreeColumnRow);
          case 'TwoColumnRow':
            return this.getContainerElement(item, TwoColumnRow);
          case 'FieldSet':
            return this.getContainerElement(item, FieldSet);
          case 'Signature':
            return (
              <Signature
                key={`form_${item.id}`}
                ref={(c) => (this.inputs[item.field_name] = c)}
                read_only={this.props.read_only || item?.readOnly}
                mutable
                data={item}
                defaultValue={this._getDefaultValue(item)}
                apiBaseUrl={this.props.apiBaseUrl || 'https://api.dev.gateway.kusala.com.ng'}
              />
            );
          case 'Checkboxes':
            return (
              <Checkboxes
                key={`form_${item.id}`}
                ref={(c) => (this.inputs[item.field_name] = c)}
                read_only={this.props.read_only}
                handleChange={this.handleChange}
                mutable
                data={item}
                defaultValue={this._optionsDefaultValue(item)}
                apiBaseUrl={this.props.apiBaseUrl || 'https://api.dev.gateway.kusala.com.ng'}
              />
            );
          case 'Image':
            return (
              <Image
                key={`form_${item.id}`}
                ref={(c) => (this.inputs[item.field_name] = c)}
                handleChange={this.handleChange}
                mutable
                data={item}
                defaultValue={this._getDefaultValue(item)}
                apiBaseUrl={this.props.apiBaseUrl || 'https://api.dev.gateway.kusala.com.ng'}
              />
            );
          case 'Download':
            return <Download key={`form_${item.id}`} download_path={this.props.download_path} mutable data={item} apiBaseUrl={this.props.apiBaseUrl || 'https://api.dev.gateway.kusala.com.ng'} />;
          case 'Camera':
            return (
              <Camera
                key={`form_${item.id}`}
                ref={(c) => (this.inputs[item.field_name] = c)}
                read_only={this.props.read_only || item?.readOnly}
                mutable
                data={item}
                defaultValue={this._getDefaultValue(item)}
                apiBaseUrl={this.props.apiBaseUrl || 'https://api.dev.gateway.kusala.com.ng'}
              />
            );
          case 'FileUpload':
            return (
              <FileUpload
                key={`form_${item.id}`}
                ref={(c) => (this.inputs[item.field_name] = c)}
                read_only={this.props.read_only || item?.readOnly}
                mutable
                data={item}
                defaultValue={this._getDefaultValue(item)}
                apiBaseUrl={this.props.apiBaseUrl || 'https://api.dev.gateway.kusala.com.ng'}
              />
            );
          default:
            return this.getSimpleElement(item);
        }
      });

    return (
      <div>
        <FormValidator emitter={this.emitter} />
        <div className="react-form-builder-form">
          <form
            encType="multipart/form-data"
            ref={(c) => (this.form = c)}
            action={this.props.form_action}
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            onSubmit={this.handleSubmit}
            method={this.props.form_method}
          >
            {this.props.authenticity_token && (
              <div style={{ display: 'none' }}>
                <input name="utf8" type="hidden" value="&#x2713;" />
                <input name="authenticity_token" type="hidden" value={this.props.authenticity_token} />
                <input name="task_id" type="hidden" value={this.props.task_id} />
              </div>
            )}
            <div id="form-items" className=''>{items}</div>
            <div className="mt-6 btn-toolbar">
              {!this.props.hide_actions && this.handleRenderSubmit()}
              {!this.props.hide_actions && this.props.back_action && this.handleRenderBack()}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

ReactForm.defaultProps = { validateForCorrectness: false };

export default injectIntl(ReactForm);
