<script lang="ts">
  // Label goes in the slot

  export let fileInput: HTMLInputElement;
</script>

<label class="form-control w-full max-w-xs">
  <div class="label">
    <span class="label-text"><slot /></span>
  </div>
  <input
    type="file"
    class="file-input file-input-bordered w-full max-w-xs"
    bind:this={fileInput}
    on:change
  />
</label>
