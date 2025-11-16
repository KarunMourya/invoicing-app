import { Item } from "../services/item.service";

export type Order = "asc" | "desc";

export function descendingComparator<T>(
  a: T,
  b: T,
  orderBy: keyof T
): number {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

export function getComparator<T>(
  order: Order,
  orderBy: keyof T
): (a: T, b: T) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function filterAndSortItems(
  items: Item[],
  query: string,
  order: Order,
  orderBy: keyof Item
): Item[] {
  const q = query.trim().toLowerCase();

  const filtered = items.filter((it) =>
    q
      ? `${it.itemName} ${it.description ?? ""}`
          .toLowerCase()
          .includes(q)
      : true
  );

  const comparator = getComparator<Item>(order, orderBy);

  const sorted = [...filtered].sort((a, b) => {
    if (orderBy === "itemName") {
      if (a.itemName < b.itemName) return order === "asc" ? -1 : 1;
      if (a.itemName > b.itemName) return order === "asc" ? 1 : -1;
      return 0;
    }
    return comparator(a, b);
  });

  return sorted;
}
