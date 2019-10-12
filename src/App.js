import React, {useRef, useState} from 'react';
import DeckGL from 'deck.gl';
import { ScatterplotLayer} from '@deck.gl/layers';
import './App.css';
import {StaticMap} from 'react-map-gl';
import { useFetchJson, useAnimationFrame } from './hooks';
import '@luma.gl/debug'

/*
TODO

https://github.com/uber/deck.gl/blob/master/docs/developer-guide/custom-layers/writing-shaders.md#uniforms
  use layer extensions, to inject shader code that manipulates selected icons Z posiiton  up and down (also maybe size)
  
*/

const MAPBOX_ACCESS_TOKEN='pk.eyJ1IjoidWJlcmRhdGEiLCJhIjoidGllX1gxUSJ9.gElUooDF7u51guCQREmAhg';
const RED = [255,0,0];
const BLUE = [0,0,255];
const INITIAL_VIEW_STATE= { 
  longitude: -73.984293,
  latitude: 40.729468,
  zoom: 12.5,
  pitch: 45,
}

function App() {

  const deckRef = useRef();
  const data = useFetchJson('https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/scatterplot/manhattan.json',[]);
  // const [opacity, setOpacity] = useState(1);
  // useAnimationFrame(time => setOpacity((time % 1000) / 1000.0))
  
  const layers = [
    new ScatterplotLayer({
      id: 'scatter-plot',
      data: data,
      radiusScale: 10,
      radiusMinPixels: 0.25,
      getPosition: d => [d[0], d[1], 0],
      getFillColor: d => (d[2] === 1 ? RED : BLUE),
      getRadius: 1,
      // opacity: opacity,
      updateTriggers: {
        getFillColor: [RED, BLUE]
      }
    })
  ]

  return (
    <DeckGL 
      ref={deckRef}
      debug= {true}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      onHover= {()=>console.log(deckRef.current.deck.metrics)}
      layers={layers}>
        <StaticMap
          mapStyle="mapbox://styles/mapbox/dark-v9"
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
    </DeckGL>
  );
}

export default App;
