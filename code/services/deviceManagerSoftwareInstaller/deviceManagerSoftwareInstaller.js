/**
 * Type: Micro Service
 * Description: A short-lived service which is expected to complete within a fixed period of time.
 * @param {CbServer.BasicReq} req
 * @param {string} req.systemKey
 * @param {string} req.systemSecret
 * @param {string} req.userEmail
 * @param {string} req.userid
 * @param {string} req.userToken
 * @param {boolean} req.isLogging
 * @param {[id: string]} req.params
 * @param {CbServer.Resp} resp
 */

function deviceManagerSoftwareInstaller(req, resp) {
  const installColl = ClearBladeAsync.Collection('device_software_installed');
  const versionColl = ClearBladeAsync.Collection('device_software_versions');
  const statusColl = ClearBladeAsync.Collection('device_software_install_status');
  const DEVICE_UPDATE_TOPIC = "devicemanagement/software/update";
  const cbdb = ClearBladeAsync.Database();

  function retrieveScheduledUpdates() {
    return installColl.fetch(
      ClearBladeAsync.Query().equalTo('status', "pending").lessThan('installation_date', new Date().toISOString()));
  }

  function retrieveFileVersionRow(softwareName, version) {
    return versionColl.fetch(
      ClearBladeAsync.Query().equalTo('name', softwareName).equalTo('version', version));
  }

  function createStatusRow(row) {
    return statusColl.create(row);
  }

  function createInstallRow(row) {
    return installColl.create(row);
  }

  function updateSoftwareInstalledStatus(installRow, status) {
    return installColl.update(ClearBladeAsync.Query().equalTo("id", installRow.id),{"status": status});
  }

  function createStatusRows(assetId, statusId, payload, status) {
    //Create the appropriate status rows in the database
    var now = new Date();

    var installRow = {
      "id": statusId,
      "install_request_date": now.toISOString(),
      "installation_date": payload.install_timestamp,
      "user_id": payload.userId,
      "asset_id": assetId,
      "software_descriptor": payload.softwareName,
      "version": payload.version,
      "status": status
    };

    var statusRow = {
      "id": statusId,
      "timestamp": now.toISOString(),
      "status": status
    };

    switch (status) {
      case "pending":
        statusRow.description = "Installation has been scheduled for " + payload.install_timestamp;
        break;
      case "requested":
        statusRow.description = "Installation request sent to edge/device";
        break;
    }

    return Promise.all([
      createInstallRow(installRow),
      createStatusRow(statusRow)
    ]);
  }

  function handleScheduledUpdate(installRow) {
    return new Promise(function (resolve, reject) {
      var now = new Date();
      
      //Retrieve the software version file details
      retrieveFileVersionRow(installRow.software_descriptor, installRow.version)
      .then(function(fileVersionRows) {
        return performSoftwareInstall(installRow.asset_id, installRow.id, fileVersionRows.DATA[0]);
      })
      .then(function(deviceId) {
        return Promise.all([
          updateSoftwareInstalledStatus(installRow, "requested"),
          createStatusRow({
              "id": installRow.id,
              "status": "requested",
              "timestamp": now.toISOString(),
              "description": "Install request sent to edge/device " + deviceId
          })
        ])
      })
      .then(function() {
        resolve();
      })
      .catch(function(error) {
        reject(error);
      });
    });
  }

  function retrieveAssetTreeForAsset (assetId) {
    return cbdb.query("select * from asset_trees where id = (select tree_id from assets where id = '" + assetId + "')");
  }

  function sendFileToEdge(edgeName, fileVersionRow) {
    //Copy file from sandbox to outbox
    return ClearBladeAsync.FS('devicemanager-files').syncFileToEdge(fileVersionRow.file_path + "/" + fileVersionRow.file_name, edgeName);
  }

  function publishUpdateRequest(edgeName, assetId, fileVersionRow) {
    var topic = DEVICE_UPDATE_TOPIC + "/" + fileVersionRow.device_type;
    var payload = {
      "assetId": assetId,
      "fileName": fileVersionRow.file_name,
      "filePath": fileVersionRow.file_path,
      "version": fileVersionRow.version
    };

    var messaging = new MQTT.Client();

    if (edgeName) {
      topic += "/_edge/" + edgeName;
      console.debug("topic: " + topic);
      return messaging.publish(topic, JSON.stringify(payload));
    } else {
      console.debug("topic: " + topic);
      return messaging.publish(topic, JSON.stringify(payload));
    }
  }

  function performSoftwareInstall(assetId, installId, fileVersionRow) {
    return new Promise(function(resolve, reject) {
      var edges = [];
      var now = new Date();

      retrieveAssetTreeForAsset(assetId)
      .then(function(trees) {
        //Retrieve all the nodes in the asset tree
        return cbdb.query("SELECT assets.id, type, asset_types.device_type, asset_types.schema \
          FROM assets JOIN asset_types on assets.type=asset_types.id \
          WHERE assets.id IN (" +
            Object.keys(JSON.parse(trees[0].tree).nodes)
              .map(function (id) {
                return "'" + id + "'";
              })
              .join(',') +
            ')'
        );
      })
      .then(function(assets) {
        //Find the edge asset
        edges = assets.filter(function (d){ 
          return d.device_type === 'edge';
        });

        if (edges.length > 0 && edges[0].id) {
          return sendFileToEdge(edges[0].id, fileVersionRow);
        } else {
          console.debug("No edges for device")
          return Promise.resolve();
        }
      })
      .then(function() {
          console.debug("Sending request to edge/device");
          return publishUpdateRequest(edges.length > 0 && edges[0].id ? edge.id : "", assetId, fileVersionRow)
      })
      .then(function(results) {
        //Update/add requested the status rows
        return Promise.all([
          updateSoftwareInstalledStatus({"id": installId}, "requested"),
          createStatusRow({
              "id": installId,
              "status": "requested",
              "timestamp": now.toISOString(),
              "description": "Install request sent to edge/device " + (edges.length > 0 && edges[0].id ? edge.id : assetId)
          })
        ]);
      })
      .then(function() {
        resolve(edges.length > 0 && edges[0].id ? edges[0].id : assetId);
      })
      .catch(function (error) {
        console.error("Error installing: " + JSON.stringify(error));
        reject(error);
      });
    });
  }

  function scheduleSoftwareInstall(assetId, payload) {
    return createStatusRows(assetId, newUUID(), payload, "pending");
  }

  function handleSoftwareInstall(assetId, payload, fileVersionRow) {
    return new Promise(function(resolve, reject) {
      var id = newUUID();
      createStatusRows(assetId, id, payload, "pending")
      .then(function() {
        return performSoftwareInstall(assetId, id, fileVersionRow);
      })
      .then(function() {
        resolve();
      })
      .catch(function(error) {
        console.error("Error: " + JSON.stringify(error));
        reject(error);
      });
    });
  }

  function handleMessageTrigger(payload) {
    // {
    //   "softwareName": "Firmware",
    //   "version": "1.0.1",
    //   "install_timestamp": "2025-02-28T17:25:00.000Z",
    //   "userId": "test@test.com",
    //   "assets": [
    //     "sim2",
    //     "sim1"
    //   ]
    // }
    
    //A message was published from the portal. Determine whether or not to send to the edge now or schedule the update
    if (payload.install_timestamp) {
      var now = new Date();

      //Retrieve the software version file details
      retrieveFileVersionRow(payload.softwareName, payload.version)
      .then(function(fileVersionRows) { 
        if ((new Date(payload.install_timestamp).getTime()) > now.getTime()) {
          //Schedule the install for the future
          console.debug("Scheduling software installs");
          return Promise.all(payload.assets.map(function(asset) {
            scheduleSoftwareInstall(asset, payload);
          }));
        } else {
          //Install on the devices now
          console.debug("Sending install to edges/devices");
          return Promise.all(payload.assets.map(function(assetId) {
            return handleSoftwareInstall(assetId, payload, fileVersionRows.DATA[0])
          }));
        }
      })
      .then(function(results) {
        resp.success("Messaging trigger processed");
      })
      .catch(function(error) {
        console.error("Error handling message trigger: " + JSON.stringify(error));
        resp.error(JSON.stringify(error));
      });
    }
  }

  function handleTimer() {
    //The timer expired, see if there are any installs that are ready to be scheduled
    retrieveScheduledUpdates()
    .then(function(rows) {
      return Promise.all(rows.DATA.map(function(row) {
        return handleScheduledUpdate(row);
      }));
    })
    .then(function(results) {
      resp.success("Timer processed");
    })
    .catch(function(error) {
      console.error("Error encountered processing scheduled updates: " + JSON.stringify(error));
      resp.error("Error encountered processing scheduled updates: " + JSON.stringify(error));
    })
  }

  if (req.params.trigger) {
    if (req.params.topic && req.params.body) {
      handleMessageTrigger(JSON.parse(req.params.body));
    } else {
      handleTimer();
    }
  }
}
