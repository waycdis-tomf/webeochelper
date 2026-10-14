# WAYCDIS' WebEOC Main Helper Library
```
wcd-weoc.js
wcd-weoc.css
```
This is a library being maintained by the team at WAYCDIS to help make WebEOC development just a bit easier. We are always open to suggestions/asks/contributions, but otherwise we offer this freely to agencies and organizations around the world that use Juvare's WebEOC product and have an in-house development staff.

## wcd
wcd is the main object in our library. It holds valuable properties of your current context in WebEOC, links to the modules that are additionally supplied, and functions to quickly handle different functions.

### Example
```javascript
{
    apiURL: `https://webeoc.agency.gov/weoc/api/rest.svc/`,
    bdURL: `https://webeoc.agency.gov/weoc/boards/boarddata.ashx`,
    board: `Request for Assistance`,
    dataid: `113`,
    incidentid: `68`,
    incidentname: `I68W East Wildfires (String)`,
    instanceName: `eoc7`,
    invalidFields: [select, input#requestorName, ...],
    modules: {
        "loading": {
            "id": "loading",
            "name": "WAYCDIS Load Screen",
            "version": "0.1",
            "small": {},
            "fullscreen": {}
        },
        ...
    },
    originalData: {
        fields: {
            requestorName: 'john.smith@agency.gov',
            otherRequest: null
        }
        files: {
            requestAttachment: File
        }
    },
    pdf: false,
    positionname: `EOC Coordinator`,
    relateddataid: `0`,
    table: `Requests`,
    tableid: `41`,
    topCP: Window,
    username: `john.smith@agency.gov`,
    uvid: `1.1.168743.174275`,
    version: `1.0`,
    view: `New Request`,
    viewid: `1170`,
    webeocURL: `https://webeoc.agency.gov/weoc`
}
```

### Properties
- **apiURL**: This will have the full URL to the REST svc endpoint. *(String)*
- **bdURL**: Has the URL for the instance's boarddata.ashx. Useful for manually getting board information from WebEOC. *(String)*
- **board**: Current board name. *(String)*
- **dataid**: Current dataid. *(String)*
- **incidentid**: Current incident ID. *(String)*
- **incidentname**: Current incident name. *(String)*
- **instanceName**: Web application path for WebEOC. Usually the part right after the FQDN. *(String)*
- **invalidFields**: Shows which fields are not passing validation when WCD validation is used. *(Object)*
- **modules**: All currently loaded WCD modules. Loading and search are included in the base library. *(Object)*
- **originalData**: An object with some information about the data found on load of the page. *(Object)*
- **pdf**: Whether in a PDF rendering or not. *(Boolean)*
- **positionname**: Current position name. *(String)*
- **relateddataid**: Current relateddataid. *(String)*
- **table**: Current table name. *(String)*
- **tableid**: Current table ID. *(String)*
- **topCP**: A reference of the top window, usually housing the control panel in WebEOC. *(Object)*
- **username**: Current username. *(String)*
- **uvid**: Current window UVID. *(String)*
- **version**: Version of WCD helper library. *(String)*
- **view**: Current view name. *(String)*
- **viewid**: Current view ID. *(String)*
- **webeocURL**: Holds the main URL of the current WebEOC instance. *(String)*

### Functions (Prepend with wcd.)
- **addMod({...})**: Used to add a WCD module with information to the library.
```javascript
...{
    id: `select`,
    name: `WAYCDIS Select`,
    entities: [],
    version: `0.1`
}
```
- **apiCall({...})**: Used to easily make a WebEOC API call. Only supply one or none of: data, filter, or attachment.
```javascript
...{ 
    endpoint: `board/Request for Assistance/input/Input Request/43`,// Always required
    data: false || {// Only required if adding/editing data
        requestorName: 'not.john.smith@agency.gov'
    },
    filter: false || {// Only required if retreiving records that match a filter
        boolean: `and` || `or`,
        items: [
            {
                fieldname: `requestorName`,
                operator: `Equal` || `LessThan` || `GreaterThan` || `LessThanOrEqual` || `GreaterThanOrEqual` || `Like` || `Intersects` || `NotEqual`
                fieldvalue: `john.smith@agency.gov`
            }
        ]
    },
    attachment: false || new FormData().append(input[type=`file`].files[0]),// Only required if attaching file to a record
    dataProp: true || false,// Whether to have the data go into a parent 'data' property.
    headers: {}// Any additional headers to pass
}
```
- **buildModal({...})**: Used to quickly generate a modal without any premade element in the page. This will return what button was clicked as well as any formdata inside.
```javascript
...{
    type: `action` || `info`,// Action has buttons, info is simply an alert
    title: 'Delete Confirmation', 
    body: documentFragment || element || 'Do you want to delete this record?',// Can be an actual HTML element or just a string. You can put form inputs in this to retreive data.
    validate: false || true,// Validate any form elements for any button click.
    cancelFunction: async () => Promise.resolve(),// Can have any code or function run on cancel of the modal.
    footer: false || [// Array of button objects for footer
        {
            text: 'Confirm',// Text on and name of a button
            color: 'error',// Bootstrap color option
            icon: false,// A material design icon name
            validate: false,// Whether to validate form data before considering action.
            buttonFunction: async () => Promise.resolve()// Any code or function to run on click of button.
        }
    ]
}
```
- **clearFormValidation(document.querySelector('body') || element)**: Used to clear bootstrap validation classes off of the specified element.
- **clearOriginalData()**: Empties the originalData property of wcd. Useful if trying to do something custom with original values.
- **formatCurrency(numberToFormat)**: Takes any decimal number and rounds it to nearest hundredth, and prepends with a $.
- **formatDT()**: [deprecated] UNUSED
- **getAllFormFields(document.querySelector('body') || element)**: Gets any form data field, such as input, textarea, and select inside the specified element.
- **getBoardData()**: Returns an object with the board, view, and table names.
- **getChangedValues(wcd.getFormData(document.querySelector('body')) || formData)**: Grabs the input, select, and textarea data, and parses to only show the changed values since load of the form.
- **getFormData(...)**: Gets a formatted object with fields and files, with respective names and values.
```javascript
...document.querySelector('body') || element,// 1st param is any specified element to grab data from inside.
    false || true// 2nd param is whether to get wcd.hidden fields as well.
