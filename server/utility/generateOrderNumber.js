function generateOrderNumber(orderData, timezone) {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const currentDate = formatter.format(date);

  const filteredData = orderData.filter((item) =>
    item.orderNum.includes(currentDate)
  );

  if (filteredData.length === 0) {
    return `ORD/${currentDate}/001`;
  }

  const sequentialNumbers = filteredData.map((item) =>
    Number(item.orderNum.split("/")[2])
  );
  const newOrderNum = `ORD/${currentDate}/${String(
    sequentialNumbers[sequentialNumbers.length - 1] + 1
  ).padStart(3, "0")}`;

  return newOrderNum;
}

module.exports = { generateOrderNumber };
