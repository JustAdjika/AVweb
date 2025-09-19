type Props = {
  value: string;
  changeValue: (val: string) => void;
};

export default function PhoneInput({ value, changeValue }: Props) {
  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 11);

    let result = "+7";
    if (digits.length > 1) {
      result += " (" + digits.slice(1, 4);
    }
    if (digits.length >= 4) {
      result += ") " + digits.slice(4, 7);
    }
    if (digits.length >= 7) {
      result += " " + digits.slice(7, 9);
    }
    if (digits.length >= 9) {
      result += " " + digits.slice(9, 11);
    }
    return result;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const selectionStart = input.selectionStart ?? 0;

    // все цифры без форматирования
    const rawDigits = input.value.replace(/\D/g, "");
    // нормализация: всегда с 7
    const normalized =
      rawDigits.startsWith("7") || rawDigits.startsWith("8")
        ? "7" + rawDigits.slice(1)
        : "7" + rawDigits;

    const formatted = formatPhone(normalized);

    // считаем, сколько цифр было до курсора
    const digitsBeforeCursor = input.value
      .slice(0, selectionStart)
      .replace(/\D/g, "").length;

    changeValue(formatted);

    requestAnimationFrame(() => {
      if (input) {
        // позиция курсора в новой строке
        let pos = 0;
        let digitCount = 0;
        while (pos < formatted.length && digitCount < digitsBeforeCursor) {
          if (/\d/.test(formatted[pos])) digitCount++;
          pos++;
        }
        input.setSelectionRange(pos, pos);
      }
    });
  }

  return (
    <input
      type="tel"
      autoComplete="tel"
      value={value}
      onChange={handleChange}
      placeholder="+7 (___) ___ __ __"
    />
  );
}