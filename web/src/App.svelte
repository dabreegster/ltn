<script lang="ts">
  import "./common/tailwind.css";
  import initLtn from "backend";
  import type { Map } from "maplibre-gl";
  import initRouteSnapper from "route-snapper";
  import { onMount } from "svelte";
  import { FillLayer, GeoJSON, MapLibre } from "svelte-maplibre";
  import { Geocoder, Layout, layerId, BasemapPicker } from "./common";
  import DebugMode from "./DebugMode.svelte";
  import DebugGJ from "./DebugGJ.svelte";
  import NeighbourhoodMode from "./edit/NeighbourhoodMode.svelte";
  import NetworkMode from "./NetworkMode.svelte";
  import RouteMode from "./RouteMode.svelte";
  import SetBoundaryMode from "./SetBoundaryMode.svelte";
  import {
    app,
    mapContents,
    map as mapStore,
    mode,
    sidebarContents,
    mapStyle,
  } from "./stores";
  import TitleMode from "./title/TitleMode.svelte";
  import ViewShortcutsMode from "./ViewShortcutsMode.svelte";

  let wasmReady = false;
  onMount(async () => {
    await initLtn();
    await initRouteSnapper();
    wasmReady = true;
  });

  let map: Map;
  $: if (map) {
    mapStore.set(map);
  }

  function zoomToFit() {
    $mapStore!.fitBounds(
      Array.from($app!.getBounds()) as [number, number, number, number],
      { animate: false },
    );
  }

  let sidebarDiv: HTMLDivElement;
  let mapDiv: HTMLDivElement;
  $: if (sidebarDiv && $sidebarContents) {
    sidebarDiv.innerHTML = "";
    sidebarDiv.appendChild($sidebarContents);
  }
  $: if (mapDiv && $mapContents) {
    mapDiv.innerHTML = "";
    mapDiv.appendChild($mapContents);
  }
</script>

<Layout>
  <div slot="left">
    <div bind:this={sidebarDiv} />

    <hr />

    {#if $app}
      <div><button on:click={zoomToFit}>Zoom to fit study area</button></div>
    {/if}
    <BasemapPicker />
  </div>
  <div slot="main" style="position:relative; width: 100%; height: 100vh;">
    <MapLibre
      style={$mapStyle}
      standardControls
      hash
      bind:map
      on:error={(e) => {
        // @ts-ignore ErrorEvent isn't exported
        console.log(e.detail.error);
      }}
      images={[
        {
          id: "walk_cycle_only",
          url: `${import.meta.env.BASE_URL}/filters/walk_cycle_only_icon.gif`,
        },
        {
          id: "no_entry",
          url: `${import.meta.env.BASE_URL}/filters/no_entry_icon.gif`,
        },
        {
          id: "bus_gate",
          url: `${import.meta.env.BASE_URL}/filters/bus_gate_icon.gif`,
        },
        {
          id: "school_street",
          url: `${import.meta.env.BASE_URL}/filters/school_street_icon.gif`,
        },
      ]}
    >
      <Geocoder />
      <div bind:this={mapDiv} />
      {#if $mode.mode == "title"}
        <TitleMode {wasmReady} />
      {/if}
      {#if $app}
        <GeoJSON data={JSON.parse($app.getInvertedBoundary())}>
          <FillLayer
            {...layerId("boundary")}
            paint={{ "fill-color": "black", "fill-opacity": 0.3 }}
          />
        </GeoJSON>
        {#if $mode.mode == "network"}
          <NetworkMode />
        {:else if $mode.mode == "set-boundary"}
          <SetBoundaryMode name={$mode.name} existing={$mode.existing} />
        {:else if $mode.mode == "neighbourhood"}
          <NeighbourhoodMode />
        {:else if $mode.mode == "view-shortcuts"}
          <ViewShortcutsMode />
        {:else if $mode.mode == "route"}
          <RouteMode prevMode={$mode.prevMode} />
        {:else if $mode.mode == "debug"}
          <DebugMode />
        {:else if $mode.mode == "debug-gj"}
          <DebugGJ />
        {/if}
      {/if}
    </MapLibre>
  </div>
</Layout>
