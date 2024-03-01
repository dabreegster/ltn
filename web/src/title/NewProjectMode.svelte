<script lang="ts">
  import { LTN } from "backend";
  import { onMount } from "svelte";
  import { Link, Loading, OverpassSelector } from "../common";
  import PolygonToolLayer from "../common/draw_polygon/PolygonToolLayer.svelte";
  import SplitComponent from "../SplitComponent.svelte";
  import { projectName, app, map, useLocalVite, mode } from "../stores";
  import { afterProjectLoaded, loadFromLocalStorage } from "./loader";

  let newProjectName = "";
  let example = "";
  let exampleAreas: [string, [string, string][]][] = [];
  let msg: string | null = null;

  onMount(async () => {
    let resp = await fetch(
      $useLocalVite
        ? "/osm/areas.json"
        : "https://assets.od2net.org/severance_pbfs/areas.json",
    );
    exampleAreas = await resp.json();
  });

  function gotXml(e: CustomEvent<string>) {
    try {
      // TODO Can we avoid turning into bytes?
      $app = new LTN(new TextEncoder().encode(e.detail), undefined);
      // No savefile to load
      // TODO Nothing will get created in local storage yet...
      $projectName = `ltn_${newProjectName}`;
      afterProjectLoaded();
    } catch (err) {
      window.alert(`Couldn't import from Overpass: ${err}`);
    }
    msg = null;
  }

  export async function loadExample() {
    if (example == "") {
      return;
    }

    let key = `ltn_${newProjectName}`;
    window.localStorage.setItem(
      key,
      JSON.stringify({
        type: "FeatureCollection",
        features: [],
        study_area_name: example,
      }),
    );
    loadFromLocalStorage(key);
  }
</script>

<SplitComponent>
  <div slot="top">
    <nav aria-label="breadcrumb">
      <ul>
        <li>
          <Link on:click={() => ($mode = { mode: "title" })}>
            Choose project
          </Link>
        </li>
        <li>New project</li>
      </ul>
    </nav>
  </div>

  <div slot="sidebar">
    <div>
      <label>
        Project name:
        <input type="text" bind:value={newProjectName} />
      </label>
    </div>

    {#if newProjectName}
      <Loading {msg} />

      <label>
        Load a built-in area:
        <select bind:value={example} on:change={() => loadExample()}>
          <option value=""></option>
          {#each exampleAreas as [country, areas]}
            <optgroup label={country}>
              {#each areas as [value, label]}
                <option {value}>{label}</option>
              {/each}
            </optgroup>
          {/each}
        </select>
      </label>

      <i>or...</i>

      <OverpassSelector
        map={$map}
        on:gotXml={gotXml}
        on:loading={(e) => (msg = e.detail)}
        on:error={(e) => window.alert(e.detail)}
      />
    {/if}
  </div>

  <div slot="map">
    <PolygonToolLayer />
  </div>
</SplitComponent>