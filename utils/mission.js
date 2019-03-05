var MISSION_CACHE = {};

function MissionConcat(missions) {
  missions.forEach(mission => {
    MISSION_CACHE[mission.message] = mission.event;
  });
}

export function MissionAnnounce(mission, model) {
  MISSION_CACHE[mission](model);
}

export function MissionSubscription(missions) {
  MissionConcat(missions);
}

export function MissionUnsubscribe(missions) {
  missions.forEach(mission => {
    MISSION_CACHE[mission.message] = undefined;
  });
}