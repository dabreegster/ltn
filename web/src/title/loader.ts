import { get } from "svelte/store";
import { LngLat } from "maplibre-gl";
import { LTN } from "backend";
import type { Feature } from "geojson";
import { overpassQueryForPolygon } from "../common";
import { RouteTool } from "../common/snapper/route_tool";
import {
  app,
  projectName,
  map,
  mode,
  useLocalVite,
  route_tool,
  route_pt_a,
  route_pt_b,
  maptilerBasemap,
} from "../stores";

export async function loadFromLocalStorage(key: string) {
  projectName.set(key);
  try {
    let gj = JSON.parse(window.localStorage.getItem(key)!);

    console.time("get OSM input");
    let buffer = await getOsmInput(gj);
    console.timeEnd("get OSM input");
    console.time("load");
    app.set(new LTN(new Uint8Array(buffer), gj.study_area_name || undefined));
    // TODO Rename savefile -> project? Or combine this call with the constructor?
    get(app)!.loadSavefile(gj);
    console.timeEnd("load");

    if (gj.basemap_style) {
      maptilerBasemap.set(gj.basemap_style);
    }

    afterProjectLoaded();
  } catch (err) {
    window.alert(`Couldn't open project: ${err}`);
    projectName.set("");
  }
}

// Either from a pre-hosted pbf file or from Overpass
async function getOsmInput(gj: any): Promise<ArrayBuffer> {
  if (gj.study_area_name) {
    let url = get(useLocalVite)
      ? `/osm/${gj.study_area_name}.pbf`
      : `https://assets.od2net.org/severance_pbfs/${gj.study_area_name}.pbf`;
    console.log(`Grabbing ${url}`);
    let resp = await fetch(url);
    let bytes = await resp.arrayBuffer();
    return bytes;
  } else {
    console.log(`Grabbing from Overpass`);
    let study_area_boundary = gj.features.find(
      (f: Feature) => f.properties!.kind == "study_area_boundary",
    )!;
    let resp = await fetch(overpassQueryForPolygon(study_area_boundary));
    let bytes = await resp.arrayBuffer();
    return bytes;
  }
}

export function afterProjectLoaded() {
  mode.set({
    mode: "network",
  });
  route_tool.set(new RouteTool(get(map)!, get(app)!.toRouteSnapper()));
  get(map)!.fitBounds(
    Array.from(get(app)!.getBounds()) as [number, number, number, number],
    { animate: false },
  );
  route_pt_a.set(randomPoint());
  route_pt_b.set(randomPoint());
}

function randomPoint(): LngLat {
  let bounds = get(app)!.getBounds();
  let lng = bounds[0] + Math.random() * (bounds[2] - bounds[0]);
  let lat = bounds[1] + Math.random() * (bounds[3] - bounds[1]);
  return new LngLat(lng, lat);
}
