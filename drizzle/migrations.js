// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_short_blazing_skull.sql';
import m0001 from './0001_lying_iron_man.sql';
import m0002 from './0002_spooky_winter_soldier.sql';
import m0003 from './0003_chunky_king_bedlam.sql';
import m0004 from './0004_money_to_minor_units.sql';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
  },
};
