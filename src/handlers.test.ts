/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import chai from "chai";
import chaiHttp from "chai-http";
import express from "express";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import StravaHandlers from "./handlers";

chai.use(chaiHttp);
chai.use(sinonChai);
const { expect, request } = chai;

describe("StravaHandlers", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
  });

  describe("get", () => {
    it("echos challenge when mode and verify token are correct", async () => {
      const verify_token = "abra cadabra";
      app.use(StravaHandlers({ verify_token }));

      const challenge = "en garde";
      const res = await request(app).get("/").query({
        "hub.mode": "subscribe",
        "hub.challenge": challenge,
        "hub.verify_token": verify_token,
      });

      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.eql({ "hub.challenge": challenge });
    });

    it("returns 403 when mode is not 'subscribe'", async () => {
      const verify_token = "abra cadabra";
      app.use(StravaHandlers({ verify_token }));

      const res = await request(app).get("/").query({
        "hub.mode": "definitely not subscribe",
        "hub.challenge": "doesn't matter",
        "hub.verify_token": verify_token,
      });

      expect(res).to.have.status(403);
    });

    it("returns 403 when verify token doesn't match", async () => {
      app.use(StravaHandlers({ verify_token: "the correct token" }));

      const res = await request(app).get("/").query({
        "hub.mode": "subscribe",
        "hub.challenge": "doesn't matter",
        "hub.verify_token": "an incorrect token",
      });

      expect(res).to.have.status(403);
    });
  });

  describe("post", () => {
    let valid_data: any;

    beforeEach(() => {
      valid_data = {
        event_time: 1,
        object_id: 2,
        owner_id: 3,
        subscription_id: 4,
        object_type: "athlete",
        aspect_type: "create",
      };
    });

    it("returns 403 if the object type is unexpected", async () => {
      app.use(StravaHandlers({ verify_token: "doesn't matter" }));

      const invalid_data = valid_data;
      invalid_data.object_type = "bad object type";
      const res = await request(app).post("/").send(invalid_data);

      expect(res).to.have.status(403);
    });

    it("returns 403 if the aspect type is unexpected", async () => {
      app.use(StravaHandlers({ verify_token: "doesn't matter" }));

      const invalid_data = valid_data;
      invalid_data.aspect_type = "bad aspect type";
      const res = await request(app).post("/").send(invalid_data);

      expect(res).to.have.status(403);
    });

    it("returns 200 if no handler registered for this event", async () => {
      app.use(StravaHandlers({ verify_token: "doesn't matter" }));

      const res = await request(app).post("/").send(valid_data);

      expect(res).to.have.status(200);
    });

    it("returns 500 if handler throws an error", async () => {
      app.use(
        StravaHandlers({
          verify_token: "doesn't matter",
          athlete_create_handler: () => {
            throw Error("nope!");
          },
        })
      );

      const data = valid_data;
      data.object_type = "athlete";
      data.aspect_type = "create";
      const res = await request(app).post("/").send(valid_data);

      expect(res).to.have.status(500);
    });

    it("dispatches to athlete_create_handler", async () => {
      const spy_athlete_create_handler = sinon.spy();
      app.use(
        StravaHandlers({
          verify_token: "doesn't matter",
          athlete_create_handler: spy_athlete_create_handler,
        })
      );

      const data = valid_data;
      data.object_type = "athlete";
      data.aspect_type = "create";
      const res = await request(app).post("/").send(data);

      expect(res).to.have.status(200);
      expect(spy_athlete_create_handler).to.have.been.calledOnceWith(data);
    });

    it("dispatches to athlete_update_handler", async () => {
      const spy_athlete_update_handler = sinon.spy();
      app.use(
        StravaHandlers({
          verify_token: "doesn't matter",
          athlete_update_handler: spy_athlete_update_handler,
        })
      );

      const data = valid_data;
      data.object_type = "athlete";
      data.aspect_type = "update";
      const res = await request(app).post("/").send(data);

      expect(res).to.have.status(200);
      expect(spy_athlete_update_handler).to.have.been.calledOnceWith(data);
    });

    it("dispatches to athlete_delete_handler", async () => {
      const spy_athlete_delete_handler = sinon.spy();
      app.use(
        StravaHandlers({
          verify_token: "doesn't matter",
          athlete_delete_handler: spy_athlete_delete_handler,
        })
      );

      const data = valid_data;
      data.object_type = "athlete";
      data.aspect_type = "delete";
      const res = await request(app).post("/").send(data);

      expect(res).to.have.status(200);
      expect(spy_athlete_delete_handler).to.have.been.calledOnceWith(data);
    });

    it("dispatches to activity_create_handler", async () => {
      const spy_activity_create_handler = sinon.spy();
      app.use(
        StravaHandlers({
          verify_token: "doesn't matter",
          activity_create_handler: spy_activity_create_handler,
        })
      );

      const data = valid_data;
      data.object_type = "activity";
      data.aspect_type = "create";
      const res = await request(app).post("/").send(data);

      expect(res).to.have.status(200);
      expect(spy_activity_create_handler).to.have.been.calledOnceWith(data);
    });

    it("dispatches to activity_update_handler", async () => {
      const spy_activity_update_handler = sinon.spy();
      app.use(
        StravaHandlers({
          verify_token: "doesn't matter",
          activity_update_handler: spy_activity_update_handler,
        })
      );

      const data = valid_data;
      data.object_type = "activity";
      data.aspect_type = "update";
      const res = await request(app).post("/").send(data);

      expect(res).to.have.status(200);
      expect(spy_activity_update_handler).to.have.been.calledOnceWith(data);
    });

    it("dispatches to activity_delete_handler", async () => {
      const spy_activity_delete_handler = sinon.spy();
      app.use(
        StravaHandlers({
          verify_token: "doesn't matter",
          activity_delete_handler: spy_activity_delete_handler,
        })
      );

      const data = valid_data;
      data.object_type = "activity";
      data.aspect_type = "delete";
      const res = await request(app).post("/").send(data);

      expect(res).to.have.status(200);
      expect(spy_activity_delete_handler).to.have.been.calledOnceWith(data);
    });
  });
});
