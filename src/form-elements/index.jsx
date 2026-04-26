/* eslint-disable no-undef */
// eslint-disable-next-line max-classes-per-file
import React from "react";
import Select from "react-select";
import SignaturePad from "react-signature-canvas";
import ReactBootstrapSlider from "react-bootstrap-slider";
import axios from "axios";
import debounce from "debounce";
import PropTypes from "prop-types";

import CurrencyInput from "react-currency-input-field";
import StarRating from "./star-rating";
import DatePicker from "./date-picker";
import ComponentHeader from "./component-header";
import ComponentLabel from "./component-label";
import myxss from "./myxss";
import ErrorMessage from "../error-message";
import SuccessMessage from "../success-message";
import { getExtensionFromMimeType } from "../utils/getExt";
import ImageViewer from "../ImageViewer";
import TableInputElement from "../TableInputElement";
import UniversalFileViewer from "../DocumentViewer";
import DynamicInputList from "../DynamicInput";
import DataGrid from "./DataGrid";
import CustomSelectComponent from "./CustomSearchSelect";
import CascadeDropdown from "./cascade-dropdown";
import ArithmeticComponentView from "./ArithmeticComponentView";
import Base64FileViewer from "./base64-render";
import AzureFileUploadComponent from "./azure-file-upload";
import { FileTypes } from "../data";
import { toast, ToastContainer } from "react-toastify";
import {
  Upload,
  File,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";

import classNames from "classnames";

const FormElements = {};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const defaultFileType =
  "image/jpeg, image/png, image/gif, image/webp, image/svg+xml, image/bmp, image/tiff, image/x-icon, image/heic, " +
  "application/pdf, application/msword, " +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document, " +
  "application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, " +
  "application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, " +
  "text/csv";

function isValidGuid(guid) {
  const guidPattern =
    /^[{]?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}[}]?$/;
  return guidPattern.test(guid);
}

function getAllFieldValues(data, values) {
  if (!Array.isArray(data) || typeof values !== "object" || !values) {
    return [];
  }
  const result = [];
  for (const item of data) {
    if (
      item.field_name &&
      Object.prototype.hasOwnProperty.call(values, item.field_name) &&
      values[item.field_name]
    ) {
      result.push(values[item.field_name]);
    }
  }
  return result;
}

const validateFile = (file, fileType) => {
  if (file.size > MAX_FILE_SIZE) {
    return "File size exceeds 5MB limit";
  }
  if (fileType && !fileType.includes(file.type)) {
    return "Invalid file type";
  }
  return null;
};

// Module-level helpers — defined once, not recreated on every render
function addSpaceToUppercase(str) {
  return str.replace(/([A-Z])/g, " $1").trim();
}

function isDynamicInputImage(value) {
  if (!value || typeof value !== "string") return false;
  const base64DataUrlPattern =
    /^data:image\/(jpeg|jpg|png|gif|bmp|webp);base64,/i;
  const rawBase64ImageHeaders = [
    /^\/9j\//, // JPEG
    /^iVBOR/, // PNG
    /^R0lGOD/, // GIF
    /^Qk0/, // BMP
    /^UklGR/, // WebP
  ];
  const rawBase64Pattern = /^[A-Za-z0-9+/]{100,}={0,2}$/;
  const urlPattern = /\.(jpeg|jpg|png|gif|bmp|webp)(\?.*)?$/i;
  return (
    base64DataUrlPattern.test(value) ||
    urlPattern.test(value) ||
    rawBase64Pattern.test(value) ||
    rawBase64ImageHeaders.some((pattern) => pattern.test(value))
  );
}

function getImageDataUrl(rawBase64) {
  if (!rawBase64 || typeof rawBase64 !== "string") return null;
  const header = rawBase64.substring(0, 10);
  const mimeMap = [
    ["/9j/", "image/jpeg"],
    ["iVBOR", "image/png"],
    ["R0lGOD", "image/gif"],
    ["Qk", "image/bmp"],
    ["UklGR", "image/webp"],
  ];
  const found = mimeMap.find(([prefix]) => header.startsWith(prefix));
  if (found) {
    return `data:${found[1]};base64,${rawBase64}`;
  }
  if (rawBase64.startsWith("data:")) return rawBase64;
  console.warn("Unknown image type or invalid base64");
  return rawBase64;
}

const isImage = (url) => {
  if (!url) return false;
  if (typeof url !== "string") return false;
  if (url.startsWith("data:image")) return true;
  const extensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const ext = url.split("?")[0].split(".").pop().toLowerCase();
  return extensions.includes(ext);
};

const getFileUrl = (file, isBase64 = false) => {
  if (!file) return null;
  if (typeof file === "object") return file.url;
  if (typeof file === "string") {
    if (file.startsWith("http") || file.startsWith("data:")) return file;
    if (isBase64) return `data:image/png;base64,${file}`;
    return file;
  }
  return null;
};

