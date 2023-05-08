import express from "express";
import { ActivityCreateData, StravaHandlers } from "express-strava";

const app = express();

app.use(
  "/webhook",
  StravaHandlers({
    // Specify the verify token that will be provided when creating the
    // webhook subscription.
    verify_token: "STRAVA",

    // Register handlers for webhook events. We're only handling activity
    // creation here, but you can register handlers for all event types.
    activity_create_handler: (data: ActivityCreateData) =>
      console.log(
        `activity_create_handler here, handling activity: ${data.object_id}`
      ),
  })
);

const port = 8080;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
