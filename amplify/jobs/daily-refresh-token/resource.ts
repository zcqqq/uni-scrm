import { defineFunction } from "@aws-amplify/backend";

export const dailyRefreshToken = defineFunction({
  name: "daily-refresh-token",
  schedule: "every day",
});