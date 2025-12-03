import React from 'react';
import store from './src/stores/store';
import { ReactFormGenerator } from './src/index';

const answers = [
    {
        id: 'DC262A73-AC20-45AD-9BA6-25D4D97F1DA9',
        name: 'text_input_EEA4594E-52A6-464F-9EA0-6B206EB510D6',
        custom_name: 'text_input_EEA4594E-52A6-464F-9EA0-6B206EB510D6',
        value: 'ojunix@hotmail.com',
        files: null,
    },
    {
        id: '2629302A-5A3B-4B36-BBEA-D821918BBA89',
        name: 'number_input_6950FBF6-A247-485D-9479-28CA1685BCCE',
        custom_name: 'number_input_6950FBF6-A247-485D-9479-28CA1685BCCE',
        value: '9',
        files: null,
    },
    {
        id: 'A3C075EA-806E-413F-91E5-9B68529C9B74',
        name: 'text_input_48B58666-5BE6-4942-BBFF-368DF2226C66',
        custom_name: 'text_input_48B58666-5BE6-4942-BBFF-368DF2226C66',
        value: 'Ojorma Benjamin Odumah',
        files: null,
    },
    {
        id: '0CBFCC75-4E3B-464A-9A69-B4F86870A9FB',
        name: 'amount_input_B3AD8324-93E6-44DF-9590-2E44A6F38236',
        custom_name: 'amount_input_B3AD8324-93E6-44DF-9590-2E44A6F38236',
        value: 900,
        files: null,
    },
    {
        id: '2D185A0E-15E7-451B-B4FB-56F6C0E2FC81',
        name: 'file_upload_C3B233A9-43D3-4B13-A28B-EDE28CFE12A2',
        custom_name: 'file_upload_C3B233A9-43D3-4B13-A28B-EDE28CFE12A2',
        value: [],
        files: null,
    },
];
// const answers = {
//   'dropdown_38716F53-51AA-4A53-9A9B-367603D82548': 'd2',
//   'checkboxes_8D6BDC45-76A3-4157-9D62-94B6B24BB833': [
//     'checkboxes_option_8657F4A6-AA5A-41E2-A44A-3E4F43BFC4A6',
//     'checkboxes_option_1D674F07-9E9F-4143-9D9C-D002B29BA9E4',
//   ],
//   'radio_buttons_F79ACC6B-7EBA-429E-870C-124F4F0DA90B': [
//     'radiobuttons_option_553B2710-AD7C-46B4-9F47-B2BD5942E0C7',
//   ],
//   'rating_3B3491B3-71AC-4A68-AB8C-A2B5009346CB': 4,
// };

