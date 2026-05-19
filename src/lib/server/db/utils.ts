export function fuzzyQuery(text: string) {
  return "%" + text.replaceAll(/[اأؤإيىئءوةه]/g, "_").replaceAll(" ", "%") + "%";
}
