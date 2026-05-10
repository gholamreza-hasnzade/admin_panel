export const eventNotifConfig = {
  api: {
    grid: "/api/Notification/GetAll",
    getById: "/api/Notification/GetById",
    add: "/api/Notification/Add",
    edit: "/api/Notification/Edit",
    remove: "/api/Notification/Delete",
    viewTypes: "/api/BaseData/GetViewTypes",
    userTypes: "/api/BaseData/GetUserTypes",
  },
  ui: {
    defaultPageSize: 10,
  },
} as const;
