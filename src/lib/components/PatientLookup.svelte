<script lang="ts">
  import { debounce } from "lodash-es";

  let { patientSnippet, query = $bindable("") } = $props();

  let matches: PatientT[] = $state([]);
</script>

<div class="patient-lookup">
  <input
    type="search"
    placeholder="اسم المريض"
    bind:value={query}
    oninput={debounce(async () => {
      if (query === "") return;

      matches = await fetch(`/api/v1/patient?q=${query}`).then((data) => data.json());
    }, 500)}
  />
  {#if matches.length}
    <ul class="patient-list">
      {#each matches as patient (patient.id)}
        <li>
          {@render patientSnippet(patient)}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .patient-lookup {
    margin-block: 1rem;
    position: relative;

    input {
      width: 100%;
      font-size: 2rem;
      text-align: center;
      anchor-name: --drug-lookup-input;
      margin-block-end: 2rem;

      &::placeholder {
        font-size: 1rem;
      }
    }

    &:not(:focus-within) ul.patient-list {
      display: none;
    }
  }

  ul.patient-list {
    inset: unset;
    position: absolute;
    inset-block-start: calc(anchor(bottom) + 0.25rem);
    justify-self: anchor-center;
    position-anchor: --drug-lookup-input;
    position-try-fallbacks: --bottom-center, --top-center;

    width: 100%;
    max-height: 50svh;
    overflow-y: scroll;

    list-style: none;
    padding: 0;
    border: var(--main-border);
    box-shadow: var(--main-shadow);
    margin: 0;

    display: flex;
    flex-direction: column;
    flex: 1;

    background-color: var(--menu-bg-color);

    z-index: 1;

    li:not(:first-of-type) {
      border-block-start: var(--main-border);
    }
  }
</style>
