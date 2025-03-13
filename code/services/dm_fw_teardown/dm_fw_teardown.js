/**
 * @typedef {{prefix: string, entity_id: string, component_id: string, mfe_settings: Record<string, unknown>}} InstallParams
 * @param {CbServer.BasicReq & {params: InstallParams}} req
 * @param {CbServer.Resp} resp
 */

function dm_fw_teardown(req, resp) {
  const params = req.params;
  const SYSINFO_COLL = ClearBladeAsync.Collection('system_info');

  function removePermissionsFromRole(roleId) {

    return ClearBladeAsync.Role(roleId).setPermissions([
      {
        "type": "dashboard",
        "name": "software_updater",
        "level": 0
      },
      {
        "type": "dashboard",
        "name": "software_uploader",
        "level": 0
      },
      {
        "type": "topic",
        "name": "devices/software/update",
        "level": 0
      }
    ])
  }

  function removePortalsFromConfig(config) {
    if (!config.external_links) config.external_links = [];
    var newLinks = [];

    config.external_links.forEach(function(element, ndx) {
      if (element.name !== "Software Upload" && element.name !== "Software Install") newLinks.push(element);
    });

    config.external_links = newLinks;
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

  function updateSystemInfoConfig(config) {
    return SYSINFO_COLL.update(ClearBladeAsync.Query().equalTo("name", "Asset Monitor"), {"configuration": JSON.stringify(config)});
  }

  //Remove portal permissions from editor and administrator roles
  //Remove topic (publish) permissions from devices/software/update
  ClearBladeAsync.Roles().read(ClearBladeAsync.Query().equalTo("name", "Administrator").or(ClearBladeAsync.Query().equalTo("name", "Editor")))
  .then(function(data) {
    return Promise.all(data
      .map(function (role) {
        console.debug("Applying permissions for role " + role.name);
        return removePermissionsFromRole(role.role_id);
      }));
  })
  .then(function (results) {
    console.debug("Retrieving configuration from system_info");
    return getSystemInfoConfig();
  })
  .then(function (config) {
    console.debug("Removing portals from configuration.external_links");
    removePortalsFromConfig(config);

    console.debug("Updating configuration in system_info");
    return updateSystemInfoConfig(config);
  })
  .then(function () {
    resp.success('Success');
  })
  .catch(function (error) {
    console.error("Error tearing down component: " + JSON.stringify(error));
    resp.error("Error tearing down component: " + JSON.stringify(error));
  });
}