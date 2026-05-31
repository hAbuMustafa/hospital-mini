<script lang="ts">
  import { scale } from "svelte/transition";
  import { invoiceData } from "./state.svelte";

  type PropsT = {
    drug: InvoiceSelectedDrugT | InvoiceNarcoticDrugT;
    i: number;
  };

  let { drug, i }: PropsT = $props();
</script>

<tr
  class:hide-in-print={drug.amount === 0}
  class:amount-not-allowed={drug.amount %
    (drug.id === 166 ? 30 : drug.id === 198 ? 60 : 1) >
    0}
  transition:scale
>
  <td>
    {#if !drug.editable}
      {i + 1}
    {:else}
      <button
        onclick={() => {
          invoiceData.selectedDrugs = invoiceData.selectedDrugs.filter(
            (d) => d.id !== drug.id
          );
        }}
      >
        {i + 1}
      </button>
    {/if}
  </td>
  {#if !invoiceData.patient.insured}
    <td>{drug.smc_code}</td>
  {/if}
  <td>{drug.name_ar}</td>
  <td>
    {#if !drug.editable}
      {drug.amount}
    {:else}
      <input
        type="number"
        name="amount-{drug.id}"
        id="amount-{drug.id}"
        min="0"
        bind:value={drug.amount}
      />
    {/if}
  </td>
  <td>{drug.price_resale?.toFixed(2)}</td>
  <td>
    {#if typeof drug.total === "number"}
      {drug.total.toFixed(2)}
    {:else}
      {drug.total().toFixed(2)}
    {/if}
  </td>
</tr>

<style>
  tr {
    td {
      border: var(--main-border);
      padding-inline: 0.75rem;

      &:has(input[type="number"]) {
        padding: 0;

        & > input[type="number"] {
          box-sizing: border-box;
          width: 100%;
          text-align: center;

          @media print {
            appearance: textfield;
            border: none;
            font-size: 1rem;
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
          }
        }
      }

      &:has(> button) {
        padding: 0;

        & > button {
          all: unset;
          cursor: pointer;
          position: relative;
          width: 100%;

          &:is(:hover, :focus-within)::after {
            content: "❌";
            position: absolute;
            inset: 0;
            padding: 0;
            pointer-events: none;
          }

          &:focus-within {
            outline: 2px double var(--main-accent-color);
          }
        }
      }
    }

    &.amount-not-allowed {
      background-color: salmon;
      text-decoration: line-through;

      @media print {
        background-color: unset;
        text-decoration: unset;
      }
    }
  }
</style>
