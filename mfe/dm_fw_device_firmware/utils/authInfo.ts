interface AuthInfo {
  systemKey: string;
  userToken: string;
}

export function getAuthInfo(): AuthInfo {
  const localStorageItem = localStorage.getItem("asset_monitor_auth_info");
  if (localStorageItem === null) {
    throw new Error("Could not find asset_monitor_auth_info in local storage");
  }
  const customerName = getCustomerName();
  const authInfo: { [key: string]: AuthInfo } = JSON.parse(localStorageItem);
  const radDemoAuthInfo = authInfo[customerName];
  if (typeof radDemoAuthInfo === "undefined") {
    throw new Error(`'${customerName}' auth info not found`);
  }
  return authInfo[customerName];
}

function getCustomerName(): string {
  const customerName = location.pathname.split("/")[2];
  if (!customerName) {
    throw new Error("Could not find customer name in URL");
  }

  return customerName;
}