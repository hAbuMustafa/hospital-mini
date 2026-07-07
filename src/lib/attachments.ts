import type { Attachment } from "svelte/attachments";

function handleFocus(e: Event) {
  (e.currentTarget as HTMLInputElement).select();
}

export function useKeyboardNavigation(
  selector: string,
  tableBody: HTMLElement
): Attachment<HTMLInputElement> {
  function handleKeydown(e: KeyboardEvent) {
    if (
      e.key !== "ArrowUp" &&
      e.key !== "ArrowDown" &&
      e.key !== "ArrowRight" &&
      e.key !== "ArrowLeft" &&
      e.key !== "Enter"
    )
      return;

    const similarNumberFields = Array.from(
      tableBody.querySelectorAll(`[id^="${selector}-"]`)
    ) as HTMLInputElement[];
    const allNumberFields = Array.from(
      tableBody.querySelectorAll('[type="number"]')
    ) as HTMLInputElement[];
    if (!similarNumberFields.length && !allNumberFields.length) return;

    const trigger = document.activeElement as HTMLInputElement;
    const currentSimilarIndex = similarNumberFields.indexOf(trigger!);
    const currentIndex = allNumberFields.indexOf(trigger!);

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();

        let prevSimilarIndex =
          (currentSimilarIndex - 1 + similarNumberFields.length) %
          similarNumberFields.length;
        similarNumberFields[prevSimilarIndex].focus();
        similarNumberFields[prevSimilarIndex].select();

        break;
      case "ArrowRight":
        if (e.ctrlKey) {
          e.preventDefault();
          let prevIndex =
            (currentIndex - 1 + allNumberFields.length) % allNumberFields.length;
          allNumberFields[prevIndex].focus();
          allNumberFields[prevIndex].select();
        }

        break;
      case "ArrowDown":
      case "Enter":
        e.preventDefault();

        let nextSimilarIndex = (currentSimilarIndex + 1) % similarNumberFields.length;
        similarNumberFields[nextSimilarIndex].focus();
        similarNumberFields[nextSimilarIndex].select();

        break;
      case "ArrowLeft":
        if (e.ctrlKey) {
          e.preventDefault();
          let nextIndex = (currentIndex + 1) % allNumberFields.length;
          allNumberFields[nextIndex].focus();
          allNumberFields[nextIndex].select();
        }

        break;
      default:
        break;
    }
  }

  return (node) => {
    node.addEventListener("keydown", handleKeydown);
    node.addEventListener("focus", handleFocus);

    return () => {
      node.removeEventListener("keydown", handleKeydown);
      node.removeEventListener("focus", handleFocus);
    };
  };
}

export function useComboboxKeyboardNavigation(
  inputNode: HTMLInputElement,
  listNode: HTMLElement
): Attachment<HTMLElement> {
  function handleKeydown(e: KeyboardEvent) {
    if (
      e.key !== "ArrowUp" &&
      e.key !== "ArrowDown" &&
      e.key !== "Escape" &&
      e.key !== "Tab"
    )
      return;

    e.preventDefault();

    const items = Array.from(
      listNode.querySelectorAll("li>button")
    ) as HTMLButtonElement[];
    if (!items.length) return;

    const trigger = document.activeElement as HTMLButtonElement;
    const currentIndex = items.indexOf(trigger!);

    switch (e.key) {
      case "ArrowUp":
        let prevIndex = (currentIndex - 1 + items.length) % items.length;
        items[prevIndex].focus();

        break;
      case "ArrowDown":
        let nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].focus();
        break;

      case "Escape":
        inputNode.focus();
        inputNode.select();
        break;
      case "Tab":
        if (e.shiftKey) {
          inputNode.focus();
          inputNode.select();
        }
        break;

      default:
        break;
    }
  }

  return (node) => {
    node.addEventListener("keydown", handleKeydown);
    inputNode.addEventListener("focus", handleFocus);

    return () => {
      node.removeEventListener("keydown", handleKeydown);
      inputNode.removeEventListener("focus", handleFocus);
    };
  };
}

export function returnToInputAfterSelection(
  inputNode: HTMLInputElement
): Attachment<HTMLElement> {
  function handleButtonClick(e: Event) {
    if (!(e.target instanceof HTMLButtonElement)) return;

    inputNode.focus();
    inputNode.select();
  }

  return (node) => {
    node.addEventListener("click", handleButtonClick);
    return () => {
      node.removeEventListener("click", handleButtonClick);
    };
  };
}
