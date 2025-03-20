/**
 * @typedef {{prefix: string, entity_id: string, component_id: string, mfe_settings: Record<string, unknown>}} InstallParams
 * @param {CbServer.BasicReq & {params: InstallParams}} req
 * @param {CbServer.Resp} resp
 */

function dm_fw_teardown(req, resp) {
  const params = req.params;
  const DASHBOARD_COLL = ClearBladeAsync.Collection('dashboards');

  console.debug(req);

  function removePermissionsFromRole(roleId) {
    return ClearBladeAsync.Role(roleId).setPermissions([
      {
        "type": "topic",
        "name": "devices/software/update",
        "level": 0
      }
    ])
  }

  function retrieveDashboard() {
    return DASHBOARD_COLL.fetch(ClearBladeAsync.Query().equalTo("label", "Device Software Management"));
  };

  function removeDashboard() {
    return new Promise(function(resolve, reject) {

      retrieveDashboard()
      .then(function(rows) {
        if (rows.DATA.length > 0) {
          const dashboard = rows.DATA[0];
          const dashboardRequest = {
            "name": "dashboards.delete",
            "body": {
              "id": dashboard.id
            }
          };
          const mfeRequest = {
            "name": "microfrontends.delete",
            "body": {
              "id": dashboard.microfrontend_id
            }
          };

          resolve(Promise.all([
            ClearBladeAsync.Code().execute("deleteTableItems", dashboardRequest, false),
            ClearBladeAsync.Code().execute("deleteTableItems", mfeRequest, false)
          ]));
        }
        resolve();
      }) 
      .catch(function(error) {
        console.error("Error removing dashboard: " + JSON.stringify(error));
        reject(error);
      });
    });
  }

  //Remove topic (publish) permissions from devices/software/update
  // ClearBladeAsync.Roles().read(ClearBladeAsync.Query().equalTo("name", "Administrator").or(ClearBladeAsync.Query().equalTo("name", "Editor")))
  // .then(function(data) {
  //   return Promise.all(data
  //     .map(function (role) {
  //       console.debug("Applying permissions for role " + role.name);
  //       return removePermissionsFromRole(role.role_id);
  //     }));
  // })
  // .then(function () {
  console.debug("Removing dashboard row");
  removeDashboard()
  .then(function (results) {
    console.debug(results);
    resp.success('Success');
  })
  .catch(function (error) {
    console.error("Error tearing down component: " + JSON.stringify(error));
    resp.error("Error tearing down component: " + JSON.stringify(error));
  });
}