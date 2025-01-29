import { HourlyWeather } from "./hourly";

export interface WeatherDay {
    date: Date;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    windDirection: string;
    realFeel: number;
    pmer: number;
    visibility: number;
    latitude: number;
    longitude: number;
    prose: number;
    windQuality: string;
    icon: string;
    hourlyData: HourlyWeather[];
  }