<script lang="ts">
  export let filterType: string;

  let choices = [
    [
      "walk_cycle_only",
      "Walking/cycling only",
      "A physical barrier that only allows people walking, cycling, and rolling to pass. Often planters or bollards. Larger vehicles cannot enter.",
    ],
    [
      "no_entry",
      "No entry",
      "An alternative sign to indicate vehicles are not allowed to enter the street. Only people walking, cycling, and rolling may pass through.",
    ],
    [
      "bus_gate",
      "Bus gate",
      "A bus gate sign and traffic cameras are installed to allow buses, pedestrians, and cyclists to pass. There is no physical barrier.",
    ],
    [
      "school_street",
      "School street",
      "A closure during school hours only. The barrier usually allows teachers and staff to access the school.",
    ],
  ];

  let dialog;
</script>

<dialog open on:close bind:this={dialog}>
  <div>
    <h3>Choose a modal filter to place on streets</h3>
    <table>
      <tr>
        <td>
          {#each choices as [name, label, description]}
            <div>
              <button
                style="width: 100%"
                disabled={filterType == name}
                on:click={() => (filterType = name)}
                ><img src={`/filters/${name}_icon.gif`} />{label}</button
              >
            </div>
          {/each}
        </td>
        <td>
          <img src={`/filters/${filterType}.gif`} height="300" />
          <p>{choices.find((x) => x[0] == filterType)[2]}</p>
        </td>
      </tr>
    </table>
    <center><button on:click={() => dialog.close()}>Confirm</button></center>
  </div>
</dialog>

<style>
  dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  div {
    width: 80%;
    height: 80%;
    background: white;
  }
</style>
