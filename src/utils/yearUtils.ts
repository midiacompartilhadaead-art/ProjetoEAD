/**
 * Utilitário para geração e manipulação dinâmica de anos no sistema.
 */

/**
 * Gera um array dinâmico de anos contínuos iniciando em 2026 até 2030.
 * @param startYear Ano inicial (padrão: 2026)
 * @param endYearFixed Ano final (padrão: 2030)
 * @returns Array de anos inteiros [2026, 2027, 2028, 2029, 2030]
 */
export const getDynamicYears = (startYear: number = 2026, endYearFixed: number = 2030): number[] => {
  const currentYear = new Date().getFullYear(); // 2026
  const start = Math.max(startYear, 2026);
  const end = Math.max(endYearFixed, 2030);
  const years: number[] = [];

  for (let y = start; y <= end; y++) {
    years.push(y);
  }

  return years;
};

/**
 * Retorna o ano atual em formato string (padrão 2026).
 */
export const getCurrentYearString = (): string => {
  const year = new Date().getFullYear();
  return year < 2026 ? '2026' : year.toString();
};
