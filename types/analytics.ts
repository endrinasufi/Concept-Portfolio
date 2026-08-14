export type AnalyticsGrain = "day" | "week" | "month" | "year";

export type AnalyticsPoint = {
  date: string;
  label: string;
  views: number;
  visitors: number;
  viewsPrev: number;
  visitorsPrev: number;
};

export type AnalyticsRankRow = {
  key: string;
  label: string;
  views: number;
  visitors: number;
};

export type AnalyticsReport = {
  grain: AnalyticsGrain;
  offset: number;
  periodLabel: string;
  compareLabel: string;
  from: string;
  to: string;
  realtime: number;
  liveCountries: AnalyticsRankRow[];
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
