<script lang="ts">
  import type { Feature, FeatureCollection } from "geojson";
  import {
    CircleLayer,
    SymbolLayer,
    FillLayer,
    GeoJSON,
    hoverStateFilter,
    LineLayer,
  } from "svelte-maplibre";
  import {
    constructMatchExpression,
    isLine,
    isPoint,
    isPolygon,
  } from "./common";
  import { showBasemap } from "./stores";

  export let gjInput: FeatureCollection;
  // When disabled, can't click lines or filters, no slots, no hoverCursor
  export let interactive = true;
  export let onClickLine = (f: Feature) => {};
  export let onClickCircle = (f: Feature) => {};

  let gj: FeatureCollection;
  let maxShortcuts: number;
  // TODO if we could set both reactively, thatd be ideal
  $: render(gjInput);

  function render(x: FeatureCollection) {
    // A qualitative palette from colorbrewer2.org, skipping the red hue (used
    // for levels of shortcutting) and grey (too close to the basemap)
    let cell_colors = [
      "#8dd3c7",
      "#ffffb3",
      "#bebada",
      "#80b1d3",
      "#fdb462",
      "#b3de69",
      "#fccde5",
      "#bc80bd",
      "#ccebc5",
      "#ffed6f",
    ];

    maxShortcuts = Math.max(
      ...gjInput.features.map((f) => f.properties!.shortcuts ?? 0)
    );

    for (let f of gjInput.features) {
      f.properties ??= {};
      if (f.properties.color == "disconnected") {
        f.properties.color = "red";
      } else if (Object.hasOwn(f.properties, "color")) {
        // TODO Uhh weird when this runs twice
        f.properties.color =
          cell_colors[f.properties.color % cell_colors.length];
      }
    }

    gj = gjInput;
  }
</script>

<GeoJSON data={gj} generateId>
  <FillLayer
    beforeId={$showBasemap ? "Building" : undefined}
    filter={isPolygon}
    manageHoverState
    paint={{
      "fill-color": ["get", "color"],
      "fill-opacity": interactive ? hoverStateFilter(0.3, 0.5) : 0.3,
    }}
  />

  <LineLayer
    filter={isLine}
    paint={{
      "line-width": 5,
      "line-color": constructMatchExpression(
        ["get", "kind"],
        {
          interior_road: [
            "interpolate-hcl",
            ["linear"],
            ["get", "shortcuts"],
            0,
            "#F19A93",
            maxShortcuts,
            "#A32015",
          ],
          crosses: "blue",
        },
        "red"
      ),
    }}
    on:click={(e) => interactive && onClickLine(e.detail.features[0])}
    hoverCursor={interactive ? "pointer" : null}
  >
    {#if interactive}
      <slot name="line-popup" />
    {/if}
  </LineLayer>

  <CircleLayer
    filter={["all", isPoint, ["==", ["get", "kind"], "border_intersection"]]}
    paint={{
      "circle-radius": 15,
      "circle-color": "green",
    }}
  />

  <SymbolLayer
    filter={["all", isPoint, ["==", ["get", "kind"], "modal_filter"]]}
    layout={{
      "icon-image": ["get", "filter_kind"],
    }}
    on:click={(e) => interactive && onClickCircle(e.detail.features[0])}
  >
    {#if interactive}
      <slot name="circle-popup" />
    {/if}
  </SymbolLayer>
</GeoJSON>
