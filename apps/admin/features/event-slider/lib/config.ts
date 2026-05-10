export const eventSliderConfig = {
  api: {
    grid: "Slider/GetAll",
    getById: "Slider/GetById",
    add: "Slider/Add",
    edit: "Slider/Edit",
    remove: "Slider/Delete",
  },
  ui: {
    defaultPageSize: 10,
  },
} as const;
