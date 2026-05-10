export const eventSliderConfig = {
  api: {
    grid: "/api/Slider/GetAll",
    getById: "/api/Slider/GetById",
    add: "/api/Slider/Add",
    edit: "/api/Slider/Edit",
    remove: "/api/Slider/Delete",
  },
  ui: {
    defaultPageSize: 10,
  },
} as const;
