<script lang="ts">
  import type { drugs } from '$lib/server/db/schema';

  type PropsT = {
    item: typeof drugs.$inferSelect;
    pricing: 'default' | 'cash';
  };

  let { item = $bindable(), pricing = 'default' }: PropsT = $props();
</script>

<tr>
  <td class="item-index"></td>
  <td class="item-smc"></td>
  <td class="item-name"></td>
  <td class="item-amount"></td>
  <td class="item-price"></td>
  <td class="item-total"></td>
</tr>
