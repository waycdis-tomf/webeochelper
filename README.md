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