const BOUNDS = [13.1504452, 55.6821874, 13.2577124, 55.7373334];

const INITIAL_VIEW_STATE = {
    longitude: 13.1910,
    latitude: 55.7047,
    zoom: 15,
    pitch: 45,
    bearing: 0,
    //maxZoom: 15,
    //minZoom: 11 
  };
  //mapboxgl.accessToken = 'pk.eyJ1Ijoic3Rlcm5sZW8iLCJhIjoiY21hc2t5b2Z5MGZmazJwczU0eGduZzNzbSJ9.Z5Okc5xnXjC_LRJDECX9tQ';
  
  const deckgl = new deck.DeckGL({
    container: 'container',
    mapStyle: 'https://api.maptiler.com/maps/bright/style.json?key=IcLmXlHFSECJQQ9T78K5',
    mapLib: maplibregl,
    initialViewState: INITIAL_VIEW_STATE,
    controller: true,
    layers: [], 
    parameters: {
        depthTest: true,
        blend: false
      },
      webgl: {
        antialias: false,
        preserveDrawingBuffer: false
      }
  });
  

  fetch('lund_buildings_simpopFIXED.geojson')
  .then(res => res.json())
  .then(geojson => {
    geojsonData = geojson;
    updateBuildingsLayer(); 
  })
  .catch(err => console.error(err));



  //menu
  let currentMode = 'building';
  let geojsonData = null;
  
  const select = document.getElementById('mode-select');
  select.addEventListener('change', (e) => {
    currentMode = e.target.value;
    updateBuildingsLayer();
  });
  
  function updateBuildingsLayer() {
    if (!geojsonData) return;
  
    if (currentMode === 'building') {
      const buildingsLayer = new deck.GeoJsonLayer({
        id: 'buildings-layer',
        data: geojsonData,
        extruded: true,
        wireframe: false,
        opacity: 0.9,
        getElevation: f => (f.properties.population || 1) * 2,
        getFillColor: f => {
          const pop = f.properties.population || 0;
          const maxPop = 100;
          const t = Math.min(pop / maxPop, 1);
          let r = 255, g, b = 0;
          g = t < 0.5 ? 255 - (90 * (t / 0.5)) : 165 - (165 * ((t - 0.5) / 0.5));
          return [r, Math.round(g), b];
        },
        getLineColor: [80, 80, 80],
        lineWidthMinPixels: 1,
        pickable: true
      });
  
      deckgl.setProps({ layers: [buildingsLayer] });

    } else if (currentMode === 'dome') {
      const terrainLayer = new deck.TerrainLayer({
        id: 'population-dome',
        elevationData: 'lund_population50x100.png',
        texture: 'lund_population_color_final.png',
        bounds: BOUNDS,
        opacity: 0.4,
        elevationDecoder: {
          rScaler: 5,
          gScaler: 0,
          bScaler: 0,
          offset: 0
        },
        meshMaxError: 50,
        material: {
          ambient: 0.5,
          diffuse: 0.3,
          shininess: 50,
          specularColor: [40, 40, 40]
        }
      });

      deckgl.setProps({
        layers: [terrainLayer]
      });
    }

  }
  

  