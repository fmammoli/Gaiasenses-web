export type RainfallResponseData = {
  city: string;
  clouds: number;
  lat: number;
  lon: number;
  main: {
    feels_like: number;
    grnd_level: number;
    humidity: number;
    pressure: number;
    temp: number;
  };
  rain: { "1h": number } | {};
  state: string;
  visibility: number;
  weather: [
    {
      description: string;
      icon: string;
      main: string;
    }
  ];
  wind: {
    deg: number;
    gust: number;
    speed: number;
  };
};

export type PatchData = {
  path: string;
  messages: {
    nodeId: string;
    portletId: string;
    message: (string | number)[];
    valueIndex: number;
    name: string;
  }[];
};
