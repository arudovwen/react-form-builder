import SortableElement from './sortable-element';
import PlaceHolder from './form-place-holder';
import BaseFormElements from './form-elements';
import { TwoColumnRow, ThreeColumnRow, MultiColumnRow } from './multi-column';
import { FieldSet } from './fieldset';
import CustomElement from './form-elements/custom-element';

const {
  Header, Paragraph, Label, LineBreak, TextInput, DynamicInput, AmountInput, DocumentSelect, DynamicMultiInput, DataGridInput, CustomSelect, CustomDatePicker, TableInput, CascadeSelect, PasswordInput, MultiFileUpload, EmailInput, PhoneNumber, NumberInput, TextArea, Dropdown, SmartAdaptorDropdown, Checkboxes,
  DatePicker, RadioButtons, RadioButton, Image, Rating, Tags, Signature, HyperLink, Download, Camera, Range, FileUpload,
} = BaseFormElements;

const FormElements = {};

FormElements.Header = SortableElement(Header);
FormElements.Paragraph = SortableElement(Paragraph);
FormElements.Label = SortableElement(Label);
FormElements.LineBreak = SortableElement(LineBreak);
FormElements.TextInput = SortableElement(TextInput);
FormElements.DynamicInput = SortableElement(DynamicInput);
FormElements.AmountInput = SortableElement(AmountInput);
FormElements.DocumentSelect = SortableElement(DocumentSelect);
FormElements.CascadeSelect = SortableElement(CascadeSelect);
FormElements.DynamicMultiInput = SortableElement(DynamicMultiInput);
FormElements.DataGridInput = SortableElement(DataGridInput);
FormElements.CustomSelect = SortableElement(CustomSelect);
FormElements.CustomDatePicker = SortableElement(CustomDatePicker);
FormElements.TableInput = SortableElement(TableInput);
FormElements.PasswordInput = SortableElement(PasswordInput);
FormElements.MultiFileUpload = SortableElement(MultiFileUpload);
FormElements.EmailInput = SortableElement(EmailInput);
FormElements.PhoneNumber = SortableElement(PhoneNumber);
FormElements.NumberInput = SortableElement(NumberInput);
FormElements.TextArea = SortableElement(TextArea);
FormElements.Dropdown = SortableElement(Dropdown);
FormElements.SmartAdaptorDropdown = SortableElement(SmartAdaptorDropdown);
FormElements.Signature = SortableElement(Signature);
FormElements.Checkboxes = SortableElement(Checkboxes);
FormElements.DatePicker = SortableElement(DatePicker);
FormElements.RadioButtons = SortableElement(RadioButtons);
FormElements.RadioButton = SortableElement(RadioButton);
FormElements.Image = SortableElement(Image);
FormElements.Rating = SortableElement(Rating);
FormElements.Tags = SortableElement(Tags);
FormElements.HyperLink = SortableElement(HyperLink);
FormElements.Download = SortableElement(Download);
FormElements.Camera = SortableElement(Camera);
FormElements.FileUpload = SortableElement(FileUpload);
FormElements.Range = SortableElement(Range);
FormElements.PlaceHolder = SortableElement(PlaceHolder);
FormElements.FieldSet = SortableElement(FieldSet);
FormElements.TwoColumnRow = SortableElement(TwoColumnRow);
FormElements.ThreeColumnRow = SortableElement(ThreeColumnRow);
FormElements.MultiColumnRow = SortableElement(MultiColumnRow);
FormElements.CustomElement = SortableElement(CustomElement);

export default FormElements;
