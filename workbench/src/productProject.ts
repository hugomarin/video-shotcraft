import type {ProjectData} from './types';
export const productProject=():ProjectData=>({
  "name": "Orbit · Product scene",
  "fps": 30,
  "width": 1920,
  "height": 1200,
  "tracks": [
    {
      "id": "product-track",
      "name": "Producto",
      "clips": [
        {
          "id": "product-shot",
          "cardId": "product-optical-scene",
          "start": 0,
          "duration": 180,
          "inOffset": 0,
          "speed": 1,
          "opacity": 1,
          "scale": 1,
          "x": 0,
          "y": 0,
          "props": {}
        }
      ]
    }
  ]
});
