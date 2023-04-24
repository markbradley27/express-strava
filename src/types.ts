// TODO: Need to make sure these types are all correct.
export type BaseData = {
  event_time: number;
  object_id: number;
  owner_id: number;
  subscription_id: number;
};

type AthleteData = BaseData & {
  object_type: "athlete";
};

type ActivityData = BaseData & {
  object_type: "activity";
};

type CreateData = BaseData & {
  aspect_type: "create";
};

type UpdateData = BaseData & {
  aspect_type: "update";
};

type DeleteData = BaseData & {
  aspect_type: "delete";
};

export type AthleteCreateData = AthleteData & CreateData;
export type AthleteUpdateData = AthleteData & UpdateData;
export type AthleteDeleteData = AthleteData & DeleteData;

export type ActivityCreateData = ActivityData & CreateData;
export type ActivityUpdateData = ActivityData &
  UpdateData & {
    updates: {
      private?: "true" | "false";
      title?: string;
      type?: string;
      visibility?: "everyone" | "followers_only" | "only_me";
    };
  };
export type ActivityDeleteData = ActivityData & DeleteData;

export type WebhookData =
  | AthleteCreateData
  | AthleteUpdateData
  | AthleteDeleteData
  | ActivityCreateData
  | ActivityUpdateData
  | ActivityDeleteData;
