<div class="page-border"></div>

<style>
  .page-border {
    display: none;

    @media print {
      display: block;

      position: fixed;
      inset: 0;
      border: 3px double black;
      pointer-events: none;
      z-index: 9999;
    }
  }
</style>
