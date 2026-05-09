export const eventSliderConfig = {
  api: {
    grid: "/api/Slider/GetAll",
    getById: "/api/Slider/GetById",
    add: "/api/Slider/Add",
    edit: "/api/Slider/Edit",
    remove: "/api/Slider/Delete",
    viewTypes: "/api/Slider/GetViewTypes",
    userTypes: "/api/Slider/GetUserTypes",
  },
  ui: {
    defaultPageSize: 10,
  },
} as const;
