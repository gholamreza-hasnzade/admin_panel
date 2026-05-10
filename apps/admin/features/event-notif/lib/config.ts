export const eventNotifConfig = {
  api: {
    grid: "/api/Notification/GetAll",
    getById: "/api/Notification/GetById",
    add: "/api/Notification/Add",
    edit: "/api/Notification/Edit",
    remove: "/api/Notification/Delete",
  },
  ui: {
    defaultPageSize: 10,
  },
} as const;
