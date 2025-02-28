/**
 * @typedef {{prefix: string, entity_id: string, component_id: string, mfe_settings: Record<string, unknown>}} InstallParams
 * @param {CbServer.BasicReq & {params: InstallParams}} req
 * @param {CbServer.Resp} resp
 */

function dm_fw_teardown(req, resp) {
  const params = req.params;

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
      }
    ])
}

  //Remove execute permissions from editor and administrator roles for checkEdgeDeviceStatus and createOpcuaMap
  //Remove portal permissions from editor and administrator roles
  ClearBladeAsync.Roles().read(ClearBladeAsync.Query().equalTo("name", "Administrator").or(ClearBladeAsync.Query().equalTo("name", "Editor")))
  .then(function(data) {
    return Promise.all(data
      .map(function (role) {
        console.debug("Applying permissions for role " + role.name);
        return removePermissionsFromRole(role.role_id);
      }));
  })
  .then(function (results) {
    console.debug(results);
    resp.success('Success');
  })
  .catch(function (error) {
    console.error("Error applying permissions to roles: " + JSON.stringify(error));
    resp.error("Error applying permissions to roles: " + JSON.stringify(error));
  });
}