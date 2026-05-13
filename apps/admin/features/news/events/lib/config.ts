export const eventsConfig = {
  api: {
    grid: "Events/GetAll",
    getById: "Events/GetById",
    add: "Events/Add",
    edit: "Events/Edit",
    remove: "Events/Delete",
  },
  ui: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50],
  },
} as const;
