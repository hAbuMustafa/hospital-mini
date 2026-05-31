<script lang="ts">
  type PropsT = { invoiceDrugs: (InvoiceNarcoticDrugT | InvoiceSelectedDrugT)[] };

  let { invoiceDrugs }: PropsT = $props();
</script>

<tfoot>
  <tr>
    <th colspan="3">إجمالي الأدوية المنصرفة:</th>
    <td colspan="3">
      {invoiceDrugs
        .reduce((acc, curr) => {
          if (typeof curr.total === "number") {
            return acc + curr.total;
          } else {
            return acc + curr.total();
          }
        }, 0)
        .toFixed(2)}
    </td>
  </tr>
</tfoot>

<style>
  tfoot {
    th {
      background-color: var(--main-table-header-bg-color);
      text-align: end;
    }

    th,
    td {
      border: var(--main-border);
      padding-inline: 0.75rem;
    }

    td {
      font-size: 1.5rem;
      font-weight: bold;
    }

    @media print {
      display: table-row-group; /* to prevent tfoot from repeating at the end of every table on a page */
    }
  }
</style>
