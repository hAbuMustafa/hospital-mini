<div class="page-border"></div>

<style>
  .page-border {
    display: none;

    @media print {
      display: block;

      position: fixed;
      inset: 8px;
      border: 2px solid black;
      outline: 4px solid black;
      outline-offset: 4px;
      pointer-events: none;
      z-index: 1;
    }
  }
</style>
