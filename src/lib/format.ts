export function byn(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)}\u00A0BYN`;
}

export function rub(value: number) {
  return byn(value);
}
