export const notifConfig = {
  api: {
    grid: "Notification/GetAll",
    getById: "Notification/GetById",
    add: "Notification/Add",
    edit: "Notification/Edit",
    remove: "Notification/Delete",
  },
  ui: {
    defaultPageSize: 10,
  },
} as const;
