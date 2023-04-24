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

interface StravaHandlersOptions {
  verify_token: string;
  athlete_create_handler?: (data: AthleteCreateData) => void;
  athlete_update_handler?: (data: AthleteUpdateData) => void;
  athlete_delete_handler?: (data: AthleteDeleteData) => void;
  activity_create_handler?: (data: ActivityCreateData) => void;
  activity_update_handler?: (data: ActivityUpdateData) => void;
  activity_delete_handler?: (data: ActivityDeleteData) => void;
  logger?: (msg: string) => void;
}

export function StravaHandlers(opts: StravaHandlersOptions) {
  const router = express.Router();

  router.use(express.json());

  router.get("/", (req: express.Request, res: express.Response) => {
    const log_tmpl = (suffix: string) => {
      opts.logger &&
        opts.logger(
          `strava webhook get: ${suffix}; ${JSON.stringify(req.query)}`
        );
    };

    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const verify_token = req.query["hub.verify_token"];

    if (mode !== "subscribe" || verify_token !== opts.verify_token) {
      log_tmpl("bad mode or verify token");
      res.sendStatus(403);
      return;
    }

    log_tmpl("echoing challenge");
    res.json({ "hub.challenge": challenge });
  });

  router.post("/", (req: express.Request, res: express.Response) => {
    const log_tmpl = (suffix: string) => {
      opts.logger &&
        console.log(
          `strava webhook post: ${suffix}; ${JSON.stringify(req.body)}`
        );
    };

    const data = req.body as WebhookData;

    let handler: { (): void } | undefined = undefined;
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
            log_tmpl("unexpected aspect type");
            res.sendStatus(400);
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
            log_tmpl("unexpected aspect type");
            res.sendStatus(400);
            return;
          }
        }
        break;
      }
      default: {
        log_tmpl("unexpected object type");
        res.sendStatus(400);
        return;
      }
    }

    if (handler === undefined) {
      log_tmpl(
        `no ${data.object_type}_${data.aspect_type}_handler to dispatch to`
      );
      res.sendStatus(200);
      return;
    }

    try {
      log_tmpl(
        `dispatching to ${data.object_type}_${data.aspect_type}_handler`
      );
      handler();
      res.sendStatus(200);
      return;
    } catch (error) {
      log_tmpl(
        `${data.object_type}_${data.aspect_type}_handler threw an error: \
          ${(error as Error).message}`
      );
      res.sendStatus(500);
      throw error;
    }
  });

  return router;
}