```
- **getHiddenElements(document.querySelector('body') || element)**: Gets all hidden input, select, or textarea elements inside the specified element.
- **getVisibleFormFields(document.querySelector('body') || element)**: Gets all visible input, select, or textarea elements inside the specified element.
- **hide(...)**: Hides an element. Applies a class so that it is excluded from form data acquisition.
```javascript
...element,// 1st param| Any specified
    `instant` || `fade` || `collapse`,// 2nd param| The animation used to hide the element
    false || true// If true, it does not add the wcdHidden class
```
- **httpCall()**: [deprecated] Originally an ES5 method to simulate jQuery's ajax call.
- **makeDraggable()**: Morphs an element to allow it to be dragged around.
- **objToFormData()**: 
- **objToQueryString()**
- **parseJSON()**
- **reloadElement()**
- **removeRestore()**
- **saveCurrentRecord()**
- **setBoardData()**
- **setOriginalData()**
- **show()**
- **validateFormData()**

# WAYCDIS' WebEOC History Library
```
wcd-weoc-history.js
```

### Setup & Installation
To integrate the history library, add the markup below to your HTML view. This container manages the main record history along with optional parent, child, and grandchild history views.

```html
<div id="wcd-history" data-wcd-view="History_Viewlink" data-wcd-children="yes">
    <viewlink name="History_Viewlink" />
