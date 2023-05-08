# express-strava

[![build](https://github.com/markbradley27/express-strava/workflows/build/badge.svg)](https://github.com/markbradley27/express-strava/actions/workflows/build.yaml)
[![test](https://github.com/markbradley27/express-strava/workflows/test/badge.svg)](https://github.com/markbradley27/express-strava/actions/workflows/test.yaml)

Express handlers for the strava webhook API.

## Quickstart

1. The following code will spin up an express server that handles strava webhooks:

   ```typescript
   // server.ts
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
         console.log(`activity_create_handler here, handling activity: ${data.object_id}`),
     })
   );

   const port = 8080;
   app.listen(port, () => {
     console.log(`Listening on port: ${port}`);
   });
   ```

1. Fire it up (with debug output) and it should start listening:

   ```bash
   $ DEBUG=express-strava:* ts-node server.ts
   Listening on port: 8080
   ```

1. To create the webhook subscription, follow [these
   instructions](https://developers.strava.com/docs/webhookexample/), skipping
   the steps for creating and running your express server (we just did that!
   😃).

   If the subscription was created successfully, you should have seen something
   like this:

   ```
   express-strava:get echoing challenge; {"hub.verify_token":"STRAVA","hub.challenge":"80292665ca052d4e","hub.mode":"subscribe"} +0ms
   ```

1. Go do something cool and post it to Strava! Once you're done, you should see
   the server receive the activity created event and dispatch it to your
   handler:

   ```
   express-strava:post dispatching to activity_create_handler; {"aspect_type":"create","event_time":1682391474,"object_id":1234567890,"object_type":"activity","owner_id":2222222,"subscription_id":333333,"updates":{}} +0ms
   activity_create_handler here, handling activity: 1234567890
   ```