export default class Demobar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      previewVisible: false,
      shortPreviewVisible: false,
      roPreviewVisible: false,
    };

    const update = this._onChange.bind(this);
    this._onSubmit = this._onSubmit.bind(this);

    store.subscribe(state => update(state.data));
  }

  showPreview() {
    this.saveFormData();
    this.setState({
      previewVisible: true,
    });
  }

  showShortPreview() {
    this.saveFormData();
    this.setState({
      shortPreviewVisible: true,
    });
  }

  showRoPreview() {
    this.saveFormData();
    this.setState({
      roPreviewVisible: true,
    });
  }

  closePreview() {
    this.setState({
      previewVisible: false,
      shortPreviewVisible: false,
      roPreviewVisible: false,
    });
  }

  _onChange(data) {
    this.setState({
      data,
    });
  }

  // eslint-disable-next-line no-unused-vars
  _onSubmit(data) {
    console.log('onSubmit', data);
    // Place code to post json data to server here
  }

  saveFormData() {
    store.dispatch('post');
  }

  render() {
    let modalClass = 'modal';
    if (this.state.previewVisible) {
      modalClass += ' show d-block';
    }

    let shortModalClass = 'modal short-modal';
    if (this.state.shortPreviewVisible) {
      shortModalClass += ' show d-block';
    }

    let roModalClass = 'modal ro-modal';
    if (this.state.roPreviewVisible) {
      roModalClass += ' show d-block';
    }

    return (
      <div className="clearfix" style={{ margin: '10px', width: '70%' }}>
        <h4 className="float-left">Preview</h4>
        <button className="float-right btn btn-primary" style={{ marginRight: '10px' }} onClick={() => this.showPreview()}>Preview Form</button>
        <button className="float-right btn btn-default" style={{ marginRight: '10px' }} onClick={() => this.showShortPreview()}>Alternate/Short Form</button>
        <button className="float-right btn btn-default" style={{ marginRight: '10px' }} onClick={() => this.showRoPreview()}>Read Only Form</button>
        <button className="float-right btn btn-default" style={{ marginRight: '10px' }} onClick={() => this.saveFormData()}>Save Form</button>

        { this.state.previewVisible &&
          <div className={modalClass} role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <ReactFormGenerator
                  download_path=""
                  back_action="/"
                  back_name="Back"
                  answer_data={answers}
                  action_name="Save"
                  form_action="/api/form"
                  form_method="POST"
                  // skip_validations={true}
                  onSubmit={this._onSubmit}
                  variables={this.props.variables}
                  data={[
    {
        "id": "DC262A73-AC20-45AD-9BA6-25D4D97F1DA9",
        "element": "TextInput",
        "text": "Text Input",
        "required": false,
        "canHaveAnswer": true,
        "canToggleField": true,
        "readOnly": false,
        "isReadOnly": false,
        "canHavePageBreakBefore": true,
        "canHaveAlternateForm": true,
        "canHaveDisplayHorizontal": true,
        "canHaveOptionCorrect": true,
        "canHaveOptionValue": true,
        "canPopulateFromApi": true,
        "field_name": "text_input_EEA4594E-52A6-464F-9EA0-6B206EB510D6",
        "label": "Email ",
        "dirty": false
    },
    {
        "id": "2629302A-5A3B-4B36-BBEA-D821918BBA89",
        "element": "NumberInput",
        "text": "Number Input",
        "required": false,
        "canHaveAnswer": true,
        "canToggleField": true,
        "readOnly": false,
        "isReadOnly": false,
        "canHavePageBreakBefore": true,
        "canHaveAlternateForm": true,
        "canHaveDisplayHorizontal": true,
        "canHaveOptionCorrect": true,
        "canHaveOptionValue": true,
        "canPopulateFromApi": true,
        "field_name": "number_input_6950FBF6-A247-485D-9479-28CA1685BCCE",
        "label": "Age ",
        "dirty": false
    },
    {
        "id": "A3C075EA-806E-413F-91E5-9B68529C9B74",
        "element": "TextInput",
        "text": "Text Input",
        "required": false,
        "canHaveAnswer": true,
        "canToggleField": true,
        "readOnly": false,
        "isReadOnly": false,
        "canHavePageBreakBefore": true,
        "canHaveAlternateForm": true,
        "canHaveDisplayHorizontal": true,
        "canHaveOptionCorrect": true,
        "canHaveOptionValue": true,
        "canPopulateFromApi": true,
        "field_name": "text_input_48B58666-5BE6-4942-BBFF-368DF2226C66",
        "label": "First Name ",
        "dirty": false
    },
    {
        "id": "0CBFCC75-4E3B-464A-9A69-B4F86870A9FB",
        "element": "AmountInput",
        "text": "Amount Input",
        "required": false,
        "canHaveAnswer": true,
        "canToggleNegative": true,
        "canToggleField": true,
        "readOnly": false,
        "isReadOnly": false,
        "canHavePageBreakBefore": true,
        "canHaveAlternateForm": true,
        "canHaveDisplayHorizontal": true,
        "canHaveOptionCorrect": true,
        "canHaveOptionValue": true,
        "canPopulateFromApi": true,
        "field_name": "amount_input_B3AD8324-93E6-44DF-9590-2E44A6F38236",
        "label": "Amount"
    },
    {
        "id": "2D185A0E-15E7-451B-B4FB-56F6C0E2FC81",
        "element": "FileUpload",
        "text": "File Upload",
        "required": false,
        "canToggleField": true,
        "readOnly": false,
        "isReadOnly": false,
        "canHavePageBreakBefore": true,
        "canHaveAlternateForm": true,
        "canHaveDisplayHorizontal": true,
        "canHaveOptionCorrect": true,
        "canHaveOptionValue": true,
        "canPopulateFromApi": true,
        "field_name": "file_upload_C3B233A9-43D3-4B13-A28B-EDE28CFE12A2",
        "label": "Placeholder label"
    }
]}
                  locale='en'/>

                <div className="modal-footer">
                  <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.closePreview.bind(this)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        }

        { this.state.roPreviewVisible &&
          <div className={roModalClass}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <ReactFormGenerator
                  download_path=""
                  back_action="/"
                  back_name="Back"
                  answer_data={answers}
                  action_name="Save"
                  form_action="/"
                  form_method="POST"
                  read_only={true}
                  variables={this.props.variables}
                  hide_actions={true}
                  data={this.state.data}
                  locale='en'/>

                <div className="modal-footer">
                  <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.closePreview.bind(this)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        }

        { this.state.shortPreviewVisible &&
          <div className={shortModalClass}>
            <div className="modal-dialog modal-lg">
              <div className="p-3 mb-4 border modal-content border-light">
                <ReactFormGenerator
                  download_path=""
                  back_action=""
                  answer_data={answers}
                  form_action="/"
                  form_method="POST"
                  data={this.state.data}
                  display_short={true}
                  variables={this.props.variables}
                  hide_actions={false}
                  locale='en'
                  />

                <div className="modal-footer">
                  <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.closePreview.bind(this)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}
