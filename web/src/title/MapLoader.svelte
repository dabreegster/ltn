<script lang="ts">
  import FileInput from "../ui/FileInput.svelte";
  import { LngLat } from "maplibre-gl";
  import { LTN } from "backend";
  import { onMount } from "svelte";
  import { Loading, OverpassSelector } from "../common";
  import { RouteTool } from "../common/snapper/route_tool";
  import {
    app,
    example,
    map,
    mode,
    route_tool,
    route_pt_a,
    route_pt_b,
  } from "../stores";

  let msg: string | null = null;
  let useLocalVite = false;
  let exampleAreas: [string, [string, string][]][] = [];

  onMount(async () => {
    // When running locally if a vite public/ directory is set up, load from that for speed
    try {
      let resp = await fetch("/osm/areas.json");
      if (resp.ok) {
        useLocalVite = true;
        console.log("Using local cache, not od2net.org");
        exampleAreas = await resp.json();
      } else {
        let resp = await fetch(
          `https://assets.od2net.org/severance_pbfs/areas.json`,
        );
        exampleAreas = await resp.json();
      }

      // For quicker dev
      //$example = "bristol";
    } catch (err) {}
  });

  let fileInput: HTMLInputElement;
  async function loadFile(e: Event) {
    try {
      loadMap(await fileInput.files![0].arrayBuffer());
      $example = "";
    } catch (err) {
      window.alert(`Couldn't open this file: ${err}`);
    }
    msg = null;
  }

  export function loadMap(buffer: ArrayBuffer) {
    msg = "Building map model from OSM input";
    console.time("load");
    $app = new LTN(
      new Uint8Array(buffer),
      $example == "" ? undefined : $example,
    );
    console.timeEnd("load");

    // Autoload from local storage
    let filename = `ltn_${$example || "custom"}.geojson`;
    let gj = window.localStorage.getItem(filename);
    if (gj) {
      try {
        $app.loadSavefile(JSON.parse(gj));
      } catch (err) {
        console.log(`Didn't restore from local storage ${filename}: ${err}`);
      }
    }

    $mode = {
      mode: "network",
    };
    $route_tool = new RouteTool($map!, $app.toRouteSnapper());
    $map!.fitBounds(
      Array.from($app.getBounds()) as [number, number, number, number],
      { animate: false },
    );
    $route_pt_a = randomPoint();
    $route_pt_b = randomPoint();
  }

  function gotXml(e: CustomEvent<string>) {
    try {
      // TODO Can we avoid turning into bytes?
      loadMap(new TextEncoder().encode(e.detail));
      $example = "";
    } catch (err) {
      window.alert(`Couldn't import from Overpass: ${err}`);
    }
    msg = null;
  }

  export async function loadExample(ex: string) {
    if (ex != "") {
      if (useLocalVite) {
        await loadFromUrl(`/osm/${ex}.pbf`);
      } else {
        await loadFromUrl(`https://assets.od2net.org/severance_pbfs/${ex}.pbf`);
      }
    }
  }

  async function loadFromUrl(url: string) {
    try {
      msg = `Downloading ${url}`;
      let resp = await fetch(url);
      loadMap(await resp.arrayBuffer());
    } catch (err) {
      window.alert(`Couldn't open from URL ${url}: ${err}`);
    }
    msg = null;
  }

  function randomPoint(): LngLat {
    let bounds = $app!.getBounds();
    let lng = bounds[0] + Math.random() * (bounds[2] - bounds[0]);
    let lat = bounds[1] + Math.random() * (bounds[3] - bounds[1]);
    return new LngLat(lng, lat);
  }
</script>

<Loading {msg} />

<div>
  <label>
    Load an example:
    <select bind:value={$example} on:change={() => loadExample($example)}>
      <option value="">Custom file loaded</option>
      {#each exampleAreas as [country, areas]}
        <optgroup label={country}>
          {#each areas as [value, label]}
            <option {value}>{label}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
  </label>
</div>

<i>or...</i>

<FileInput bind:fileInput on:change={loadFile}
  >Load an osm.xml or a .pbf file</FileInput
>

<i>or...</i>

<OverpassSelector
  map={$map}
  on:gotXml={gotXml}
  on:loading={(e) => (msg = e.detail)}
  on:error={(e) => window.alert(e.detail)}
/>
