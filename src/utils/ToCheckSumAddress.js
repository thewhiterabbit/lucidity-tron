export function toChecksumAddress (address) {
    if (typeof address === 'undefined') return '';

    address = address.toLowerCase().replace(/^0x/i,'');
    var addressHash = window.tronWeb.sha3(address).replace(/^0x/i,'');
    var checksumAddress = '0x';

    for (var i = 0; i < address.length; i++ ) {
        // If ith character is 9 to f then make it uppercase
        if (parseInt(addressHash[i], 16) > 7) {
            checksumAddress += address[i].toUpperCase();
        } else {
            checksumAddress += address[i];
        }
    }
    return checksumAddress;
}