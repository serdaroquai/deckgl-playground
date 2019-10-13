import React, {useRef, useState, useEffect} from 'react';
import DeckGL, { AttributeManager } from 'deck.gl';
import { ScatterplotLayer} from '@deck.gl/layers';
import './App.css';
import {StaticMap} from 'react-map-gl';
import { useFetchJson, useAnimationFrame, useFetch } from './hooks';
import '@luma.gl/debug';
import {Buffer, GL} from 'luma.gl';
import {  InjectionExtension} from "./extensions";


/*

NOTES:

opacity and radius (in general uniforms do not need an updateTrigger)
trying to change opacity smoothly based on viewport stops the double click zoom animation

* getPickingInfo
https://github.com/uber/deck.gl/blob/846024e60cf004e9c33228283ea9d7e93e7cf2f2/dev-docs/RFCs/v7.x-binary/binary-data-rfc.md 


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
  zoom: 13,
  pitch: 45,
}

function App() {

  // https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/scatterplot-data.txt
  const deckRef = useRef();
  const dataJson = useFetchJson('https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/scatterplot/manhattan.json',[]);
  const [data, setData] = useState({length:0, pos: [], gender: []});
  const glRef = useRef();
  // const [opacity, setOpacity] = useState(1);
  // useAnimationFrame(time => setOpacity((time % 1000) / 1000.0));
  
  useEffect(()=>{
    if (dataJson && deckRef.current && glRef.current) {
      const value = _convert(dataJson);
      // value = { length: n , pos: Float64Array(x0,y0,x1,y1..), gender: UInt8Clamped(1,2,1,1...)}
      console.log(value);
      setData({
        length: value.length,
        gender: value.gender,
        attributes: {
          instancePositions: {
            value: value.pos,
            // size: 1,
            // offset: 0,
            // stride: 2,
          },
        }
      });
      // setData({
      //   length: value.length,
      //   attributes: {
      //     instancePositions: {
      //       buffer: new Buffer(glRef.current, {data: value.pos, id : 'custom'}),
      //       noAlloc: true,
      //       // size:value.length,
      //       // offset: 0,
      //       // stride: 2,
      //     }
      //   }
      // });
    }
  },[dataJson, deckRef, glRef]);

  const layers = [
    new ScatterplotLayer({
      id: 'scatter-plot',
      data: data,
      radiusScale: 50,
      radiusMinPixels: 1,
      // getPosition: (obj, {index, data, target}) => {
      //   target[0] = data.pos[2*index];
      //   target[1] = data.pos[2*index+1];
      //   target[2] = 0;
      //   return target;
      // },
      // getFillColor: RED,
      getInjection: (obj, {index, data, target}) => {
        target[0] = data.gender[index];
        return target;
      },
      getRadius: 1,
      pickable: true,
      parameters: {
        depthTest: false,
      },
      // opacity: opacity,
      // updateTriggers: {
      //   getFillColor: [RED, BLUE]
      // },
      extensions:[new InjectionExtension()]
    })
  ]


  function onViewStateChange({viewState}) {
    console.log(deckRef.current.deck.metrics);
  }

  function onClick(info) {
    console.log(deckRef.current.deck.layerManager.layers[0].internalState.attributeManager, deckRef.current.deck.metrics)
  }

  function onWebGLInitialized(gl) {
    glRef.current = gl;
  }

  return (
    <DeckGL 
      ref={deckRef}
      onWebGLInitialized={onWebGLInitialized}
      debug= {true}
      useDevicePixels={false}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      onClick= {onClick}
      onViewStateChange={onViewStateChange}
      layers={layers}>
        {/* <StaticMap
          mapStyle="mapbox://styles/mapbox/dark-v9"
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} /> */}
    </DeckGL>
  );
}

function _convert(dataJson) {
  const length = dataJson.length;
  const pos = new Float64Array(new ArrayBuffer(length * 2 * 8)); // x, y float64
  const gender = new Float32Array(new ArrayBuffer(length * 4)) // type float32

  let i = 0;
  for (let row of dataJson) {
    pos[2*i] = row[0];
    pos[2*i+1] = row[1];
    gender[i++] = row[2];
  }

  return {
    length,
    pos,
    gender
  }
}

export default App;