class Header extends React.Component {
  render() {
    // const headerClasses = `dynamic-input ${this.props.data.element}-input`;
    let classNames = "static";
    if (this.props.data.bold) {
      classNames += " bold";
    }
    if (this.props.data.italic) {
      classNames += " italic";
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
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
    let classNames = "static";
    if (this.props.data.bold) {
      classNames += " bold";
    }
    if (this.props.data.italic) {
      classNames += " italic";
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
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
    let classNames = "static";
    if (this.props.data.bold) {
      classNames += " bold";
    }
    if (this.props.data.italic) {
      classNames += " italic";
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
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
    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <hr />
      </div>
    );
  }
}

class DynamicInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      errorText: "",
      successText: "",
      validating: false,
      description: "",
      objectFileData: {},
    };
    // Single debounce: input change → validate after 800ms
    this.debouncedValidate = debounce(this._validate, 800);
  }

  componentDidMount() {
    if (this.props.defaultValue) {
      this._validate(this.props.defaultValue);
    }
  }

  componentWillUnmount() {
    this.debouncedValidate.clear();
  }

  async _fetchFileUrl(id) {
    try {
      const { fileUrl } = this.props.data;
      const tempFileUrl =
        fileUrl ||
        "https://uat-qa-document-management.sterling.ng/api/v1/docs/preview";
      const { data, status } = await axios.get(
        `${tempFileUrl}/${id}?documentType=Others`,
      );
      if (status === 200 && data?.data?.blobString) {
        return data.data.blobString;
      }
    } catch (error) {
      console.error("Error fetching file URL:", error);
    }
    return id;
  }

  _flattenFirstObjectInArray(obj) {
    try {
      const result = { ...obj };
      Object.keys(obj).forEach((key) => {
        if (
          Array.isArray(obj[key]) &&
          obj[key].length > 0 &&
          typeof obj[key][0] === "object"
        ) {
          Object.assign(result, obj[key][0]);
          delete result[key];
        }
      });
      return result;
    } catch (error) {
      console.error("flattenFirstObjectInArray error:", error);
      return obj;
    }
  }

  async _validate(value) {
    const { url, method, responseType } = this.props.data;
    console.log({ url, method, responseType });
    if (!url) {
      this.setState({
        errorText: "Please add a valid API URL",
        successText: "",
        description: "",
      });
      return;
    }

    const token = window.localStorage.getItem("token");
    // if (!token) return;

    this.setState({
      validating: true,
      errorText: "",
      successText: "",
      description: "",
      objectFileData: {},
    });

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data, status } = await axios[method || "get"](
        `${url}/${value}`,
        config,
      );

      if (status === 200) {
        const isSuccess = (data?.data?.status ?? data?.status) === true;
        if (isSuccess) {
          const description =
            data.data?.description ??
            data?.description ??
            data?.data?.content ??
            data?.content;
          console.log({ dynamic: description, typeof: typeof description });
          this.setState({
            successText: "Validation success",
            errorText: "",
            description,
          });

          if (typeof description === "object") {
            const flatObj = this._flattenFirstObjectInArray(description);
            const entries = await Promise.all(
              Object.keys(flatObj).map(async (key) => {
                try {
                  const val = isValidGuid(flatObj[key])
                    ? await this._fetchFileUrl(flatObj[key])
                    : flatObj[key];
                  return [key, val];
                } catch (err) {
                  console.error(`Error fetching file for "${key}":`, err);
                  return [key, flatObj[key]];
                }
              }),
            );
            this.setState({ objectFileData: Object.fromEntries(entries) });
          }
        } else {
          this.setState({
            errorText: "Data not found!",
            successText: "",
            description: "",
            objectFileData: {},
          });
        }
      }
    } catch (error) {
      this.setState({
        errorText:
          error?.response?.data?.message ||
          "Validation failed, please try again",
        successText: "",
        description: "",
        objectFileData: {},
      });
    } finally {
      this.setState({ validating: false });
    }
  }

  handleChange = (event) => {
    const { value } = event.target;
    const { url } = this.props.data;
    if (!url) {
      this.setState({ errorText: "Please add a valid API URL" });
      return;
    }
    const appendedFields = getAllFieldValues(
      this.props.data.mappedFields,
      this.props.resultData,
    ).join("/");
    const fullValue = appendedFields ? `${value}/${appendedFields}` : value;
    this.setState({
      errorText: "",
      successText: "",
      description: "",
      objectFileData: {},
    });
    this.debouncedValidate(fullValue);
  };

  render() {
    const { data, mutable, defaultValue, read_only, style } = this.props;
    const { field_name, maxLength, responseType, allowEdit } = data;
    const { errorText, successText, description, validating, objectFileData } =
      this.state;

    const inputProps = {
      type: "text",
      className: "form-control",
      name: field_name,
      disabled: read_only && !allowEdit ? "disabled" : undefined,
      maxLength: maxLength || undefined,
    };
    if (mutable) {
      inputProps.defaultValue = defaultValue;
      inputProps.ref = this.inputField;
    }

    const baseClasses = `SortableItem rfb-item${data.pageBreakBefore ? " alwaysbreak" : ""}`;
    const hasObjectData =
      objectFileData && Object.keys(objectFileData).length > 0;
    console.log({ hasObjectData, objectFileData });

    return (
      <div style={style} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <div className="clearfix pr-6 d-flex align-items-center position-relative">
            <input {...inputProps} onChange={this.handleChange} />
            {validating && (
              <div
                className="align-middle spinner-border spinner-border-sm text-secondary position-absolute"
                style={{ right: "16px" }}
                role="status"
              >
                <span className="sr-only">Validating...</span>
              </div>
            )}
          </div>
          {errorText && <ErrorMessage message={errorText} />}
          {successText && !description && (
            <SuccessMessage message={successText} />
          )}
          {description && typeof description === "string" && (
            <div style={{ marginTop: "6px" }}>
              <span className="block pt-1 text-capitalize text-14 font-weight-bold">
                {description}
              </span>
            </div>
          )}
          {hasObjectData && typeof description === "object" && (
            <>
              {Object.keys(objectFileData).map((item) => (
                <div key={item} style={{ marginTop: "16px" }}>
                  <label className="block pt-1 text-capitalize text-14 font-weight-bold form-label">
                    <span>{addSpaceToUppercase(item)} </span>
                  </label>
                  {!isDynamicInputImage(objectFileData[item]) ? (
                    <div
                      className="form-control loaded_file"
                      style={{ background: "#efefef4d" }}
                    >
                      {typeof objectFileData[item] !== "object"
                        ? objectFileData[item]
                        : "N/a"}
                    </div>
                  ) : (
                    <div>
                      {objectFileData[item] ? (
                        <ImageViewer
                          imageUrl={getImageDataUrl(objectFileData[item])}
                        />
                      ) : (
                        "No file found"
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
      errorText: "",
      successText: "",
      description: "",
      fileLoading: false,
      documents: [],
      isSigned: false,
      signatures: [],
      signature: null,
    };
    this.intervalId = null;
    this.requestId = new URLSearchParams(window.location.search).get(
      "workflowId",
    );
  }

  async componentDidMount() {
    const { data } = this.props;
    const { documentId } = data;

    let parsedDocumentId;
    try {
      parsedDocumentId = documentId ? JSON.parse(documentId) : null;
    } catch (error) {
      console.error("Invalid JSON in documentId:", error);
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
      const token = window.localStorage.getItem("token");
      if (!token) return;
      const tempUser = JSON.parse(
        window.localStorage.getItem("LoginInfo") || "{}",
      );
      const position = tempUser?.position ?? tempUser.role;
      this.setState({ fileLoading: true });

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(
        `${
          this.props.apiBaseUrl || "https://api.dev.gateway.kusala.com.ng"
        }/documents/v1/DocumentSignature/position-signature-status?documentId=${id}&position=${position}&requestId=${
          this.requestId
        }&fromWorkflow=true`,
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
      console.error("Error checking document status:", error);
      if (
        error.response.data.message ===
        "No document signature for this position"
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
      const token = window.localStorage.getItem("token");
      if (!token) return;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(
        `${
          this.props.apiBaseUrl || "https://api.dev.gateway.kusala.com.ng"
        }/documents/v1/DocumentSignature/get-signatures-request?documentId=${id}&requestId=${
          this.requestId
        }`,
        config,
      );

      if (response.status === 200) {
        this.setState({ signatures: response.data?.data?.data || [] });
      }
    } catch (error) {
      console.error("Error fetching signatures:", error);
    }
  }

  isPathValid() {
    const { pathname } = window.location;
    const validPaths = [
      "/forms/editor",
      "/run/workflow/approve",
      "/run/workflow/verdict",
      "/request/process/approval",
      "/request/process/verdict",
      "/request/process/view",
      "/request/process/rework",
    ];

    return (
      validPaths.some((path) => pathname?.toLowerCase()?.includes(path)) ||
      pathname === "/"
    );
  }

  isApprovePath() {
    const { pathname } = window.location;
    const validApprovePaths = [
      "/run/workflow/approve",
      "/run/workflow/verdict",
      "/request/process/approval",
      "/request/process/verdict",
      "/request/process/view",
      "/request/process/rework",
    ];
    return validApprovePaths.some((path) =>
      pathname?.toLowerCase()?.includes(path),
    );
  }

  render() {
    const { data, mutable, defaultValue, read_only, style } = this.props;
    const { field_name, documentId, allowEdit } = data;
    const {
      errorText,
      successText,
      description,
      isSigned,
      signatures,
      signature,
    } = this.state;
    const tempUser = JSON.parse(
      window.localStorage.getItem("LoginInfo") || "{}",
    );
    const position = tempUser?.position ?? tempUser.role;
    const email = tempUser?.email;
    // new URLSearchParams(window.location.search).get('email');

    const parsedDocumentId = documentId ? JSON.parse(documentId) : {};
    const userCanSign = signatures.some(
      (sig) => sig?.position?.toLowerCase() === position?.toLowerCase(),
    );
    if (!this.isPathValid()) {
      return null;
    }
    // if (this.isApprovePath()) {
    //   return null;
    // }
    const inputProps = {
      type: "text",
      className: "form-control bg-transparent",
      name: field_name,
      defaultValue: mutable ? defaultValue : undefined,
      disabled: read_only && !allowEdit ? "disabled" : undefined,
    };

    return (
      <div
        style={style}
        className={`SortableItem rfb-item ${
          data.pageBreakBefore ? "alwaysbreak" : ""
        }`}
      >
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <div
            className="clearfix pr-6 d-flex align-items-center position-relative"
            style={{ columnGap: "12px" }}
          >
            <div {...inputProps}>{parsedDocumentId?.label || ""}</div>
            {!isSigned && userCanSign && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`/document/render/read/${parsedDocumentId?.value}/${
                  signature?.id ?? signature?.docSignatureId
                }?email=${email}&type=form_signature&requestId=${
                  this.requestId
                }`}
              >
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  style={{ padding: "10px 20px", borderRadius: "6px" }}
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
                href={`/document/preview/read/${parsedDocumentId?.value}/${
                  signature?.id ?? signature?.docSignatureId
                }?email=${email}&type=form_signature&requestId=${
                  this.requestId
                }`}
              >
                <button
                  type="button"
                  className="btn btn-sm btn-success d-flex"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    alignItems: "center",
                    columnGap: "8px",
                  }}
                >
                  {isSigned ? (
                    <>
                      Signed <i className="far fa-check-circle"></i>
                    </>
                  ) : (
                    "View"
                  )}
                </button>{" "}
              </a>
            )}
          </div>

          {errorText && <ErrorMessage message={errorText} />}
          {successText && !description && (
            <SuccessMessage message={successText} />
          )}
          {description && (
            <div style={{ marginTop: "6px" }}>
              <span className="block pt-1 text-capitalize text-14 font-weight-bold">
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
    props.type = "text";
    props.className = "form-control";
    props.name = this.props.data.field_name;
    props.maxLength = this.props.data.maxLength;
    props.minLength = this.props.data.minLength;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    if (
      (this.props?.read_only || this.props.data?.isReadOnly) &&
      !this.props.data?.allowEdit
    ) {
      props.disabled = "disabled";
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />

          <input {...props} />
        </div>{" "}
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
    props.type = "text";
    props.className = "form-control";
    props.name = this.props.data.field_name;
    let tempDefaultValue = [];

    const { denominators } = this.props.data;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    if (
      (this.props?.read_only || this.props.data?.isReadOnly) &&
      !this.props.data?.allowEdit
    ) {
      props.disabled = "disabled";
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
            readOnly={
              (this.props?.read_only || this.props.data?.isReadOnly) &&
              !this.props.data?.allowEdit
            }
          />
        </div>
      </div>
    );
  }
}

class CascadeSelect extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      dataList: this.props.defaultValue || [],
    };
  }

  render() {
    const props = {};
    props.type = "text";
    props.className = "form-control";
    props.name = this.props.data.field_name;
    let tempDefaultValue = [];

    const {
      firstLabel,
      secondLabel,
      firstDropdownOptions,
      secondDropdownOptions,
    } = this.props.data;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    if (
      (this.props?.read_only || this.props.data?.isReadOnly) &&
      !this.props.data?.allowEdit
    ) {
      props.disabled = "disabled";
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
          <CascadeDropdown
            secondDropdownOptions={secondDropdownOptions}
            firstDropdownOptions={firstDropdownOptions}
            defaultValue={tempDefaultValue}
            readOnly={
              (this.props?.read_only || this.props.data?.isReadOnly) &&
              !this.props.data?.allowEdit
            }
            onGetValue={(value) => {
              this.setState({ dataList: value });
            }}
            firstLabel={firstLabel}
            secondLabel={secondLabel}
          />
        </div>
      </div>
    );
  }
}
class CustomSelect extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      dataList: props.defaultValue || [],
    };
  }

  getFilteredOptions = () => {
    const { data, resultData } = this.props;
    if (!data?.options) return [];

    if (data?.isCascade) {
      const dependentValue = resultData?.[data.dependentField];
      return data.options.filter(
        (opt) => opt.key?.toString() === dependentValue?.toString(),
      );
    }

    return data.options;
  };

  isReadOnly = () => {
    const { read_only, data } = this.props;
    return (read_only || data?.isReadOnly) && !data?.allowEdit;
  };

  render() {
    const { data, defaultValue, style, mutable } = this.props;

    const tempOptions = this.getFilteredOptions();
    let tempDefaultValue = defaultValue || [];
    if (tempOptions.length === 1) {
      tempDefaultValue = tempOptions[0]?.value;
    }
    const baseClasses =
      "SortableItem rfb-item" + (data.pageBreakBefore ? " alwaysbreak" : "");

    return (
      <div style={{ ...style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <CustomSelectComponent
            options={tempOptions}
            defaultValue={tempDefaultValue}
            readOnly={this.isReadOnly()}
            url={data?.optionsApiUrl}
            ref={mutable ? this.inputField : undefined}
            onGetValue={(value) => this.setState({ dataList: value })}
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
    props.type = "text";
    props.className = "form-control";
    props.name = this.props.data.field_name;
    let tempDefaultValue = [];

    const { dynamicInputOptions } = this.props.data;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    if (
      (this.props?.read_only || this.props.data?.isReadOnly) &&
      !this.props.data?.allowEdit
    ) {
      props.disabled = "disabled";
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
            readOnly={
              (this.props?.read_only || this.props.data?.isReadOnly) &&
              !this.props.data?.allowEdit
            }
          />
        </div>
      </div>
    );
  }
}

class DataGridInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      dataList: this.props.defaultValue || [],
    };
  }

  render() {
    const props = {};
    props.type = "text";
    props.className = "form-control";
    props.name = this.props.data.field_name;
    let tempDefaultValue = [];

    const { dataColumns } = this.props.data;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    if (
      (this.props?.read_only || this.props.data?.isReadOnly) &&
      !this.props.data?.allowEdit
    ) {
      props.disabled = "disabled";
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
          <DataGrid
            onChange={(data) => {
              this.setState({ dataList: data });
            }}
            columns={dataColumns || []}
            value={tempDefaultValue}
            url={this.props.data.url}
            isReadOnly={
              (this.props?.read_only || this.props.data?.isReadOnly) &&
              !this.props.data?.allowEdit
            }
          />
        </div>
      </div>
    );
  }
}

class ArithmeticInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      dataList: String(props.defaultValue ?? ""), // keep as string
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.defaultValue !== this.props.defaultValue) {
      this.setState({ dataList: String(this.props.defaultValue ?? "") });
    }
  }

  render() {
    const {
      data = {},
      mutable,
      defaultValue,
      style,
      read_only,
      resultData,
      handleChange,
      ...rest
    } = this.props;

    const {
      allowEdit,
      isReadOnly: itemReadOnly,
      field_name,
      pageBreakBefore,
      calculationFields,
    } = data;

    const isDisabled = !!((read_only || itemReadOnly) && !allowEdit);
    const baseClasses = pageBreakBefore
      ? "SortableItem rfb-item alwaysbreak"
      : "SortableItem rfb-item";

    return (
      <div style={style} className={baseClasses} {...rest}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />

          <ArithmeticComponentView
            // Prefer controlled API if supported: value={this.state.dataList}
            defaultValue={defaultValue || 0}
            mappedFields={calculationFields || []}
            resultData={resultData || []}
            isReadOnly={isDisabled}
            onChange={(next) => {
              const str = String(next ?? 0);
              this.setState({ dataList: str }, () => {
                // notify form so it can re-collect values
                handleChange?.(str);
              });
            }}
          />

          {/* <input
            type="text"
            name={field_name}
            ref={mutable ? this.inputField : undefined}
            className="form-control field-control"
            disabled={isDisabled}
            readOnly={isDisabled}
            value={this.state.dataList || 20 || 0}
            // This input mirrors ArithmeticComponentView; user typing is ignored on purpose.
            onChange={() => {}}
          /> */}
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
      type: "password",
    };
  }

  togglePasswordVisibility = () => {
    // Toggle between 'password' and 'text' type
    this.setState((prevState) => ({
      type: prevState.type === "text" ? "password" : "text",
    }));
  };

  render() {
    const { type } = this.state;
    const props = {};
    props.type = type;
    props.className = "form-control";
    props.name = this.props.data.field_name;
    props.maxLength = this.props.data.maxLength;
    props.minLength = this.props.data.minLength;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    if (
      (this.props?.read_only || this.props.data?.isReadOnly) &&
      !this.props.data?.allowEdit
    ) {
      props.disabled = "disabled";
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
                {type === "text" ? "Hide" : "Show"}
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
      value: this.props.defaultValue || "",
      error: "",
      isValid: true,
    };
  }

  handleValueChange = (value, name, values) => {
    const numericValue = parseFloat(value);

    // Retrieve min and max value from data
    const min = this.props.data.minLength ?? null;
    const max = this.props.data.maxLength ?? null;

    let error = "";
    let isValid = true;
    if (min !== null && numericValue < min) {
      error = `Amount should not be less than ${min}.`;
      isValid = false;
    } else if (max !== null && numericValue > max) {
      error = `Amount should not be more than ${max}.`;
      isValid = false;
    }

    this.setState({ value, error, isValid });
    if (this.props.onValueChange) {
      this.props.onValueChange(value, name, values);
    }
  };

  render() {
    const { data, mutable, defaultValue, style, read_only } = this.props;
    const { toggleNegative, allowEdit, isReadOnly } = data;
    const inputProps = {
      type: "text",
      className: "form-control",
      name: data.field_name,
      defaultValue: mutable ? defaultValue : undefined,
      ref: mutable ? this.inputField : undefined,

      disabled:
        (read_only || isReadOnly) && !allowEdit ? "disabled" : undefined,
    };
    const { value, error } = this.state;
    let baseClasses = "SortableItem rfb-item";
    if (data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div style={style} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <CurrencyInput
            id="input-example"
            className="form-control"
            {...inputProps}
            decimalsLimit={6}
            defaultValue={defaultValue}
            onValueChange={this.handleValueChange}
            disabled={
              (read_only || isReadOnly) && !allowEdit ? "disabled" : undefined
            }
            allowNegativeValue={!!toggleNegative}
          />
          <input
            {...inputProps}
            defaultValue={this.state.value}
            className="hidden-input"
          />
          {error && <small className="mt-1 text-danger">{error}</small>}
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
    props.type = "text";
    props.className = "form-control";
    props.name = this.props.data.field_name;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    if (
      (this.props?.read_only || this.props.data?.isReadOnly) &&
      !this.props.data?.allowEdit
    ) {
      props.disabled = "disabled";
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
    props.type = "tel";
    props.className = "form-control";
    props.name = this.props.data.field_name;
    props.maxLength = this.props.data.maxLength;
    props.minLength = this.props.data.minLength;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    if (
      (this.props?.read_only || this.props.data?.isReadOnly) &&
      !this.props.data?.allowEdit
    ) {
      props.disabled = "disabled";
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
    this.state = {
      value: props.defaultValue || "",
      error: "",
    };
    this.inputField = React.createRef();
  }

  handleChange = (e) => {
    const value = e.target.value;
    const { minLength, maxLength, field_name } = this.props.data;

    let error = "";
    if (value !== "") {
      const number = parseFloat(value);
      if (minLength !== undefined && number < minLength) {
        error = `Value must be at least ${minLength}.`;
      } else if (maxLength !== undefined && number > maxLength) {
        error = `Value must be no more than ${maxLength}.`;
      }
    }

    this.setState({ value, error });
  };

  render() {
    const { value, error } = this.state;
    const { data, mutable, defaultValue } = this.props;

    const props = {
      type: "number",
      className: "form-control",
      name: data.field_name,
      max: data.maxLength,
      min: data.minLength,
      step: "0.01",
      onChange: this.handleChange,
      value: value,
      ref: this.inputField,
    };

    if ((this.props.read_only || data?.isReadOnly) && !data?.allowEdit) {
      props.disabled = true;
    }

    let baseClasses = "SortableItem rfb-item";
    if (data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <input {...props} />
          {error && <small className="text-danger">{error}</small>}
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
    props.className = "form-control";
    props.name = this.props.data.field_name;

    if (
      (this.props?.read_only || this.props.data?.isReadOnly) &&
      !this.props.data?.allowEdit
    ) {
      props.disabled = "disabled";
    }

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
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

  getFilteredOptions() {
    const { data, resultData } = this.props;
    const dependentValue = resultData?.[data?.dependentField];

    if (data?.isCascade) {
      return (
        data.options?.filter(
          (opt) => opt.key?.toString() === dependentValue?.toString(),
        ) || []
      );
    }
    return data.options || [];
  }

  render() {
    const { data, defaultValue, mutable, read_only, style } = this.props;

    const props = {
      className: "form-control", // Tailwind will apply via `form-control` utility
      name: data?.field_name || "",
      defaultValue: defaultValue ?? "",
      ref: mutable ? this.inputField : undefined,
      disabled:
        ((read_only || data?.isReadOnly) && !data?.allowEdit) || undefined,
    };

    const tempOptions = this.getFilteredOptions();
    if (tempOptions.length === 1) {
      props.defaultValue = tempOptions[0]?.value;
    }
    // Keep your existing base classes, add Tailwind for consistency
    let baseClasses = "SortableItem rfb-item relative "; // z-index ensures dropdown stays above everything
    if (data?.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div style={style} className={baseClasses}>
        {/* Header Section */}
        <ComponentHeader {...this.props} />

        <div className="form-group">
          {/* Label Section */}
          <ComponentLabel {...this.props} />

          {/* Dropdown */}
          <select {...props}>
            <option value="" disabled>
              Select
            </option>

            {tempOptions.map((option, idx) => (
              <option key={`preview_${option.id}_${idx}`} value={option.value}>
                {option.text}
              </option>
            ))}
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
    props.className = "form-control";
    props.name = this.props.data.field_name;

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    if (
      (this.props?.read_only || this.props.data?.isReadOnly) &&
      !this.props.data?.allowEdit
    ) {
      props.disabled = "disabled";
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <select {...props}>
            {this.props.data.options?.map((option, idx) => {
              const this_key = `preview_${option.id}_${idx}`;
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
      this.setState({ defaultValue: "" });
    } else if (this.canvas.current) {
      this.canvas.current.clear();
    }
  };

  render() {
    const { defaultValue } = this.state;
    let canClear = !!defaultValue;
    const props = {};
    props.type = "hidden";
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
      canClear = !this.props?.read_only;
    }
    pad_props.clearOnResize = false;

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
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
          {this.props?.read_only === true || !!sourceDataURL ? (
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
      if (typeof defaultValue === "string") {
        const vals = defaultValue.split(",")?.map((x) => x?.trim());
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
    const options = this.props.data.options?.map((option) => {
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
      props.isDisabled = this.props?.read_only;
      props.value = this.state.value;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
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
    let classNames = "custom-control custom-checkbox";
    if (this.props.data.inline) {
      classNames += " option-inline";
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.data.options?.map((option, idx) => {
            const this_key = `preview_${option.key}_${idx}`;
            const props = {};
            props.name = `option_${option.key}`;

            props.type = "checkbox";
            props.value = option.value;
            if (self.props.mutable) {
              props.defaultChecked =
                self.props.defaultValue !== undefined &&
                (self.props.defaultValue.indexOf(option.key) > -1 ||
                  self.props.defaultValue.indexOf(option.value) > -1);
            }
            if (
              (this.props?.read_only || this.props.data?.isReadOnly) &&
              !this.props.data?.allowEdit
            ) {
              props.disabled = "disabled";
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
    let classNames = "custom-control custom-radio";
    if (this.props.data.inline) {
      classNames += " option-inline";
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.data.options?.map((option, idx) => {
            const this_key = `preview_${option.key}_${idx}`;
            const props = {};
            props.name = self.props.data.field_name;

            props.type = "radio";
            props.value = option.value;
            if (self.props.mutable) {
              props.defaultChecked =
                self.props.defaultValue !== undefined &&
                (self.props.defaultValue.indexOf(option.key) > -1 ||
                  self.props.defaultValue.indexOf(option.value) > -1);
            }
            if (
              (this.props?.read_only || this.props.data?.isReadOnly) &&
              !this.props.data?.allowEdit
            ) {
              props.disabled = "disabled";
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
class RadioButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: props.defaultValue || "",
    };
  }

  handleChange = (e) => {
    this.setState({ selectedValue: e.target.value });
  };

  render() {
    const { data, style, read_only } = this.props;
    const { selectedValue } = this.state;

    return (
      <div style={style} className="SortableItem rfb-item">
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {data.options?.map((option, idx) => {
            const id = `fid_preview_${option.key}_${idx}`;
            return (
              <div
                className={`custom-control custom-radio${
                  data.inline ? " option-inline" : ""
                }`}
                key={option.key}
              >
                <input
                  type="radio"
                  name={data.field_name}
                  id={id}
                  value={option.value}
                  className="custom-control-input"
                  checked={selectedValue === option.value}
                  onChange={this.handleChange}
                  disabled={(read_only || data?.isReadOnly) && !data.allowEdit}
                />
                <label className="custom-control-label" htmlFor={id}>
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
    const style = this.props.data.center ? { textAlign: "center" } : null;

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
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

class Base64File extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    const { defaultValue, data } = props;
    this.state = { value: defaultValue || "" };
  }

  render() {
    const style = this.props.data.center ? { textAlign: "center" } : null;

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div style={{ ...this.props.style, ...style }} className={baseClasses}>
        {" "}
        <ComponentHeader {...this.props} />
        {<Base64FileViewer defaultValue={this.props?.defaultValue} />}
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
      props.disabled = this.props?.read_only;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
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
    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div style={{ ...this.props.style }} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <label className={"form-label"}>
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
    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
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
    const imgProps = { width: "100%" };
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
      objectFit: "scale-down",
      objectPosition: this.props.data.center ? "center" : "left",
    };
    let baseClasses = "SortableItem rfb-item";
    const name = this.props.data.field_name;
    const fileInputStyle = this.state.img ? { display: "none" } : null;
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }
    let sourceDataURL;
    if (
      this.props?.read_only === true &&
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
          {this.props?.read_only === true &&
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
    defaultValue: PropTypes.any,
    read_only: PropTypes.bool,
    style: PropTypes.object,
    apiBaseUrl: PropTypes.string,
  };

  fileReader = null;

  constructor(props) {
    super(props);

    this.state = {
      fileUpload: null,
      fileLoading: false,
      fileStatus: null,
      error: null,
      isDragging: false,
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

  handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.read_only) return;
    this.setState({ isDragging: true });
  };

  handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isDragging: false });
  };

  handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isDragging: false });
    if (this.props.read_only) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await this.processFile(file);
    }
  };

  getBase64 = (file) =>
    new Promise((resolve, reject) => {
      this.fileReader = new FileReader();

      this.fileReader.onload = (event) => {
        if (event.target?.result) {
          const base64String = event.target.result.split(",")[1];
          resolve(base64String);
        } else {
          reject(new Error("Failed to read file"));
        }
      };

      this.fileReader.onerror = (error) => {
        reject(error);
      };

      this.fileReader.readAsDataURL(file);
    });

  uploadFile = async (file) => {
    try {
      const token = window?.localStorage.getItem("token") || "";
      if (!token) return;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const validationError = validateFile(file, this.props.data.fileType);
      if (validationError) {
        this.setState({ error: validationError });
        return null;
      }

      this.setState({ fileLoading: true, error: null });
      const base64File = await this.getBase64(file);
      const data = {
        fileName: file.name,
        base64: base64File,
        ext: `.${getExtensionFromMimeType(file.type)}`,
      };

      const response = await axios.post(
        `${
          this.props.apiBaseUrl || "https://api.dev.gateway.kusala.com.ng"
        }/workflows/api/v1/FileUpload/upload-document`,
        data,
        config,
      );

      this.setState({ fileStatus: "success" });
      return { url: response.data.data.url, base64File, fileName: file.name };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Unable to upload file";
      this.setState({
        fileStatus: "error",
        error: errorMessage,
      });
      return null;
    } finally {
      this.setState({ fileLoading: false });
    }
  };

  processFile = async (file) => {
    if (file.size > MAX_FILE_SIZE) {
      this.setState({
        fileStatus: "error",
        error: "File size must not exceed 5MB",
      });
      toast.error("File size cannot exceed 5MB");
      return;
    }

    const uploadedFile = await this.uploadFile(file);

    if (uploadedFile) {
      this.setState({
        fileUpload:
          this.props.data?.fileResult === "base64"
            ? uploadedFile.base64File
            : uploadedFile.url,
      });
    }
  };

  handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await this.processFile(file);
    e.target.value = "";
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
      window.open(sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  render() {
    const { fileUpload, fileLoading, error, isDragging } = this.state;
    const { data, read_only, defaultValue, style } = this.props;

    const baseClasses = classNames("SortableItem rfb-item", {
      alwaysbreak: data.pageBreakBefore,
    });

    const selectedType = FileTypes?.find(
      (i) => i?.type === data?.fileType,
    )?.typeName;

    return (
      <div style={style} className={baseClasses}>
        <ToastContainer />
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />

          {read_only && defaultValue ? (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:shadow-md">
              <div className="flex items-center space-x-4 text-left">
                {isImage(
                  getFileUrl(defaultValue, data?.fileResult === "base64"),
                ) && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-white bg-white">
                    <img
                      src={getFileUrl(
                        defaultValue,
                        data?.fileResult === "base64",
                      )}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <UniversalFileViewer
                    fileName={
                      typeof defaultValue === "object"
                        ? defaultValue?.fileName
                        : "Uploaded file"
                    }
                    fileUrl={getFileUrl(
                      defaultValue,
                      data?.fileResult === "base64",
                    )}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Drop Zone */}
              {!fileUpload && (
                <div
                  onDragOver={this.handleDragOver}
                  onDragLeave={this.handleDragLeave}
                  onDrop={this.handleDrop}
                  className={classNames(
                    "relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out px-6 !py-5 text-center",
                    isDragging
                      ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
                      : "border-gray-200 bg-gray-50/30 hover:border-blue-400 hover:bg-white",
                    error ? "border-red-300 bg-red-50/50" : "",
                  )}
                >
                  <input
                    name={data.field_name}
                    type="file"
                    accept={data.fileType || defaultFileType}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={this.handleFileChange}
                    disabled={
                      (read_only || data?.isReadOnly) && !data?.allowEdit
                    }
                  />

                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div
                      className={classNames(
                        "rounded-full transition-colors duration-300",
                        isDragging
                          ? "bg-blue-100 text-blue-600"
                          : "bg-white text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500",
                      )}
                    >
                      {fileLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">
                        {isDragging
                          ? "Drop your file here"
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedType
                          ? `${selectedType} files`
                          : "All file types"}{" "}
                        (Max 5MB)
                      </p>
                    </div>
                  </div>

                  {fileLoading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl z-20">
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Uploading...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Success State with Preview */}
              {fileUpload && !fileLoading && (
                <div className="relative overflow-hidden rounded-2xl border border-green-200 bg-green-50/30 p-4 transition-all hover:shadow-lg">
                  <div className="flex items-center space-x-4">
                    {isImage(
                      getFileUrl(fileUpload, data?.fileResult === "base64"),
                    ) ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-white bg-white">
                        <img
                          src={getFileUrl(
                            fileUpload,
                            data?.fileResult === "base64",
                          )}
                          className="w-full h-full object-cover"
                          alt="Thumbnail"
                        />
                      </div>
                    ) : (
                      <div className="p-2 bg-green-100 rounded-lg text-green-600 flex-shrink-0">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center space-x-2">
                        {isImage(
                          getFileUrl(fileUpload, data?.fileResult === "base64"),
                        ) && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          File uploaded successfully
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 mt-1">
                        <UniversalFileViewer
                          fileName="View File"
                          fileUrl={getFileUrl(
                            fileUpload,
                            data?.fileResult === "base64",
                          )}
                        />
                        <span className="text-xs text-gray-500">
                          Ready to submit
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={this.clearFileUpload}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="mt-3 flex items-start space-x-2 text-red-600 transition-all duration-300">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
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
          id: Date.now(), // Unique ID per file input
        },
      ],
      error: "",
      fileType: "image/*",
    };
  }

  componentDidMount() {
    const { defaultValue } = this.props;
    if (defaultValue?.length) {
      const fileUpload = defaultValue.map((file) => ({
        ...file,
        isLoading: false,
        id: Date.now() + Math.random(), // Unique ID for rendering
      }));
      this.setState({ fileUpload });
    }
  }

  getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  uploadFile = async (file, index) => {
    try {
      const { data: formData, apiBaseUrl } = this.props;
      const validationError = validateFile(file, formData?.fileType);
      if (validationError) {
        this.setState({ error: validationError });
        return null;
      }

      this.setLoading(index, true);

      const uploadData = {
        fileName: file.name,
        base64: await this.getBase64(file),
        ext: `.${file.name.split(".").pop()}`,
      };

      const token = window.localStorage.getItem("token");
      if (!token) return;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const url = `${
        apiBaseUrl || "https://api.dev.gateway.kusala.com.ng"
      }/workflows/api/v1/FileUpload/upload-document`;
      const response = await axios.post(url, uploadData, config);

      if (response.status !== 200) throw new Error("Upload failed");

      return response.data.data;
    } catch (error) {
      this.setState({
        error: error?.response?.data?.message || "Unable to upload file",
      });
      setTimeout(() => {
        this.setState({
          error: null,
        });
      }, 4000);
      return null;
    } finally {
      this.setLoading(index, false);
    }
  };

  setLoading = (index, isLoading) => {
    this.setState((prevState) => {
      const fileUpload = [...prevState.fileUpload];
      fileUpload[index].isLoading = isLoading;
      return { fileUpload };
    });
  };

  handleFileUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      // Optional: show error (toast, alert, message from parent, etc)
      toast.error("File size cannot exceed 5MB");
      this.setState({
        error: "File size must not exceed 5MB",
      });

      e.target.value = ""; // Clear input so user can reselect file
      return;
    }

    const uploadedFile = await this.uploadFile(file, index);
    if (uploadedFile) {
      this.setState((prevState) => {
        const fileUpload = [...prevState.fileUpload];
        fileUpload[index] = {
          ...fileUpload[index],
          fileData: uploadedFile,
          fileName: file.name,
        };
        return { fileUpload };
      });
    } else {
      // Clear input so user can re-select same file
      e.target.value = "";
    }
  };

  addFileInput = () => {
    this.setState((prevState) => ({
      fileUpload: [
        ...prevState.fileUpload,
        {
          fileData: null,
          fileName: null,
          isLoading: false,
          id: Date.now() + Math.random(),
        },
      ],
    }));
  };

  clearFileUpload = (index) => {
    this.setState((prevState) => {
      const fileUpload = [...prevState.fileUpload];
      fileUpload[index] = {
        ...fileUpload[index],
        fileData: null,
        fileName: null,
      };
      return { fileUpload };
    });
  };

  removeFileInput = (index) => {
    this.setState((prevState) => {
      if (prevState.fileUpload.length <= 1) return null;
      return {
        fileUpload: prevState.fileUpload.filter((_, i) => i !== index),
      };
    });
  };

  saveFile = (e, fileUrl) => {
    e.preventDefault();
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      console.error("File URL is missing!");
    }
  };

  renderReadOnlyView = () => {
    const { defaultValue } = this.props;
    return (
      <div className="gap-3 d-grid" style={{ rowGap: "12px" }}>
        <ToastContainer />
        {defaultValue?.map((file, index) => {
          const url = getFileUrl(file.fileData);
          return (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center space-x-4 text-left"
            >
              {isImage(url) && (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-white bg-white">
                  <img
                    src={url}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <UniversalFileViewer
                  fileName={file.fileData?.fileName || `File ${index + 1}`}
                  fileUrl={url}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  renderFileInput = (file, index) => {
    const { read_only, data } = this.props;
    const isDisabled =
      file?.isLoading || ((read_only || data?.isReadOnly) && !data?.allowEdit);
    const inputId = `fileInput-${index}`;
    const selectedType = FileTypes?.find(
      (i) => i.type === data.fileType,
    )?.typeName;

    return (
      <div key={file.id} className="mb-4">
        {file.fileData ? (
          <div className="relative overflow-hidden rounded-xl border border-green-200 bg-green-50/30 p-3 transition-all hover:shadow-md flex items-center space-x-3">
            {isImage(getFileUrl(file.fileData)) ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-white bg-white">
                <img
                  src={getFileUrl(file.fileData)}
                  className="w-full h-full object-cover"
                  alt="Thumbnail"
                />
              </div>
            ) : (
              <div className="p-1.5 bg-green-100 rounded text-green-600 flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.fileName}
              </p>
              <p className="text-xs text-gray-500">Uploaded successfully</p>
            </div>
            <div className="flex items-center space-x-2">
              <UniversalFileViewer
                fileName={file.fileName}
                fileUrl={getFileUrl(file.fileData)}
              />
              <button
                type="button"
                onClick={() => this.clearFileUpload(index)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent"
                title="Clear file"
              >
                <X className="w-4 h-4" />
              </button>
              {this.state.fileUpload.length > 1 && (
                <button
                  type="button"
                  onClick={() => this.removeFileInput(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent"
                  title="Remove input"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={classNames(
              "relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-4 text-center",
              isDisabled
                ? "opacity-50 cursor-not-allowed"
                : "border-gray-200 bg-gray-50/30 hover:border-blue-400 hover:bg-white",
            )}
          >
            <input
              type="file"
              onChange={(e) => this.handleFileUpload(e, index)}
              disabled={isDisabled}
              accept={data?.fileType || this.state.fileType}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id={inputId}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-full text-gray-400 group-hover:text-blue-500 shadow-sm transition-colors">
                  {file.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {file.isLoading ? "Uploading..." : "Click to upload file"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedType ? `${selectedType} up to 5MB` : "Up to 5MB"}
                  </p>
                </div>
              </div>
              {this.state.fileUpload.length > 1 && !file.isLoading && (
                <button
                  type="button"
                  onClick={() => this.removeFileInput(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent relative z-20"
                  title="Remove input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  render() {
    const { fileUpload, error } = this.state;
    const { style, data, read_only, defaultValue } = this.props;

    const baseClasses = classNames("SortableItem rfb-item", {
      alwaysbreak: data?.pageBreakBefore,
    });

    return (
      <div style={style} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />

          {read_only && defaultValue ? (
            this.renderReadOnlyView()
          ) : (
            <div className="mb-3">
              {fileUpload.map((file, index) =>
                this.renderFileInput(file, index),
              )}

              <button
                type="button"
                onClick={this.addFileInput}
                className="flex items-center px-4 py-2 mt-2 space-x-2 text-sm font-medium text-blue-600 transition-all bg-blue-50 rounded-lg hover:bg-blue-100 border-none outline-none"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another File</span>
              </button>
            </div>
          )}

          {error && (
            <div
              className="mt-3 flex items-start space-x-2 text-red-600 transition-all duration-300"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

class AzureFileUpload extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      field_name: PropTypes.string.isRequired,
      fileType: PropTypes.string,
      pageBreakBefore: PropTypes.bool,
    }).isRequired,
    defaultValue: PropTypes.object,
    read_only: PropTypes.bool,
    style: PropTypes.object,
  };

  fileReader = null;

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

  handleFileChange = async (file) => {
    if (file) {
      this.setState({ fileUpload: file });
    }
  };

  render() {
    const { fileUpload } = this.state;
    const { data, read_only, style } = this.props;
    const baseClasses = `SortableItem rfb-item${
      data.pageBreakBefore ? " alwaysbreak" : ""
    }`;

    return (
      <div style={style} className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />

          <AzureFileUploadComponent
            disabled={(read_only || data?.isReadOnly) && !data?.allowEdit}
            name={data.field_name}
            detail={this.props?.data?.azureSettings}
            onUploaded={this.handleFileChange}
            apiUrl={this.props.apiBaseUrl}
            accept={data.fileType || defaultFileType}
            defaultValue={fileUpload}
          />
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

    props.type = "range";
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

    const _datalist = datalist?.map((d, idx) => (
      <option key={`${props.list}_${idx}`}>{d}</option>
    ));

    const visible_marks = datalist?.map((d, idx) => {
      const option_props = {};
      let w = oneBig;
      if (idx === 0 || idx === datalist.length - 1) {
        w = oneBig / 2;
      }
      option_props.key = `${props.list}_label_${idx}`;
      option_props.style = { width: `${w}%` };
      if (idx === datalist.length - 1) {
        option_props.style = { width: `${w}%`, textAlign: "right" };
      }
      return <label {...option_props}>{d}</label>;
    });

    if (
      (this.props?.read_only || this.props.data?.isReadOnly) &&
      !this.props.data?.allowEdit
    ) {
      props.disabled = "disabled";
    }
    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
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
FormElements.ArithmeticInput = ArithmeticInput;
FormElements.DocumentSelect = DocumentSelect;
FormElements.TableInput = TableInput;
FormElements.CascadeSelect = CascadeSelect;
FormElements.DynamicMultiInput = DynamicMultiInput;
FormElements.CustomSelect = CustomSelect;
FormElements.DataGridInput = DataGridInput;
FormElements.MultiFileUpload = MultiFileUpload;
FormElements.AzureFileUpload = AzureFileUpload;
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
FormElements.Base64FileViewer = Base64File;
FormElements.RadioButtons = RadioButtons;
FormElements.RadioButton = RadioButton;
FormElements.Image = Image;
FormElements.Rating = Rating;
FormElements.Tags = Tags;
FormElements.HyperLink = HyperLink;
FormElements.Download = Download;
FormElements.Camera = Camera;
FormElements.FileUpload = FileUpload;
FormElements.Range = Range;

export default FormElements;
