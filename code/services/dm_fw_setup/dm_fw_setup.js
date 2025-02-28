/**
 * @typedef {{prefix: string, entity_id: string, component_id: string, mfe_settings: Record<string, unknown>}} InstallParams
 * @param {CbServer.BasicReq & {params: InstallParams}} req
 * @param {CbServer.Resp} resp
 */

function dm_fw_setup(req, resp) {
  const params = req.params;

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

    //TODO - Add portals to external links in system_info


    console.debug(results);
    resp.success('Success');
  })
  .catch(function (error) {
    console.error("Error applying permissions to roles: " + JSON.stringify(error));
    resp.error("Error applying permissions to roles: " + JSON.stringify(error));
  });
}