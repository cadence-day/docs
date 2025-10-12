export * from "./delete";
export * from "./get";
export * from "./insert";
export * from "./update";

// Legacy exports for backward compatibility
export { deleteNotificationSettings as deleteNotification } from "./delete";
export { getNotificationSettings as getNotifications } from "./get";
export { insertNotificationSettings as insertNotification } from "./insert";
export { updateNotificationSettings as updateNotification } from "./update";
