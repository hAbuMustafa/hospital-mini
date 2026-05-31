<script lang="ts">
  import { authState } from "$lib/auth-client/auth.svelte";
</script>

<table class="signatures">
  <thead>
    <tr>
      <th>مشرف القسم</th>
      <th>طبيب صيدلي</th>
      <th>مدير الرعاية</th>
      <th>يعتمد،<br />مدير المستشفى/</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td></td>
      <td>{authState.user?.name}</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

<style>
  table.signatures {
    display: none;
    margin-top: 1rem;
    width: 80vw;

    thead {
      background-color: unset;
    }

    @media print {
      display: table;
    }
  }
</style>
