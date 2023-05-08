// TODO: Need to make sure these types are all correct.
type ActivityObjectType = "activity";
type AthleteObjectType = "athlete";
export type ObjectType = ActivityObjectType | AthleteObjectType;

type CreateAspectType = "create";
type UpdateAspectType = "update";
type DeleteAspectType = "delete";
export type AspectType = CreateAspectType | UpdateAspectType | DeleteAspectType;

type BaseData = {
  event_time: number;
  object_id: number;
  owner_id: number;
  subscription_id: number;
};

type AthleteData = BaseData & {
  object_type: AthleteObjectType;
};

type ActivityData = BaseData & {
  object_type: ActivityObjectType;
};

type CreateData = BaseData & {
  aspect_type: CreateAspectType;
};

type UpdateData = BaseData & {
  aspect_type: UpdateAspectType;
};

type DeleteData = BaseData & {
  aspect_type: DeleteAspectType;
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
