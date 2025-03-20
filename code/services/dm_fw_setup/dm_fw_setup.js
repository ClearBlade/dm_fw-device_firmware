/**
 * @typedef {{prefix: string, entity_id: string, component_id: string, mfe_settings: Record<string, unknown>}} InstallParams
 * @param {CbServer.BasicReq & {params: InstallParams}} req
 * @param {CbServer.Resp} resp
 */

function dm_fw_setup(req, resp) {
  const params = req.params;
  const MFE_URL = 'https://cdn.jsdelivr.net/gh/ClearBlade/dm_fw-device_firmware@v0.0.1/dist/dm_fw_device_firmware.js';

  console.debug(req);

  function applyPermissionsToRole(roleId) {

      //Add topic permissions to devices/software/update
      return ClearBladeAsync.Role(roleId).setPermissions([
        {
          "type": "topic",
          "name": "devices/software/update",
          "level": 2
        }
      ])
  }

  function createDashboard() {
    var mfeRequest = {
      "name":"microfrontends.create",
      "body":{
        "type":"dashboard",
        "id": newUUID(),
        "url": MFE_URL,
        "config":null
      }
    }

    var dashboardRequest = {
      "name":"dashboards.create",
      "body":{
        "item":{
          "id": newUUID(),
          "label":"Device Software Management",
          "last_updated": new Date().toISOString(),
          "last_updated_by": req.userEmail,
          "version":"1.0.0",
          "pages":[
            {
              "id": newUUID(),
              "header":"",
              "controlLayouts":{
                "xs":[],
                "sm":[],
                "md":[],
                "lg":[],
                "xl":[]
              },
              "mainLayouts":{
                "xs":[],
                "sm":[],
                "md":[],
                "lg":[],
                "xl":[]
              },
              "widgets":[],
              "version":"1.0.0"
            }
          ],
          "description":"Microfrontend for Device Software Management",
          "microfrontend_id": mfeRequest.body.id,
          "defaults":{
            "time_range":{
              "count":1,
              "units":86400,
              "type":"relative"
            },
            "refresh_rate":{
              "count":0,
              "units":1
            }
          }
        },
        "groupIds":[
          "default"
        ]
      }
    };
    
    return Promise.all([
      ClearBladeAsync.Code().execute("createTableItems", dashboardRequest, false),
      ClearBladeAsync.Code().execute("createTableItems", mfeRequest, false)
    ]);
  }

  //Add topic (publish) permissions to devices/software/update
  // ClearBladeAsync.Roles().read(ClearBladeAsync.Query().equalTo("name", "Administrator").or(ClearBladeAsync.Query().equalTo("name", "Editor")))
  // .then(function(data) {
  //   return Promise.all(data
  //     .map(function (role) {
  //       console.debug("Applying permissions for role " + role.name);
  //       return applyPermissionsToRole(role.role_id);
  //     }));
  // })
  // .then(function (results) {
  console.debug("Creating dashbaord");
  createDashboard()
  .then(function () {
    resp.success('Success');
  })
  .catch(function (error) {
    console.error("Error setting up component: " + JSON.stringify(error));
    resp.error("Error setting up component: " + JSON.stringify(error));
  });
}