</div>
```

### Configuration Reference
The following table describes the supported field naming conventions and elements used in the example.
| Attribute | Required | Description |
| :--- | :--- | :--- |
| `id` | Yes | Must always be set to wcd-history. |
| `data-wcd-view` | Yes | The name of the viewlink used to fetch history data. |
| `data-wcd-children` | No | Optional attribute to include child and/or grandchild history. |
| `<viewlink name="History_Viewlink" />` | Yes | Specifies the view that will contain the main record's history. |

### History View Example
The following example demonstrates how to configure a record history view, including field expressions, data formatting, sorting, and related child records.

```html
<html>
    <eocrepeatallrecords rowcount="0" sort="entrydate desc">
        <expression name="Field_Example_Text">field_text</expression>
        <expression name="Field_Example_Date">field_date</expression>
        <expression name="Field_Example_AmountþMoney">field_amount</expression>
        <expression name="Field_Example_FileþAttachment">field_attachment</expression>
        <expression name="custom_dt_entry">field_custom_date_time</expression>
        <expression name="RemoveExp">COALESCE(field_remove, '0')</expression>
        <relatedlist rowcount="0" sort="entrydate desc" table="Child_Table" filter="LOWER(COALESCE(field_remove, '')) != 'yes'">
            <relatedlistexpression name="api_view" table="Child_Table">'Child_History_View'</relatedlistexpression>
        </relatedlist>
    </eocrepeatallrecords>
</html>
```

### Configuration Reference
The following table describes the supported field naming conventions and elements used in the example.
| Attribute | Required | Description |
| :--- | :--- | :--- |
| `þMoney` | No | Identifies a monetary field and applies the appropriate currency formatting. |
| `þAttachment` | No | Identifies a file attachment field. |
| `Date` or `date` | No | Identifies a date or date-time field for appropriate formatting. |
| `<expression name="custom_dt_entry">` | No | By default, the history library uses `entrydate` for timestamps; to use a custom field, define `custom_dt_entry` in the `History_Viewlink` view with the desired field name. |
| `<relatedlist>` | No | Includes related records from a child table in the history view. |

# WAYCDIS' WebEOC Card Library
```
wcd-weoc-history.js
```

### Card Example
The following example demonstrates how to configure an HTML table within the <eocrepeatallrecords> tag to display records as cards on mobile devices while retaining a traditional table layout on desktop devices.


| Attribute | Required | Description |
| :--- | :--- | :--- |
| `.wcdConvertCard` and `.d-none` | Yes | Apply both classes to the <table> element to enable the responsive card layout. Records display in a traditional table format on desktop and a card format on mobile devices. |
| `.wcdConvertCardExclude` | Yes | Apply this class to an actions <th> element to assign a narrower column width. Use it for action columns containing options such as Edit, Details, or Delete. |
| `data-wcdspread_label` | Yes | Add this attribute to every <td> element inside <eocrepeatallrecords>. Its value defines the label displayed alongside the corresponding field value in the mobile card layout. |


```html
<table class="wcdConvertCard d-none">
    <thead>
        <tr>
            <th><sortlink field="sample_text_field">Sample Text Field</sortlink></th>
            <th><sortlink field="sample_date_field">Sample Date Field</sortlink></th>
            <th>Money Field</th>
        </tr>
    </thead>
    <tbody>
        <eocrepeatallrecords rowcount="0" sort="entrydate desc">
            <tr>
                <td data-wcdspread_label="Sample Text Field:"><eocfield disableclick="true" name="sample_text_field" /></td>
                <td data-wcdspread_label="Sample Date Field:"><eocfield disableclick="true" name="sample_date_field" /></td>
                <td data-wcdspread_label="Sample Money Field:"><eocfield disableclick="true" name="sample_money_field" /></td>
            </tr>
        </eocrepeatallrecords>
    </tbody>
</table>
```

### Configuration Reference
The following table describes the CSS classes, attributes, and naming conventions used to control the table-to-card layout.

| Attribute | Required | Description |
| :--- | :--- | :--- |
| `.wcdConvertCard` and `.d-none` | Yes | Apply both classes to the <table> element to enable the responsive card layout. Records display in a traditional table format on desktop and a card format on mobile devices. |
| `.wcdConvertCardExclude` | Yes | Apply this class to an actions <th> element to assign a narrower column width. Use it for action columns containing options such as Edit, Details, or Delete. |
| `data-wcdspread_label` | Yes | Add this attribute to every <td> element inside <eocrepeatallrecords>. Its value defines the label displayed alongside the corresponding field value in the mobile card layout. |

### Notes
- Ensure each data-wcdspread_label value clearly identifies the associated field.
- Keep the labels consistent with the corresponding table headers to improve readability across desktop and mobile layouts.