import { HourlyWeather } from "./hourly";

export interface WeatherDay {
    date: Date;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    windDirection: string;
    latitude: number;
    longitude: number;
    icon: string;
    hourlyData: HourlyWeather[];
  }