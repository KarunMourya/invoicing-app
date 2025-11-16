export const formatMoney = (value: number, symbol = "$") =>
  `${symbol}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;