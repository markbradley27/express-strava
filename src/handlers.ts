import express from "express";
import {
  ActivityCreateData,
  ActivityDeleteData,
  ActivityUpdateData,
  AthleteCreateData,
  AthleteDeleteData,
  AthleteUpdateData,
  WebhookData,
} from "./types";
import debugg from "debug";

type HandlerReturn = Promise<void> | void;

interface StravaHandlersOptions {
  verify_token: string;
  athlete_create_handler?: (data: AthleteCreateData) => HandlerReturn;
  athlete_update_handler?: (data: AthleteUpdateData) => HandlerReturn;
  athlete_delete_handler?: (data: AthleteDeleteData) => HandlerReturn;
  activity_create_handler?: (data: ActivityCreateData) => HandlerReturn;
  activity_update_handler?: (data: ActivityUpdateData) => HandlerReturn;
  activity_delete_handler?: (data: ActivityDeleteData) => HandlerReturn;
}

export default function StravaHandlers(opts: StravaHandlersOptions) {
  const router = express.Router();

  router.use(express.json());

  router.get("/", (req: express.Request, res: express.Response) => {
    const debug = (msg: string) => {
      debugg("express-strava:get")(`${msg}; ${JSON.stringify(req.query)}`);
    };

    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const verify_token = req.query["hub.verify_token"];

    if (mode !== "subscribe" || verify_token !== opts.verify_token) {
      debug("bad mode or verify token");
      res.sendStatus(403);
      return;
    }

    debug("echoing challenge");
    res.json({ "hub.challenge": challenge });
  });

  router.post("/", (req: express.Request, res: express.Response) => {
    const debug = (msg: string) => {
      debugg("express-strava:post")(`${msg}; ${JSON.stringify(req.body)}`);
    };

    const data = req.body as WebhookData;

    let handler: { (): HandlerReturn } | undefined = undefined;
    switch (data.object_type) {
      case "athlete": {
        switch (data.aspect_type) {
          case "create": {
            handler = opts.athlete_create_handler?.bind(null, data);
            break;
          }
          case "update": {
            handler = opts.athlete_update_handler?.bind(null, data);
            break;
          }
          case "delete": {
            handler = opts.athlete_delete_handler?.bind(null, data);
            break;
          }
          default: {
            debug("unexpected aspect type");
            res.sendStatus(403);
            return;
          }
        }
        break;
      }
      case "activity": {
        switch (data.aspect_type) {
          case "create": {
            handler = opts.activity_create_handler?.bind(null, data);
            break;
          }
          case "update": {
            handler = opts.activity_update_handler?.bind(null, data);
            break;
          }
          case "delete": {
            handler = opts.activity_delete_handler?.bind(null, data);
            break;
          }
          default: {
            debug("unexpected aspect type");
            res.sendStatus(403);
            return;
          }
        }
        break;
      }
      default: {
        debug("unexpected object type");
        res.sendStatus(403);
        return;
      }
    }

    if (handler === undefined) {
      debug(
        `no ${data.object_type}_${data.aspect_type}_handler to dispatch to`
      );
      res.sendStatus(200);
      return;
    }

    const handle_error = (error: unknown) => {
      debug(
        `${data.object_type}_${data.aspect_type}_handler threw an error: \
          ${(error as Error).message}`
      );
      res.sendStatus(500);
    };

    try {
      debug(`dispatching to ${data.object_type}_${data.aspect_type}_handler`);
      const result = handler();
      if (result == null) {
        res.sendStatus(200);
        return;
      }
      result.then(() => res.sendStatus(200)).catch(handle_error);
    } catch (error) {
      handle_error(error);
    }
  });

  return router;
}
