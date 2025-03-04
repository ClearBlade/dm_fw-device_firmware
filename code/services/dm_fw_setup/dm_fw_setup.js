/**
 * @typedef {{prefix: string, entity_id: string, component_id: string, mfe_settings: Record<string, unknown>}} InstallParams
 * @param {CbServer.BasicReq & {params: InstallParams}} req
 * @param {CbServer.Resp} resp
 */

function dm_fw_setup(req, resp) {
  const params = req.params;
  const SYSINFO_COLL = ClearBladeAsync.Collection('system_info');

  function applyPermissionsToRole(roleId) {
    //TODO - Add collection permissions
    //Add topic (publish) permissions
      return ClearBladeAsync.Role(roleId).setPermissions([
        {
          "type": "dashboard",
          "name": "software_updater",
          "level": ClearBladeAsync.Permissions.READ
        },
        {
          "type": "dashboard",
          "name": "software_uploader",
          "level": ClearBladeAsync.Permissions.READ
        }
      ])
  }

  function getSystemInfoConfig() {
    return new Promise(function(resolve, reject) {
      var config = {};

      SYSINFO_COLL.fetch(ClearBladeAsync.Query().equalTo("name", "Asset Monitor"))
      .then(function(rows) {
        if (rows && rows.DATA.length > 0) {
          config = JSON.parse(rows.DATA[0].configuration)
        }
        resolve(config);
      })
      .catch(function(error) {
        reject(error);
      });
    })
  }
  
  function addPortalsToConfig(config) {
    var uploadExists = false;
    var installExists = false;

    if (!config.external_links) config.external_links = [];

    config.external_links.forEach(function(element) {
      if (element.name === "Software Upload") uploadExists = true;
      if (element.name === "Software Install") installExists = true;
    });

    if (!uploadExists) {
      config.external_links.push({
        "name": "Software Upload",
        "url": "https://demo.clearblade.com/portal/?systemKey=AAAAAAAAAAAAAAAAAAAAAJ57Q_x8iWoS4tFYV4x3_w2gverY9aiEvOv1bfAP4A==&systemSecret=AAAAAAAAAAAAAAAAAAAAAGhvgP7pAQ==&name=software_uploader&allowAnon=true"
      });
    }

    if (!installExists) {
      config.external_links.push({
        "name": "Software Install",
        "url": "https://demo.clearblade.com/portal/?systemKey=AAAAAAAAAAAAAAAAAAAAAJ57Q_x8iWoS4tFYV4x3_w2gverY9aiEvOv1bfAP4A==&systemSecret=AAAAAAAAAAAAAAAAAAAAAGhvgP7pAQ==&name=software_updater&allowAnon=true"
      });
    }
  }

  function updateSystemInfoConfig(config) {
    return SYSINFO_COLL.update(ClearBladeAsync.Query().equalTo("name", "Asset Monitor"), JSON.stringify({"configuration": config}));
  }

  //Add execute permissions to editor and administrator roles for checkEdgeDeviceStatus and createOpcuaMap
  //Add portal permissions to editor and administrator roles
  ClearBladeAsync.Roles().read(ClearBladeAsync.Query().equalTo("name", "Administrator").or(ClearBladeAsync.Query().equalTo("name", "Editor")))
  .then(function(data) {
    return Promise.all(data
      .map(function (role) {
        console.debug("Applying permissions for role " + role.name);
        return applyPermissionsToRole(role.role_id);
      }));
  })
  .then(function (results) {
    console.debug("Retrieving configuration from system_info");
    return getSystemInfoConfig();
  })
  .then(function (config) {
    console.debug("Adding portals to configuration.external_links");
    addPortalsToConfig(config);

    console.debug("Updating configuration in system_info");
    return updateSystemInfoConfig(config);
  })
  .then(function () {
    resp.success('Success');
  })
  .catch(function (error) {
    console.error("Error applying permissions to roles: " + JSON.stringify(error));
    resp.error("Error applying permissions to roles: " + JSON.stringify(error));
  });
}