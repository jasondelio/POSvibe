function CurrencyFormatterIDR(str){
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(str)
}

export {CurrencyFormatterIDR}