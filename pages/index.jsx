import { useEffect, useState } from "react";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";
import { vertexShader, fragmentShader } from "./lib/Shaders";

export default function Home() {
  let test, audioContext, audioElement, dataArray, analyser, source;

  let gui;
  const initGui = async () => {
    const dat = await import("dat.gui");
    gui = new dat.GUI();
  };

  const setupAudioContext = () => {
    audioContext = new window.AudioContext();
    audioElement = document.getElementById("myAudio");
    source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 1024;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  };

  const play = async () => {
    if (audioContext === undefined) {
      setupAudioContext();
    }

    const uniforms = {
      u_time: {
        type: "f",
        value: 1.0,
      },
      u_amplitude: {
        type: "f",
        value: 3.0,
      },
      u_data_arr: {
        type: "float[64]",
        value: dataArray,
      },
    };

    const planeGeometry = new THREE.PlaneGeometry(64, 64, 64, 64);

    const planeCustomMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
      wireframe: true,
    });

    const planeMesh = new THREE.Mesh(planeGeometry, planeCustomMaterial);

    planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4;
    planeMesh.scale.x = 2;
    planeMesh.scale.y = 2;
    planeMesh.scale.z = 2;
    planeMesh.position.y = 8;

    test.scene.add(planeMesh);

    if (gui === undefined) {
      await initGui();
      const audioWaveGui = gui.addFolder("audio waveform");
      audioWaveGui
        .add(planeCustomMaterial, "wireframe")
        .name("wireframe")
        .listen();
      audioWaveGui
        .add(uniforms.u_amplitude, "value", 1.0, 8.0)
        .name("amplitude")
        .listen();
    }

    const render = (time) => {
      // update audio data
      analyser.getByteFrequencyData(dataArray);

      // update uniforms
      uniforms.u_time.value = time;
      uniforms.u_data_arr.value = dataArray;

      requestAnimationFrame(render);
    };

    render();
  };

  useEffect(() => {
    test = new SceneInit("myThreeJsCanvas");
    test.initScene();
    test.animate();
  }, []);


  return (
    <div className="flex flex-col items-center justify-center">
      <div className="absolute bottom-2 right-2">
        <audio
          id="myAudio"
          src="./fur_elise.mp3"
          className="w-80"
          controls
          autoPlay
          onPlay={play}
        />
      </div>
      <canvas id="myThreeJsCanvas"></canvas>
    </div>
  );
}
