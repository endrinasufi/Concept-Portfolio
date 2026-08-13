import { MySqlProjectRepository } from "./MySqlProjectRepository";
import { MySqlSocialMediaProjectRepository } from "./MySqlSocialMediaProjectRepository";
import { MySqlWebDesignProjectRepository } from "./MySqlWebDesignProjectRepository";
import { MySqlPhotoshootingRepository } from "./MySqlPhotoshootingRepository";
import { MySqlVideoProductionRepository } from "./MySqlVideoProductionRepository";
import { MySqlMediaRepository } from "./MySqlMediaRepository";
import { MySqlSettingsRepository } from "./MySqlSettingsRepository";

let project: MySqlProjectRepository | null = null;
let social: MySqlSocialMediaProjectRepository | null = null;
let web: MySqlWebDesignProjectRepository | null = null;
let photo: MySqlPhotoshootingRepository | null = null;
let video: MySqlVideoProductionRepository | null = null;
let media: MySqlMediaRepository | null = null;
let settings: MySqlSettingsRepository | null = null;

export function getServerProjectRepository() {
  return (project ??= new MySqlProjectRepository());
}
export function getServerSocialMediaRepository() {
  return (social ??= new MySqlSocialMediaProjectRepository());
}
export function getServerWebDesignRepository() {
  return (web ??= new MySqlWebDesignProjectRepository());
}
export function getServerPhotoshootingRepository() {
  return (photo ??= new MySqlPhotoshootingRepository());
}
export function getServerVideoProductionRepository() {
  return (video ??= new MySqlVideoProductionRepository());
}
export function getServerMediaRepository() {
  return (media ??= new MySqlMediaRepository());
}
export function getServerSettingsRepository() {
  return (settings ??= new MySqlSettingsRepository());
}
