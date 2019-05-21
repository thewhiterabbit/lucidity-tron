export function FormatNumber(input){
    return input.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}
