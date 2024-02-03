<script lang="ts">
  import { Modal, notNull } from "../common";
  import { showAbout } from "../stores";
</script>

{#if $showAbout}
  <Modal on:close={() => ($showAbout = false)} let:dialog
    ><article class="prose prose-lg max-w-none">
      <h1>The Low-traffic neighbourhood (LTN) tool, v2</h1>
      <p>
        This is an <b>experimental</b> version of the
        <a
          href="https://a-b-street.github.io/docs/software/ltn/index.html"
          target="_blank">A/B Street LTN tool</a
        >. Most parts of it do not work yet, and you should probably use the
        other version of the tool instead.
      </p>
      <p>To use this tool, you need to:</p>
      <ol>
        <li>Choose your study area to analyze</li>
        <li>Define one or more neighbourhood boundaries</li>
        <li>
          Optionally, to fix the basemap data on existing modal filters, turn
          restrictions, one-ways, etc
        </li>
        <li>
          To create one or more proposals with new modal filters, and explore
          their effects
        </li>
      </ol>
      <p>
        This tool is created by <a
          href="https://github.com/dabreegster/"
          target="_blank">Dustin Carlino</a
        >
        and relies heavily on
        <a href="https://www.openstreetmap.org/about" target="_blank"
          >OpenStreetMap</a
        > data.
      </p>
      <div class="flex justify-center">
        <button class="btn btn-primary" on:click={() => notNull(dialog).close()}
          >Start!</button
        >
      </div>
    </article></Modal
  >
{/if}
