<script lang="ts">
  import { LTN } from "backend";
  import type { Map } from "maplibre-gl";
  import { MapLibre } from "svelte-maplibre";
  import { bbox, Layout } from "./common";
  import { RouteTool } from "./common/route_tool";
  import MapLoader from "./MapLoader.svelte";
  import NeighbourhoodMode from "./NeighbourhoodMode.svelte";
  import NetworkMode from "./NetworkMode.svelte";
  import RouteMode from "./RouteMode.svelte";
  import SetBoundaryMode from "./SetBoundaryMode.svelte";
  import {
    app,
    mapContents,
    map as mapStore,
    mode,
    showBasemap,
    sidebarContents,
  } from "./stores";
  import ViewShortcutsMode from "./ViewShortcutsMode.svelte";

  $: mapStyle = $showBasemap
    ? "https://api.maptiler.com/maps/dataviz/style.json?key=MZEJTanw3WpxRvt7qDfo"
    : {
        version: 8 as const,
        sources: {},
        layers: [],
      };

  let route_tool: RouteTool | undefined = undefined;
  let map: Map;
  $: if (map) {
    mapStore.set(map);
  }

  function zoomToFit() {
    // TODO wasteful
    $mapStore!.fitBounds(bbox(JSON.parse($app!.render())), { animate: false });
  }

  function gotApp(_x: LTN | null) {
    if (!$app) {
      return;
    }
    console.log("New map model loaded");
    zoomToFit();
    $mode = {
      mode: "network",
    };
    route_tool = new RouteTool($mapStore!, $app.toRouteSnapper());
  }
  $: gotApp($app);

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
    {#if $mapStore}
      <MapLoader />
      {#if $app}
        <div><button on:click={zoomToFit}>Zoom to fit</button></div>
      {/if}
    {/if}
    <div>
      <label
        ><input type="checkbox" bind:checked={$showBasemap} />Show basemap</label
      >
    </div>
    <hr />

    <div bind:this={sidebarDiv} />
  </div>
  <div slot="main" style="position:relative; width: 100%; height: 100vh;">
    <MapLibre
      style={mapStyle}
      standardControls
      hash
      bind:map
      on:error={(e) => console.log(e.detail.error)}
      images={[
        { id: "walk_cycle_only", url: "/filters/walk_cycle_only_icon.gif" },
        { id: "no_entry", url: "/filters/no_entry_icon.gif" },
        { id: "bus_gate", url: "/filters/bus_gate_icon.gif" },
        { id: "school_street", url: "/filters/school_street_icon.gif" },
      ]}
    >
      <div bind:this={mapDiv} />
      {#if $app}
        {#if $mode.mode == "network"}
          <NetworkMode />
        {:else if $mode.mode == "set-boundary"}
          <SetBoundaryMode {route_tool} existing={$mode.existing} />
        {:else if $mode.mode == "neighbourhood"}
          <NeighbourhoodMode />
        {:else if $mode.mode == "view-shortcuts"}
          <ViewShortcutsMode />
        {:else if $mode.mode == "route"}
          <RouteMode />
        {/if}
      {/if}
    </MapLibre>
  </div>
</Layout>

<style>
  :global(body, button, input) {
    font-size: 26px;
  }
</style>
