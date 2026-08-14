export type AnalyticsRangeKey = "today" | "7d" | "28d" | "90d";

export type AnalyticsPoint = {
  date: string;
  label: string;
  views: number;
  visitors: number;
};

export type AnalyticsRankRow = {
  key: string;
  label: string;
  views: number;
  visitors: number;
};

export type AnalyticsReport = {
  range: AnalyticsRangeKey;
  from: string;
  to: string;
  realtime: number;
  users: number;
  usersPrev: number;
  pageviews: number;
  pageviewsPrev: number;
  sessions: number;
  sessionsPrev: number;
  bounceRate: number;
  bounceRatePrev: number;
  pagesPerSession: number;
  newUsers: number;
  returningUsers: number;
  timeseries: AnalyticsPoint[];
  hourly: { hour: number; views: number }[];
  countries: AnalyticsRankRow[];
  cities: AnalyticsRankRow[];
  pages: AnalyticsRankRow[];
  channels: AnalyticsRankRow[];
  referrers: AnalyticsRankRow[];
  devices: AnalyticsRankRow[];
  browsers: AnalyticsRankRow[];
  os: AnalyticsRankRow[];
  languages: AnalyticsRankRow[];
};
