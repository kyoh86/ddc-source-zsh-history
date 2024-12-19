export function unmetafy(input: string): string {
  const metaCharCode = 0x83;

  let result = '';
  let isMeta = false;

  for (const char of input) {
    const charCode = char.charCodeAt(0);
    if (isMeta) {
      // XORで元の文字を取得
      const decodedChar = String.fromCharCode(charCode ^ 0x20);
      result += decodedChar;
      isMeta = false;
    } else if (charCode === metaCharCode) {
      isMeta = true;
    } else {
      result += char;
    }
  }

  return result;
}
