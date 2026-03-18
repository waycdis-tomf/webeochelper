# WAYCDIS' WebEOC Main Helper Library
```
wcd-weoc.js
wcd-weoc.css
```
This is a library being maintained by the team at WAYCDIS to help make WebEOC development just a bit easier. We are always open to suggestions/asks/contributions, but otherwise we offer this freely to agencies and organizations around the world that use Juvare's WebEOC product and have an in-house development staff.

## wcd
wcd is the main object in our library. It holds valuable properties of your current context in WebEOC, links to the modules that are additionally supplied, and functions to quickly handle different functions.

### Properties
- **apiURL**: This will have the full URL to the REST svc endpoint.
*ex) https://webeoc.agency.gov/weoc/api/rest.svc/*
- **bdURL**: Has the URL for the instance's boarddata.ashx. Useful for manually getting board information from WebEOC.
*ex) https://webeoc.agency.gov/weoc/boards/boarddata.ashx*
- **board**: Current board name.
- **dataid**: Current dataid.
- **incidentid**: Current incident ID.
- **incidentname**: Current incident name.
- **instanceName**: Web application path for WebEOC. Usually the part right after the FQDN.
- **invalidFields**: Shows which fields are not passing validation when WCD validation is used.
- **modules**: All currently loaded WCD modules. Loading and search are included in the base library.
- **originalData**: An object with some information about the data found on load of the page.
```javascript
{
    fields: //Any field values on load. Typically used in input views to do a differential check on values.
    files: //Any file type field information on load.
}
```
- **positionname**: Current position name.
- **relateddataid**: Current relateddataid.
- **table**: Current table name.
- **tableid**: Current table ID.
- **topCP**: A reference of the top window, usually housing the control panel in WebEOC.
- **username**: Current username.
- **uvid**: Current window UVID.
- **version**: Version of WCD helper library.
- **view**: Current view name.
- **viewid**: Current view ID.
- **webeocURL**: Holds the main URL of the current WebEOC instance.
*ex) https://webeoc.agency.gov/weoc*

### Functions
- addMod
