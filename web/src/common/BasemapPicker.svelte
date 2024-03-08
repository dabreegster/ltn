<script lang="ts">
  import { autosave, maptilerBasemap } from "../stores";

  // TODO Z-ordering won't work when we change, because layerId() doesn't get recalculated
</script>

<label>
  Basemap (saved with your project):
  <select bind:value={$maptilerBasemap} on:change={autosave}>
    <option value="dataviz">MapTiler Dataviz</option>
    <option value="streets">MapTiler Streets</option>
    <option value="hybrid">MapTiler Satellite</option>
    <option value="uk-openzoomstack-light">OS Open Zoomstack</option>
  </select>
</label>
